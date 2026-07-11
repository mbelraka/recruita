package com.recruita.api.action.model;

public record FilterApplicantsActionDto(ActionType type, FilterParamsDto params)
    implements ParsedActionDto {

  public FilterApplicantsActionDto(FilterParamsDto params) {
    this(ActionType.FILTER_APPLICANTS, params);
  }
}
