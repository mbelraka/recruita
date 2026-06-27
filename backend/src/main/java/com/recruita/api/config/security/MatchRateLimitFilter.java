package com.recruita.api.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.config.properties.SecurityProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Clock;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
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
  private final String errorPropertyKey;
  private final ObjectMapper objectMapper;
  private final Clock clock;
  private final Map<String, WindowCounter> counters = new ConcurrentHashMap<>();

  @Autowired
  public MatchRateLimitFilter(RecruitaProperties properties, ObjectMapper objectMapper) {
    this(properties, objectMapper, Clock.systemUTC());
  }

  /** Visible for tests: a fixed/offset {@link Clock} lets window expiry be exercised. */
  MatchRateLimitFilter(RecruitaProperties properties, ObjectMapper objectMapper, Clock clock) {
    this.rateLimit = properties.getSecurity().getRateLimit();
    this.http = properties.getSecurity().getHttp();
    this.matchPath = properties.getApi().getRoutes().getMatchPath();
    this.matchLegacyPath = properties.getApi().getRoutes().getMatchLegacyPath();
    this.errorPropertyKey = properties.getApi().getProblemDetail().getErrorPropertyKey();
    this.objectMapper = objectMapper;
    this.clock = clock;
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
    String clientKey = resolveClientKey(request);
    if (isAtDistinctClientCapacity(clientKey)) {
      evictExpiredWindows();
      if (isAtDistinctClientCapacity(clientKey)) {
        rejectRateLimited(response, rateLimit.getExceededMessage());
        return;
      }
    }

    WindowCounter counter =
        counters.compute(
            clientKey,
            (key, existing) ->
                WindowCounter.rotate(existing, rateLimit.windowMillis(), clock.millis()));

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
    return !counters.containsKey(clientKey)
        && counters.size() >= rateLimit.resolvedMaxDistinctClients();
  }

  /**
   * Drops counters whose window has elapsed so the distinct-client cap only counts active clients.
   * Without this, the map fills up once and every new client is rejected forever.
   */
  private void evictExpiredWindows() {
    long now = clock.millis();
    long windowMs = rateLimit.windowMillis();
    counters.values().removeIf(counter -> now - counter.windowStartEpochMs >= windowMs);
  }

  private void rejectRateLimited(HttpServletResponse response, String message) throws IOException {
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.TOO_MANY_REQUESTS, message);
    problem.setProperty(errorPropertyKey, message);
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
