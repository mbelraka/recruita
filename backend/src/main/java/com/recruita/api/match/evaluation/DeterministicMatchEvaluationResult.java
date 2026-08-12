package com.recruita.api.match.evaluation;

import com.recruita.api.api.dto.match.MatchResponseDto;

public record DeterministicMatchEvaluationResult(MatchResponseDto value)
    implements MatchEvaluationResult {

  @Override
  public Object responseBody() {
    return value;
  }

  @Override
  public int scoreCount(String matchResponseScoresField) {
    return value.scores().size();
  }
}
