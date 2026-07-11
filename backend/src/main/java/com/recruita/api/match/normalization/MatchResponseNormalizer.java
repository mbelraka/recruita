package com.recruita.api.match.normalization;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruita.api.api.dto.match.MatchResponseDto;
import com.recruita.api.api.dto.match.MatchScoreDto;
import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.match.evaluation.MatchEvaluationResult;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/** Maps Groq or legacy wire JSON into the canonical {@link MatchResponseDto} contract. */
@Component
public class MatchResponseNormalizer {

  private static final List<String> FALLBACK_SCORE_LIST_KEYS = List.of("results", "candidates");

  private final String primaryScoresField;

  public MatchResponseNormalizer(RecruitaProperties properties) {
    this.primaryScoresField =
        properties.getMatch().getGroq().getApiContract().getMatchResponseScoresField();
  }

  public MatchResponseDto toResponseDto(MatchEvaluationResult result) {
    return switch (result) {
      case MatchEvaluationResult.Deterministic deterministic -> deterministic.value();
      case MatchEvaluationResult.Groq groq -> normalize(groq.value());
    };
  }

  public MatchResponseDto normalize(JsonNode root) {
    JsonNode scoresNode = findScoresArray(root);
    if (scoresNode == null || !scoresNode.isArray()) {
      return new MatchResponseDto(List.of());
    }
    List<MatchScoreDto> scores = new ArrayList<>();
    for (JsonNode item : scoresNode) {
      if (item != null && item.isObject()) {
        scores.add(toScoreDto(item));
      }
    }
    return new MatchResponseDto(scores);
  }

  private JsonNode findScoresArray(JsonNode root) {
    if (root == null || root.isNull()) {
      return root;
    }
    JsonNode primary = root.path(primaryScoresField);
    if (primary.isArray()) {
      return primary;
    }
    for (String key : FALLBACK_SCORE_LIST_KEYS) {
      if (key.equals(primaryScoresField)) {
        continue;
      }
      JsonNode candidate = root.path(key);
      if (candidate.isArray()) {
        return candidate;
      }
    }
    return primary;
  }

  private static MatchScoreDto toScoreDto(JsonNode item) {
    return new MatchScoreDto(
        readText(item, "id"),
        readMatchScore(item),
        readStringList(item, "matchingSkills"),
        readStringList(item, "missingSkills"),
        readCandidateProfile(item.path("candidateProfile")),
        readText(item, "recommendation"));
  }

  private static MatchScoreDto.CandidateProfileDto readCandidateProfile(JsonNode profile) {
    if (profile == null || profile.isNull() || !profile.isObject()) {
      return null;
    }
    return new MatchScoreDto.CandidateProfileDto(
        readStringList(profile, "skills"),
        profile.path("yearsExperience").asDouble(0),
        readStringList(profile, "topJobTitles"),
        readText(profile, "education"));
  }

  private static int readMatchScore(JsonNode item) {
    if (item.hasNonNull("matchScore")) {
      return item.path("matchScore").asInt(0);
    }
    if (item.hasNonNull("score")) {
      return item.path("score").asInt(0);
    }
    return 0;
  }

  private static String readText(JsonNode node, String field) {
    JsonNode value = node.path(field);
    return value.isMissingNode() || value.isNull() ? "" : value.asText("");
  }

  private static List<String> readStringList(JsonNode node, String field) {
    JsonNode array = node.path(field);
    if (!array.isArray()) {
      return List.of();
    }
    List<String> values = new ArrayList<>();
    for (JsonNode entry : array) {
      if (entry != null && entry.isTextual()) {
        values.add(entry.asText());
      }
    }
    return List.copyOf(values);
  }
}
