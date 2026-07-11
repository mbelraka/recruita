package com.recruita.api.action.model;

public record ExportDataActionDto(ActionType type, ExportParamsDto params)
    implements ParsedActionDto {

  public ExportDataActionDto(ExportParamsDto params) {
    this(ActionType.EXPORT_DATA, params);
  }
}
