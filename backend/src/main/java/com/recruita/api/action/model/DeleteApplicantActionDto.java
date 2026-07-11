package com.recruita.api.action.model;

public record DeleteApplicantActionDto(ActionType type, DeleteApplicantParamsDto params)
    implements ParsedActionDto {

  public DeleteApplicantActionDto(DeleteApplicantParamsDto params) {
    this(ActionType.DELETE_APPLICANT, params);
  }
}
