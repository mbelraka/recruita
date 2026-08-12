package com.recruita.api.match.cache;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruita.api.api.dto.match.MatchResponseDto;
import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.match.evaluation.DeterministicMatchEvaluationResult;
import com.recruita.api.match.evaluation.GroqMatchEvaluationResult;
import com.recruita.api.match.evaluation.MatchEvaluationResult;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class MatchEvaluationResultCodec {

  private static final String TYPE_DETERMINISTIC = "deterministic";
  private static final String TYPE_GROQ = "groq";

  private final ObjectMapper objectMapper;
  private final String schemaVersion;

  public MatchEvaluationResultCodec(RecruitaProperties properties, ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
    this.schemaVersion = properties.getMatch().getCache().getSchemaVersion();
  }

  public String encode(MatchEvaluationResult result) {
    try {
      return objectMapper.writeValueAsString(toEnvelope(result));
    } catch (JsonProcessingException exception) {
      throw new IllegalStateException("Failed to encode match cache entry", exception);
    }
  }

  public MatchEvaluationResult decode(String payload) {
    return tryDecode(payload)
        .orElseThrow(() -> new IllegalStateException("Failed to decode match cache entry"));
  }

  public Optional<MatchEvaluationResult> tryDecode(String payload) {
    try {
      JsonNode root = objectMapper.readTree(payload);
      String encodedSchemaVersion = root.path("schemaVersion").asText();
      if (!schemaVersion.equals(encodedSchemaVersion)) {
        return Optional.empty();
      }
      String type = root.path("type").asText();
      JsonNode body = root.path("payload");
      return switch (type) {
        case TYPE_DETERMINISTIC ->
            Optional.of(
                new DeterministicMatchEvaluationResult(
                    objectMapper.treeToValue(body, MatchResponseDto.class)));
        case TYPE_GROQ -> Optional.of(new GroqMatchEvaluationResult(body.deepCopy()));
        default -> Optional.empty();
      };
    } catch (JsonProcessingException exception) {
      return Optional.empty();
    }
  }

  private CacheEnvelope toEnvelope(MatchEvaluationResult result) {
    return switch (result) {
      case DeterministicMatchEvaluationResult deterministic ->
          new CacheEnvelope(
              schemaVersion, TYPE_DETERMINISTIC, objectMapper.valueToTree(deterministic.value()));
      case GroqMatchEvaluationResult groq ->
          new CacheEnvelope(schemaVersion, TYPE_GROQ, groq.value().deepCopy());
    };
  }

  private record CacheEnvelope(String schemaVersion, String type, JsonNode payload) {}
}
