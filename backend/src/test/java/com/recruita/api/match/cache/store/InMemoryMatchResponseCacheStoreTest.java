package com.recruita.api.match.cache.store;

import static org.junit.jupiter.api.Assertions.assertTrue;

import com.github.benmanes.caffeine.cache.Ticker;
import com.recruita.api.api.dto.match.MatchResponseDto;
import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.match.evaluation.MatchEvaluationResult;
import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.Test;

class InMemoryMatchResponseCacheStoreTest {

  private static final long TTL_SECONDS = 60;
  private static final Duration JUST_BEFORE_TTL = Duration.ofSeconds(TTL_SECONDS).minusSeconds(1);
  private static final Duration JUST_AFTER_TTL = Duration.ofSeconds(TTL_SECONDS).plusSeconds(1);
  private static final String CACHE_KEY = "match-cache-key";

  private final StepTicker ticker = new StepTicker();
  private final InMemoryMatchResponseCacheStore store = newStore(ticker);

  @Test
  void returnsCachedValueBeforeTtlElapses() {
    store.put(CACHE_KEY, deterministicResult());

    ticker.advance(JUST_BEFORE_TTL);

    assertTrue(store.get(CACHE_KEY).isPresent());
  }

  @Test
  void expiresCachedValueAfterTtlElapses() {
    store.put(CACHE_KEY, deterministicResult());

    ticker.advance(JUST_AFTER_TTL);

    assertTrue(store.get(CACHE_KEY).isEmpty());
  }

  private static InMemoryMatchResponseCacheStore newStore(Ticker ticker) {
    RecruitaProperties properties = new RecruitaProperties();
    properties.getMatch().getCache().setTtlSeconds(TTL_SECONDS);
    return new InMemoryMatchResponseCacheStore(properties, ticker);
  }

  private static MatchEvaluationResult deterministicResult() {
    return new MatchEvaluationResult.Deterministic(new MatchResponseDto(List.of()));
  }

  private static final class StepTicker implements Ticker {
    private long nanos;

    @Override
    public long read() {
      return nanos;
    }

    private void advance(Duration duration) {
      nanos += duration.toNanos();
    }
  }
}
