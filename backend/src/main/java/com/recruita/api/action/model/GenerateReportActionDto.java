package com.recruita.api.action.model;

public record GenerateReportActionDto(ActionType type, GenerateReportParamsDto params)
    implements ParsedActionDto {

  public GenerateReportActionDto(GenerateReportParamsDto params) {
    this(ActionType.GENERATE_REPORT, params);
  }
}
