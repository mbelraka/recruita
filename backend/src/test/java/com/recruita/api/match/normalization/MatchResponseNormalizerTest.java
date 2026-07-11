package com.recruita.api.match.normalization;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruita.api.api.dto.match.MatchResponseDto;
import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.match.evaluation.MatchEvaluationResult;
import org.junit.jupiter.api.Test;

class MatchResponseNormalizerTest {

  private final MatchResponseNormalizer normalizer =
      new MatchResponseNormalizer(new RecruitaProperties());

  private final ObjectMapper objectMapper = new ObjectMapper();

  @Test
  void normalizePrefersConfiguredScoresField() throws Exception {
    MatchResponseDto response =
        normalizer.normalize(
            objectMapper.readTree(
                """
                {"scores":[{"id":"a","matchScore":88,"matchingSkills":[],"missingSkills":[],"recommendation":"Strong"}]}
                """));

    assertEquals(1, response.scores().size());
    assertEquals("a", response.scores().getFirst().id());
    assertEquals(88, response.scores().getFirst().matchScore());
  }

  @Test
  void normalizeFallsBackToLegacyResultsKey() throws Exception {
    MatchResponseDto response =
        normalizer.normalize(
            objectMapper.readTree(
                """
                {"results":[{"id":"b","score":55,"matchingSkills":[],"missingSkills":[],"recommendation":""}]}
                """));

    assertEquals(1, response.scores().size());
    assertEquals("b", response.scores().getFirst().id());
    assertEquals(55, response.scores().getFirst().matchScore());
  }

  @Test
  void toResponseDtoMapsDeterministicResultsDirectly() {
    MatchResponseDto response =
        new MatchResponseDto(
            java.util.List.of(
                new com.recruita.api.api.dto.match.MatchScoreDto(
                    "x", 90, java.util.List.of(), java.util.List.of(), null, "")));

    MatchResponseDto mapped =
        normalizer.toResponseDto(new MatchEvaluationResult.Deterministic(response));

    assertEquals(response, mapped);
  }

  @Test
  void toResponseDtoNormalizesGroqWirePayload() throws Exception {
    MatchResponseDto mapped =
        normalizer.toResponseDto(
            new MatchEvaluationResult.Groq(
                objectMapper.readTree("{\"scores\":[{\"id\":\"g\",\"matchScore\":70}]}")));

    assertEquals(1, mapped.scores().size());
    assertEquals("g", mapped.scores().getFirst().id());
  }

  @Test
  void normalizeReturnsEmptyScoresForMissingPayload() {
    MatchResponseDto response = normalizer.normalize(objectMapper.createObjectNode());

    assertInstanceOf(MatchResponseDto.class, response);
    assertEquals(0, response.scores().size());
  }

  @Test
  void normalizeReturnsEmptyScoresForNullPayload() {
    MatchResponseDto response = normalizer.normalize(null);

    assertEquals(0, response.scores().size());
  }

  @Test
  void toResponseDtoReturnsEmptyScoresForNullGroqPayload() {
    MatchResponseDto response = normalizer.toResponseDto(new MatchEvaluationResult.Groq(null));

    assertEquals(0, response.scores().size());
  }
}
