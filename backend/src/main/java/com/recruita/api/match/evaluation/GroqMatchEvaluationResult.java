package com.recruita.api.match.evaluation;

import com.fasterxml.jackson.databind.JsonNode;

public record GroqMatchEvaluationResult(JsonNode value) implements MatchEvaluationResult {

  @Override
  public Object responseBody() {
    return value;
  }

  @Override
  public int scoreCount(String matchResponseScoresField) {
    JsonNode scores = value.path(matchResponseScoresField);
    return scores.isArray() ? scores.size() : 0;
  }
}
