package com.recruita.api.match.evaluation;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import java.io.IOException;

/** Writes the HTTP JSON body for either deterministic DTO or Groq passthrough. */
public final class MatchEvaluationResultSerializer extends JsonSerializer<MatchEvaluationResult> {

  @Override
  public void serialize(
      MatchEvaluationResult value, JsonGenerator gen, SerializerProvider serializers)
      throws IOException {
    gen.writeObject(value.responseBody());
  }
}
