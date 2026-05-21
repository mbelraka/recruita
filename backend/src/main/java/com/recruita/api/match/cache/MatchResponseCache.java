package com.recruita.api.match.cache;

import com.recruita.api.config.properties.MatchCacheKeyProperties;
import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.match.cache.store.MatchResponseCacheStore;
import com.recruita.api.match.domain.MatchCandidate;
import com.recruita.api.match.domain.MatchRequest;
import com.recruita.api.match.evaluation.MatchEvaluationResult;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class MatchResponseCache {

  private final MatchResponseCacheStore store;
  private final StableJsonCanonicalizer canonicalizer;
  private final MatchCacheKeyProperties keyFields;
  private final boolean enabled;

  public MatchResponseCache(
      RecruitaProperties properties,
      StableJsonCanonicalizer canonicalizer,
      MatchResponseCacheStore store) {
    this.enabled = properties.getMatch().getCache().isEnabled();
    this.canonicalizer = canonicalizer;
    this.keyFields = properties.getMatch().getCache().getKeyFields();
    this.store = store;
  }

  public Optional<MatchEvaluationResult> get(
      MatchRequest request, List<MatchCandidate> normalizedCandidates) {
    if (!enabled) {
      return Optional.empty();
    }
    return store.get(cacheKey(request, normalizedCandidates));
  }

  public void put(
      MatchRequest request,
      List<MatchCandidate> normalizedCandidates,
      MatchEvaluationResult response) {
    if (!enabled) {
      return;
    }
    store.put(cacheKey(request, normalizedCandidates), response);
  }

  private String cacheKey(MatchRequest request, List<MatchCandidate> normalizedCandidates) {
    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put(keyFields.getJobDescription(), request.jobDescription());
    payload.put(keyFields.getCandidates(), normalizedCandidates);
    payload.put(keyFields.getModel(), request.model());
    payload.put(keyFields.getTemperature(), request.temperature());
    payload.put(keyFields.getTopP(), request.topP());
    payload.put(keyFields.getSeed(), request.seed());
    payload.put(keyFields.getDeterministic(), request.deterministic());
    return canonicalizer.canonicalize(payload);
  }
}
