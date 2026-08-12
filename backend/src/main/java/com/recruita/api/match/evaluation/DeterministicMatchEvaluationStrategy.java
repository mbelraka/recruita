package com.recruita.api.match.evaluation;

import com.recruita.api.match.domain.MatchCandidate;
import com.recruita.api.match.domain.MatchRequest;
import com.recruita.api.match.mapper.MatchResponseMapper;
import com.recruita.api.match.scoring.MatchScoringRouter;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class DeterministicMatchEvaluationStrategy implements MatchEvaluationStrategy {

  private final MatchScoringRouter scoringRouter;
  private final MatchResponseMapper responseMapper;

  public DeterministicMatchEvaluationStrategy(
      MatchScoringRouter scoringRouter, MatchResponseMapper responseMapper) {
    this.scoringRouter = scoringRouter;
    this.responseMapper = responseMapper;
  }

  @Override
  public boolean supports(boolean deterministic) {
    return deterministic;
  }

  @Override
  public MatchEvaluationResult evaluate(
      MatchRequest request, List<MatchCandidate> normalizedCandidates) {
    var scores = scoringRouter.score(true, request.jobDescription(), normalizedCandidates);
    return new DeterministicMatchEvaluationResult(responseMapper.toDto(scores));
  }
}
