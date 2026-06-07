package com.recruita.api.action.parse;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

/** Strips optional markdown fences and parses LLM JSON payloads. */
@Component
public class LlmJsonPayloadParser {

  private final ObjectMapper objectMapper;

  public LlmJsonPayloadParser(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  public JsonNode parse(String content) {
    if (content == null || content.isBlank()) {
      return null;
    }
    String cleaned =
        content
            .trim()
            .replaceFirst("^```json\\s*", "")
            .replaceFirst("^```\\s*", "")
            .replaceFirst("\\s*```$", "");
    try {
      return objectMapper.readTree(cleaned);
    } catch (Exception ex) {
      return null;
    }
  }
}
