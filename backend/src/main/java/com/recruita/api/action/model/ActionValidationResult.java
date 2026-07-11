package com.recruita.api.action.model;

import java.util.List;

public record ActionValidationResult(boolean valid, ParsedActionDto action, List<String> errors) {

  public ActionValidationResult {
    errors = List.copyOf(errors);
  }

  public static ActionValidationResult valid(ParsedActionDto action) {
    return new ActionValidationResult(true, action, List.of());
  }

  public static ActionValidationResult invalid(List<String> errors) {
    return new ActionValidationResult(false, null, errors);
  }
}
