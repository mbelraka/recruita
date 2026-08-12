package com.recruita.api.match.cache;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruita.api.api.dto.match.CandidateProfileDto;
import com.recruita.api.api.dto.match.MatchResponseDto;
import com.recruita.api.api.dto.match.MatchScoreDto;
import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.match.evaluation.DeterministicMatchEvaluationResult;
import com.recruita.api.match.evaluation.GroqMatchEvaluationResult;
import com.recruita.api.match.evaluation.MatchEvaluationResult;
import java.util.List;
import org.junit.jupiter.api.Test;

class MatchEvaluationResultCodecTest {

  private final MatchEvaluationResultCodec codec =
      new MatchEvaluationResultCodec(new RecruitaProperties(), new ObjectMapper());

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
                    new CandidateProfileDto(List.of("java"), 1.0, List.of("Dev"), ""),
                    "ok")));

    MatchEvaluationResult encoded = new DeterministicMatchEvaluationResult(response);
    MatchEvaluationResult decoded = codec.decode(codec.encode(encoded));

    assertInstanceOf(DeterministicMatchEvaluationResult.class, decoded);
    assertEquals(
        80,
        ((DeterministicMatchEvaluationResult) decoded).value().scores().getFirst().matchScore());
  }

  @Test
  void roundTripsGroqResults() {
    MatchEvaluationResult encoded =
        new GroqMatchEvaluationResult(
            new ObjectMapper().createObjectNode().put("scores", 1).put("ok", true));

    MatchEvaluationResult decoded = codec.decode(codec.encode(encoded));

    assertInstanceOf(GroqMatchEvaluationResult.class, decoded);
    assertEquals(1, ((GroqMatchEvaluationResult) decoded).value().path("scores").asInt());
  }

  @Test
  void rejectsMismatchedSchemaVersion() {
    RecruitaProperties properties = new RecruitaProperties();
    properties.getMatch().getCache().setSchemaVersion("2");
    String payload =
        codec.encode(
            new GroqMatchEvaluationResult(new ObjectMapper().createObjectNode().put("ok", true)));

    assertTrue(
        new MatchEvaluationResultCodec(properties, new ObjectMapper())
            .tryDecode(payload)
            .isEmpty());
  }

  @Test
  void rejectsUnknownCacheEntryType() {
    String payload =
        """
        {"schemaVersion":"1","type":"legacy","payload":{}}
        """;

    assertTrue(codec.tryDecode(payload).isEmpty());
  }
}
