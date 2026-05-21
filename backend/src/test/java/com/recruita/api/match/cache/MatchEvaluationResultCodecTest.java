package com.recruita.api.match.cache;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruita.api.api.dto.match.MatchResponseDto;
import com.recruita.api.api.dto.match.MatchScoreDto;
import com.recruita.api.match.evaluation.MatchEvaluationResult;
import java.util.List;
import org.junit.jupiter.api.Test;

class MatchEvaluationResultCodecTest {

  private final MatchEvaluationResultCodec codec =
      new MatchEvaluationResultCodec(new ObjectMapper());

  @Test
  void roundTripsDeterministicResults() {
    MatchResponseDto response =
        new MatchResponseDto(
            List.of(
                new MatchScoreDto(
                    "a",
                    80,
                    List.of("java"),
                    List.of(),
                    new MatchScoreDto.CandidateProfileDto(List.of("java"), 1.0, List.of("Dev"), ""),
                    "ok")));

    MatchEvaluationResult encoded = new MatchEvaluationResult.Deterministic(response);
    MatchEvaluationResult decoded = codec.decode(codec.encode(encoded));

    assertInstanceOf(MatchEvaluationResult.Deterministic.class, decoded);
    assertEquals(
        80,
        ((MatchEvaluationResult.Deterministic) decoded).value().scores().getFirst().matchScore());
  }

  @Test
  void roundTripsGroqResults() {
    MatchEvaluationResult encoded =
        new MatchEvaluationResult.Groq(
            new ObjectMapper().createObjectNode().put("scores", 1).put("ok", true));

    MatchEvaluationResult decoded = codec.decode(codec.encode(encoded));

    assertInstanceOf(MatchEvaluationResult.Groq.class, decoded);
    assertEquals(1, ((MatchEvaluationResult.Groq) decoded).value().path("scores").asInt());
  }
}
