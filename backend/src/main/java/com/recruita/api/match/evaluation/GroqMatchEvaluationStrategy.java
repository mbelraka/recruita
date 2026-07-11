package com.recruita.api.match.evaluation;

import com.recruita.api.match.domain.MatchCandidate;
import com.recruita.api.match.domain.MatchRequest;
import com.recruita.api.match.groq.GroqMatchEvaluationService;
import com.recruita.api.match.normalization.MatchResponseNormalizer;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class GroqMatchEvaluationStrategy implements MatchEvaluationStrategy {

  private final GroqMatchEvaluationService groqMatchEvaluationService;
  private final MatchResponseNormalizer responseNormalizer;

  public GroqMatchEvaluationStrategy(
      GroqMatchEvaluationService groqMatchEvaluationService,
      MatchResponseNormalizer responseNormalizer) {
    this.groqMatchEvaluationService = groqMatchEvaluationService;
    this.responseNormalizer = responseNormalizer;
  }

  @Override
  public boolean supports(boolean deterministic) {
    return !deterministic;
  }

  @Override
  public MatchEvaluationResult evaluate(
      MatchRequest request, List<MatchCandidate> normalizedCandidates) {
    return new MatchEvaluationResult.Deterministic(
        responseNormalizer.normalize(
            groqMatchEvaluationService.evaluate(request, normalizedCandidates)));
  }
}
