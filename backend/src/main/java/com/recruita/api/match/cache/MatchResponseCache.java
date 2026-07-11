package com.recruita.api.match.cache;

import com.recruita.api.applicant.roster.RosterVersionService;
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
  private final RosterVersionService rosterVersionService;
  private final com.recruita.api.config.properties.MatchCacheKeyProperties keyFields;
  private final String schemaVersion;
  private final boolean enabled;

  public MatchResponseCache(
      RecruitaProperties properties,
      StableJsonCanonicalizer canonicalizer,
      MatchResponseCacheStore store,
      RosterVersionService rosterVersionService) {
    var cache = properties.getMatch().getCache();
    this.enabled = cache.isEnabled();
    this.canonicalizer = canonicalizer;
    this.keyFields = cache.getKeyFields();
    this.schemaVersion = cache.getSchemaVersion();
    this.store = store;
    this.rosterVersionService = rosterVersionService;
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

  public void invalidateAll() {
    if (!enabled) {
      return;
    }
    store.invalidateAll();
  }

  private String cacheKey(MatchRequest request, List<MatchCandidate> normalizedCandidates) {
    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put(keyFields.getSchemaVersion(), schemaVersion);
    payload.put(keyFields.getRosterVersion(), rosterVersionService.current());
    payload.put(keyFields.getJobDescription(), request.jobDescription());
    payload.put(keyFields.getCandidates(), normalizedCandidates);
    payload.put(keyFields.getModel(), request.model());
    payload.put(keyFields.getTemperature(), request.temperature());
    payload.put(keyFields.getTopP(), request.topP());
    payload.put(keyFields.getSeed(), request.seed());
    payload.put(keyFields.getDeterministic(), request.deterministic());
    return MatchCacheKeyHasher.sha256Hex(canonicalizer.canonicalize(payload));
  }
}
