package com.recruita.api.api.dto.applicant;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.util.List;

/** List projection without heavy `notes` or audit timestamps. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ApplicantSummaryDto(
    String id,
    String name,
    String email,
    String phone,
    String location,
    Double yearsOfExperience,
    String applicationStatus,
    String currentJobTitle,
    LocalDate availableFrom,
    List<String> skills) {

  public ApplicantSummaryDto {
    skills = skills == null ? List.of() : List.copyOf(skills);
  }
}
