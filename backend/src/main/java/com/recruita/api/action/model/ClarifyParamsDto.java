package com.recruita.api.action.model;

import java.util.List;

public record ClarifyParamsDto(List<String> questions) {

  public ClarifyParamsDto {
    questions = questions == null ? List.of() : List.copyOf(questions);
  }
}
