package com.recruita.api.api.dto.applicant;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.recruita.api.config.validation.ApplicantValidationMessageKey;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SaveApplicantRequestDto(
    @NotBlank(message = "{" + ApplicantValidationMessageKey.Codes.ID_REQUIRED + "}") String id,
    String name,
    String email,
    String phone,
    String location,
    Double yearsOfExperience,
    String applicationStatus,
    String currentJobTitle,
    LocalDate availableFrom,
    List<String> skills,
    String notes) {

  public SaveApplicantRequestDto {
    skills = skills == null ? List.of() : List.copyOf(skills);
  }
}
