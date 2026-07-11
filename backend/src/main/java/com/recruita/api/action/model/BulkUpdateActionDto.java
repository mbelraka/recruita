package com.recruita.api.action.model;

public record BulkUpdateActionDto(ActionType type, BulkUpdateParamsDto params)
    implements ParsedActionDto {

  public BulkUpdateActionDto(BulkUpdateParamsDto params) {
    this(ActionType.BULK_UPDATE, params);
  }
}
