package com.recruita.api.action.model;

public record UpdateStatusActionDto(ActionType type, UpdateStatusParamsDto params)
    implements ParsedActionDto {

  public UpdateStatusActionDto(UpdateStatusParamsDto params) {
    this(ActionType.UPDATE_STATUS, params);
  }
}
