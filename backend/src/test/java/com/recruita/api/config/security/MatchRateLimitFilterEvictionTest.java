package com.recruita.api.config.security;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruita.api.config.properties.RecruitaProperties;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

/**
 * Regression test: counters for clients whose rate-limit window has elapsed must be evicted when
 * the distinct-client cap is hit, otherwise new clients are locked out permanently and the map
 * grows without bound.
 */
class MatchRateLimitFilterEvictionTest {

  private static final int MAX_DISTINCT_CLIENTS = 1;
  private static final int WINDOW_MINUTES = 1;
  private static final Duration PAST_WINDOW_END = Duration.ofMinutes(WINDOW_MINUTES).plusSeconds(1);
  private static final Instant WINDOW_START = Instant.parse("2026-01-01T00:00:00Z");
  private static final String FIRST_CLIENT_ADDRESS = "10.0.0.1";
  private static final String SECOND_CLIENT_ADDRESS = "10.0.0.2";

  private final RecruitaProperties properties = rateLimitedProperties();
  private final MutableClock clock = new MutableClock(WINDOW_START);
  private final MatchRateLimitFilter filter =
      new MatchRateLimitFilter(properties, new ObjectMapper(), clock);

  @Test
  void admitsNewClientAfterStaleWindowsAreEvicted() throws Exception {
    assertEquals(HttpStatus.OK.value(), performMatchRequest(FIRST_CLIENT_ADDRESS));
    assertEquals(HttpStatus.TOO_MANY_REQUESTS.value(), performMatchRequest(SECOND_CLIENT_ADDRESS));

    clock.advance(PAST_WINDOW_END);

    assertEquals(HttpStatus.OK.value(), performMatchRequest(SECOND_CLIENT_ADDRESS));
  }

  private int performMatchRequest(String clientAddress) throws Exception {
    MockHttpServletRequest request =
        new MockHttpServletRequest(
            properties.getSecurity().getHttp().getMatchRequestMethod(),
            properties.getApi().getRoutes().getMatchPath());
    request.setRemoteAddr(clientAddress);
    MockHttpServletResponse response = new MockHttpServletResponse();

    filter.doFilterInternal(request, response, new MockFilterChain());

    return response.getStatus();
  }

  private static RecruitaProperties rateLimitedProperties() {
    RecruitaProperties properties = new RecruitaProperties();
    properties.getSecurity().getRateLimit().setMaxDistinctClients(MAX_DISTINCT_CLIENTS);
    properties.getSecurity().getRateLimit().setWindowMinutes(WINDOW_MINUTES);
    return properties;
  }

  private static final class MutableClock extends Clock {
    private Instant instant;

    private MutableClock(Instant start) {
      this.instant = start;
    }

    @Override
    public ZoneId getZone() {
      return ZoneOffset.UTC;
    }

    @Override
    public Clock withZone(ZoneId zone) {
      return this;
    }

    @Override
    public Instant instant() {
      return instant;
    }

    private void advance(Duration duration) {
      instant = instant.plus(duration);
    }
  }
}
