package com.recruita.api.api.dto.match;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.recruita.api.config.validation.MatchValidationMessageKey;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MatchCandidateDto(
    @NotBlank(message = "{" + MatchValidationMessageKey.Codes.CANDIDATE_ID_REQUIRED + "}")
        String id,
    List<@NotBlank String> skills,
    @PositiveOrZero Double yearsOfExperience,
    String currentJobTitle) {

  public MatchCandidateDto {
    skills = skills == null ? List.of() : List.copyOf(skills);
  }
}
