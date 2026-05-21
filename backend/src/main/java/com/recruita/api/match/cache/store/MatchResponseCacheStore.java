package com.recruita.api.match.cache.store;

import com.recruita.api.match.evaluation.MatchEvaluationResult;
import java.util.Optional;

public interface MatchResponseCacheStore {

  Optional<MatchEvaluationResult> get(String cacheKey);

  void put(String cacheKey, MatchEvaluationResult value);
}
