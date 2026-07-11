package com.recruita.api.match.service;

import com.recruita.api.api.dto.match.MatchRequestDto;
import com.recruita.api.match.cache.MatchResponseCache;
import com.recruita.api.match.domain.MatchRequest;
import com.recruita.api.match.evaluation.MatchEvaluationResult;
import com.recruita.api.match.evaluation.MatchEvaluationRouter;
import com.recruita.api.match.mapper.MatchRequestMapper;
import com.recruita.api.match.normalization.CandidateNormalizationService;
import com.recruita.api.match.validation.MatchRequestPolicyValidator;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class DefaultMatchApplicationService implements MatchApplicationService {

  private final MatchRequestPolicyValidator policyValidator;
  private final MatchRequestMapper requestMapper;
  private final CandidateNormalizationService normalizationService;
  private final MatchEvaluationRouter evaluationRouter;
  private final MatchResponseCache responseCache;

  public DefaultMatchApplicationService(
      MatchRequestPolicyValidator policyValidator,
      MatchRequestMapper requestMapper,
      CandidateNormalizationService normalizationService,
      MatchEvaluationRouter evaluationRouter,
      MatchResponseCache responseCache) {
    this.policyValidator = policyValidator;
    this.requestMapper = requestMapper;
    this.normalizationService = normalizationService;
    this.evaluationRouter = evaluationRouter;
    this.responseCache = responseCache;
  }

  @Override
  public MatchEvaluationResult evaluate(MatchRequestDto requestDto) {
    policyValidator.validate(requestDto);
    MatchRequest request = requestMapper.toDomain(requestDto);
    var normalized = normalizationService.normalize(request.candidates());

    Optional<MatchEvaluationResult> cached = responseCache.get(request, normalized);
    if (cached.isPresent()) {
      return cached.get();
    }

    MatchEvaluationResult result = evaluationRouter.evaluate(request, normalized);
    responseCache.put(request, normalized, result);
    return result;
  }

  @Override
  public void invalidateMatchCache() {
    responseCache.invalidateAll();
  }
}
