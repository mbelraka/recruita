package com.recruita.api.match.evaluation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.recruita.api.api.dto.match.MatchResponseDto;

/** Typed union of deterministic DTO vs Groq JSON passthrough. */
@JsonSerialize(using = MatchEvaluationResultSerializer.class)
public sealed interface MatchEvaluationResult
    permits MatchEvaluationResult.Deterministic, MatchEvaluationResult.Groq {

  Object responseBody();

  int scoreCount(String matchResponseScoresField);

  record Deterministic(MatchResponseDto value) implements MatchEvaluationResult {

    @Override
    public Object responseBody() {
      return value;
    }

    @Override
    public int scoreCount(String matchResponseScoresField) {
      return value.scores().size();
    }
  }

  record Groq(JsonNode value) implements MatchEvaluationResult {

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
}
