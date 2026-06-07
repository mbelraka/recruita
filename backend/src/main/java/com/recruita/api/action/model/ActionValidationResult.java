package com.recruita.api.action.model;

import java.util.List;
import java.util.Map;

public record ActionValidationResult(
    boolean valid, Map<String, Object> action, List<String> errors) {

  public ActionValidationResult {
    action = Map.copyOf(action);
    errors = List.copyOf(errors);
  }

  public static ActionValidationResult valid(Map<String, Object> action) {
    return new ActionValidationResult(true, action, List.of());
  }

  public static ActionValidationResult invalid(List<String> errors) {
    return new ActionValidationResult(false, Map.of(), errors);
  }
}
