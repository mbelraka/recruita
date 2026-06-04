package com.recruita.api.match.evaluation;

import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.recruita.api.api.dto.match.MatchResponseDto;
import com.recruita.api.api.dto.match.MatchScoreDto;
import java.util.List;
import org.junit.jupiter.api.Test;

class MatchEvaluationResultSerializerTest {

  private final ObjectMapper objectMapper = new ObjectMapper();

  @Test
  void serializesDeterministicResponseBody() throws Exception {
    MatchEvaluationResult result =
        new MatchEvaluationResult.Deterministic(
            new MatchResponseDto(
                List.of(new MatchScoreDto("a", 80, List.of(), List.of(), null, ""))));

    String json = objectMapper.writeValueAsString(result);

    assertTrue(json.contains("\"scores\""));
    assertTrue(json.contains("\"id\":\"a\""));
  }

  @Test
  void serializesGroqResponseBody() throws Exception {
    MatchEvaluationResult result =
        new MatchEvaluationResult.Groq(
            JsonNodeFactory.instance.objectNode().put("provider", "groq"));

    String json = objectMapper.writeValueAsString(result);

    assertTrue(json.contains("\"provider\":\"groq\""));
  }
}
