package com.recruita.api.action.model;

public record ClarifyActionDto(ActionType type, ClarifyParamsDto params)
    implements ParsedActionDto {

  public ClarifyActionDto(ClarifyParamsDto params) {
    this(ActionType.CLARIFY, params);
  }
}
