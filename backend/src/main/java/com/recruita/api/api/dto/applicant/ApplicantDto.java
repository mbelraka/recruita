package com.recruita.api.api.dto.applicant;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ApplicantDto(
    String id,
    String name,
    String email,
    String phone,
    String location,
    Double yearsOfExperience,
    String applicationStatus,
    String currentJobTitle,
    LocalDate availableFrom,
    List<String> skills,
    String notes,
    Instant createdAt,
    Instant updatedAt) {

  public ApplicantDto {
    skills = skills == null ? List.of() : List.copyOf(skills);
  }
}
