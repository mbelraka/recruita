package com.recruita.api.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.Ticker;
import com.recruita.api.api.advice.ApiProblemDetailSupport;
import com.recruita.api.common.problem.ApiProblemType;
import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.config.properties.SecurityProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Clock;
import java.time.Duration;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class MatchRateLimitFilter extends OncePerRequestFilter {

  private final SecurityProperties.RateLimitProperties rateLimit;
  private final SecurityProperties.HttpProperties http;
  private final String matchPath;
  private final String matchLegacyPath;
  private final ApiProblemDetailSupport problemDetailSupport;
  private final ObjectMapper objectMapper;
  private final Clock clock;
  private final Cache<String, WindowCounter> counters;

  @Autowired
  public MatchRateLimitFilter(
      RecruitaProperties properties,
      ApiProblemDetailSupport problemDetailSupport,
      ObjectMapper objectMapper) {
    this(properties, problemDetailSupport, objectMapper, Clock.systemUTC());
  }

  /** Visible for tests: a fixed/offset {@link Clock} lets window expiry be exercised. */
  MatchRateLimitFilter(
      RecruitaProperties properties,
      ApiProblemDetailSupport problemDetailSupport,
      ObjectMapper objectMapper,
      Clock clock) {
    this.rateLimit = properties.getSecurity().getRateLimit();
    this.http = properties.getSecurity().getHttp();
    this.matchPath = properties.getApi().getRoutes().getMatchPath();
    this.matchLegacyPath = properties.getApi().getRoutes().getMatchLegacyPath();
    this.problemDetailSupport = problemDetailSupport;
    this.objectMapper = objectMapper;
    this.clock = clock;
    this.counters =
        Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMillis(rateLimit.windowMillis()))
            .ticker(tickerFromClock(clock))
            .build();
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    if (!http.getMatchRequestMethod().equalsIgnoreCase(request.getMethod())) {
      return true;
    }
    String path = request.getRequestURI();
    return !matchPath.equals(path) && !matchLegacyPath.equals(path);
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    counters.cleanUp();
    String clientKey = resolveClientKey(request);
    if (isAtDistinctClientCapacity(clientKey)) {
      rejectRateLimited(response, rateLimit.getExceededMessage());
      return;
    }

    long nowEpochMs = clock.millis();
    long windowMs = rateLimit.windowMillis();
    WindowCounter existing = counters.getIfPresent(clientKey);
    WindowCounter counter = WindowCounter.rotate(existing, windowMs, nowEpochMs);
    if (counter != existing) {
      counters.put(clientKey, counter);
    }

    int count = counter.count.incrementAndGet();
    int maxRequests = rateLimit.resolvedMaxRequests();
    writeRateLimitHeaders(
        response, maxRequests, Math.max(0, maxRequests - count), counter.windowStartEpochMs);

    if (count > maxRequests) {
      rejectRateLimited(response, rateLimit.getExceededMessage());
      return;
    }

    filterChain.doFilter(request, response);
  }

  private boolean isAtDistinctClientCapacity(String clientKey) {
    return counters.getIfPresent(clientKey) == null
        && counters.estimatedSize() >= rateLimit.resolvedMaxDistinctClients();
  }

  private void rejectRateLimited(HttpServletResponse response, String message) throws IOException {
    ProblemDetail problem =
        problemDetailSupport.create(
            HttpStatus.TOO_MANY_REQUESTS, ApiProblemType.RATE_LIMIT_EXCEEDED, message);
    response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
    response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
    objectMapper.writeValue(response.getOutputStream(), problem);
  }

  private String resolveClientKey(HttpServletRequest request) {
    return request.getRemoteAddr();
  }

  private void writeRateLimitHeaders(
      HttpServletResponse response, int limit, int remaining, long windowStartEpochMs) {
    long resetEpochSeconds =
        (windowStartEpochMs + rateLimit.windowMillis()) / http.getMillisecondsPerSecond();
    response.setHeader(rateLimit.getHeaderLimit(), String.valueOf(limit));
    response.setHeader(rateLimit.getHeaderRemaining(), String.valueOf(remaining));
    response.setHeader(rateLimit.getHeaderReset(), String.valueOf(resetEpochSeconds));
  }

  private static Ticker tickerFromClock(Clock clock) {
    return () -> TimeUnit.MILLISECONDS.toNanos(clock.millis());
  }

  private static final class WindowCounter {
    private final long windowStartEpochMs;
    private final AtomicInteger count;

    private WindowCounter(long windowStartEpochMs, AtomicInteger count) {
      this.windowStartEpochMs = windowStartEpochMs;
      this.count = count;
    }

    private static WindowCounter rotate(WindowCounter existing, long windowMs, long nowEpochMs) {
      if (existing == null || nowEpochMs - existing.windowStartEpochMs >= windowMs) {
        return new WindowCounter(nowEpochMs, new AtomicInteger(0));
      }
      return existing;
    }
  }
}
