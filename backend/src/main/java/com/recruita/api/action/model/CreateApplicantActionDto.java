package com.recruita.api.action.model;

public record CreateApplicantActionDto(ActionType type, CreateApplicantParamsDto params)
    implements ParsedActionDto {

  public CreateApplicantActionDto(CreateApplicantParamsDto params) {
    this(ActionType.CREATE_APPLICANT, params);
  }
}
