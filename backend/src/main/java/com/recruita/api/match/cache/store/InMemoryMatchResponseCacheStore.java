package com.recruita.api.match.cache.store;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.Ticker;
import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.match.evaluation.MatchEvaluationResult;
import java.time.Duration;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
    prefix = "recruita.match.cache",
    name = "store",
    havingValue = "memory",
    matchIfMissing = true)
public class InMemoryMatchResponseCacheStore implements MatchResponseCacheStore {

  private final Cache<String, MatchEvaluationResult> cache;

  @Autowired
  public InMemoryMatchResponseCacheStore(RecruitaProperties properties) {
    this(properties, Ticker.systemTicker());
  }

  /** Visible for tests: a fake {@link Ticker} lets TTL expiry be exercised without sleeping. */
  InMemoryMatchResponseCacheStore(RecruitaProperties properties, Ticker ticker) {
    var cacheProperties = properties.getMatch().getCache();
    this.cache =
        Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofSeconds(cacheProperties.getTtlSeconds()))
            .maximumSize(cacheProperties.getMaxEntries())
            .ticker(ticker)
            .build();
  }

  @Override
  public Optional<MatchEvaluationResult> get(String cacheKey) {
    MatchEvaluationResult cached = cache.getIfPresent(cacheKey);
    return cached == null ? Optional.empty() : Optional.of(copy(cached));
  }

  @Override
  public void put(String cacheKey, MatchEvaluationResult value) {
    cache.put(cacheKey, copy(value));
  }

  private static MatchEvaluationResult copy(MatchEvaluationResult result) {
    return switch (result) {
      case MatchEvaluationResult.Deterministic deterministic -> deterministic;
      case MatchEvaluationResult.Groq groq ->
          new MatchEvaluationResult.Groq(groq.value().deepCopy());
    };
  }
}
