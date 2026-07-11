package com.recruita.api.action.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ParseActionResponse(boolean valid, ParsedActionDto action, List<String> errors) {

  public ParseActionResponse {
    errors = List.copyOf(errors);
  }

  public static ParseActionResponse from(ActionValidationResult result) {
    return new ParseActionResponse(result.valid(), result.action(), result.errors());
  }
}
