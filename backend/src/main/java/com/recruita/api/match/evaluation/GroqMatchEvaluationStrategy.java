package com.recruita.api.match.evaluation;

import com.recruita.api.match.domain.MatchCandidate;
import com.recruita.api.match.domain.MatchRequest;
import com.recruita.api.match.groq.GroqMatchEvaluationService;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class GroqMatchEvaluationStrategy implements MatchEvaluationStrategy {

  private final GroqMatchEvaluationService groqMatchEvaluationService;

  public GroqMatchEvaluationStrategy(GroqMatchEvaluationService groqMatchEvaluationService) {
    this.groqMatchEvaluationService = groqMatchEvaluationService;
  }

  @Override
  public boolean supports(boolean deterministic) {
    return !deterministic;
  }

  @Override
  public MatchEvaluationResult evaluate(
      MatchRequest request, List<MatchCandidate> normalizedCandidates) {
    return new MatchEvaluationResult.Groq(
        groqMatchEvaluationService.evaluate(request, normalizedCandidates));
  }
}
