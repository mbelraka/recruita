package com.recruita.api.action.model;

import java.util.List;

public record CreateApplicantParamsDto(
    String name,
    String email,
    String phone,
    List<String> skills,
    Double yearsOfExperience,
    String currentJobTitle) {

  public CreateApplicantParamsDto {
    skills = skills == null ? List.of() : List.copyOf(skills);
  }
}
