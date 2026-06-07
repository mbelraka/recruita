package com.recruita.api.api.dto.match;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.recruita.api.config.validation.MatchValidationMessageKey;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.List;

@Schema(
    description =
        "Privacy-safe candidate row. id is a disposable correlation id, not a database key.")
@JsonIgnoreProperties(ignoreUnknown = true)
public record MatchCandidateDto(
    @Schema(
            description = "One-time correlation id echoed in the response scores array.",
            example = "f47ac10b-58cc-4372-a567-0e02b2c3d479")
        @NotBlank(message = "{" + MatchValidationMessageKey.Codes.CANDIDATE_ID_REQUIRED + "}")
        String id,
    List<@NotBlank String> skills,
    @PositiveOrZero Double yearsOfExperience,
    String currentJobTitle) {

  public MatchCandidateDto {
    skills = skills == null ? List.of() : List.copyOf(skills);
  }
}
