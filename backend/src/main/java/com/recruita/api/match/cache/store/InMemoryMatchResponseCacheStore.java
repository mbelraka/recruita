package com.recruita.api.match.cache.store;

import com.recruita.api.match.evaluation.MatchEvaluationResult;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
    prefix = "recruita.match.cache",
    name = "store",
    havingValue = "memory",
    matchIfMissing = true)
public class InMemoryMatchResponseCacheStore implements MatchResponseCacheStore {

  private final Map<String, MatchEvaluationResult> cache = new ConcurrentHashMap<>();

  @Override
  public Optional<MatchEvaluationResult> get(String cacheKey) {
    MatchEvaluationResult cached = cache.get(cacheKey);
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
