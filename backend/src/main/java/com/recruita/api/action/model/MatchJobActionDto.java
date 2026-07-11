package com.recruita.api.action.model;

public record MatchJobActionDto(ActionType type, MatchJobParamsDto params)
    implements ParsedActionDto {

  public MatchJobActionDto(MatchJobParamsDto params) {
    this(ActionType.MATCH_JOB, params);
  }
}
