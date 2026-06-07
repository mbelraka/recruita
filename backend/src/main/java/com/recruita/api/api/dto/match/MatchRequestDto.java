package com.recruita.api.api.dto.match;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.recruita.api.config.validation.MatchValidationMessageKey;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Schema(description = "Match evaluation request with anonymized candidate rows.")
@JsonIgnoreProperties(ignoreUnknown = true)
public record MatchRequestDto(
    @Schema(
            description = "Free-text job description to score against.",
            example = "Senior Java engineer")
        String jobDescription,
    @NotNull(message = "{" + MatchValidationMessageKey.Codes.CANDIDATES_MUST_BE_ARRAY + "}")
        List<@Valid MatchCandidateDto> candidates,
    @Schema(
            description =
                "When true, uses the built-in deterministic rubric instead of calling Groq.")
        Boolean deterministic,
    String model,
    Double temperature,
    Double topP,
    Integer seed) {

  public MatchRequestDto {
    candidates = List.copyOf(candidates);
  }

  public boolean isDeterministic() {
    return Boolean.TRUE.equals(deterministic);
  }
}
