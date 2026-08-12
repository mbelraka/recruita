package com.recruita.api.match.evaluation;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;

/** Typed union of deterministic DTO vs Groq JSON passthrough. */
@JsonSerialize(using = MatchEvaluationResultSerializer.class)
public sealed interface MatchEvaluationResult
    permits DeterministicMatchEvaluationResult, GroqMatchEvaluationResult {

  Object responseBody();

  int scoreCount(String matchResponseScoresField);
}
