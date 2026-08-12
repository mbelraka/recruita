package com.recruita.api.match.evaluation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;

class GroqMatchEvaluationResultTest {

  private static final String SCORES_FIELD = "scores";

  @Test
  void responseBodyReturnsTheJsonNode() {
    ObjectNode value = JsonNodeFactory.instance.objectNode();
    GroqMatchEvaluationResult result = new GroqMatchEvaluationResult(value);

    assertSame(value, result.responseBody());
  }

  @Test
  void scoreCountReturnsArraySize() {
    ArrayNode scores = JsonNodeFactory.instance.arrayNode().add(1).add(2);
    ObjectNode value = JsonNodeFactory.instance.objectNode().set(SCORES_FIELD, scores);

    assertEquals(2, new GroqMatchEvaluationResult(value).scoreCount(SCORES_FIELD));
  }

  @Test
  void scoreCountReturnsZeroWhenScoresAreNotAnArray() {
    ObjectNode value = JsonNodeFactory.instance.objectNode().put(SCORES_FIELD, 1);
    JsonNode missingScores = JsonNodeFactory.instance.objectNode();

    assertEquals(0, new GroqMatchEvaluationResult(value).scoreCount(SCORES_FIELD));
    assertEquals(0, new GroqMatchEvaluationResult(missingScores).scoreCount(SCORES_FIELD));
  }
}
