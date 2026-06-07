package com.recruita.api.action.model;

import java.util.List;
import java.util.Map;

public record ParseActionResponse(boolean valid, Map<String, Object> action, List<String> errors) {

  public ParseActionResponse {
    action = Map.copyOf(action);
    errors = List.copyOf(errors);
  }

  public static ParseActionResponse from(ActionValidationResult result) {
    return new ParseActionResponse(result.valid(), result.action(), result.errors());
  }
}
