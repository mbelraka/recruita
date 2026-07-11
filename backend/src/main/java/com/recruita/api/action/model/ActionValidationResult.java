package com.recruita.api.action.model;

import java.util.List;
import java.util.Optional;

public record ActionValidationResult(
    boolean valid, Optional<ParsedActionDto> action, List<String> errors) {

  public ActionValidationResult {
    errors = List.copyOf(errors);
    if (valid && action.isEmpty()) {
      throw new IllegalArgumentException("Valid results require an action");
    }
    if (!valid && action.isPresent()) {
      throw new IllegalArgumentException("Invalid results must not include an action");
    }
  }

  public static ActionValidationResult valid(ParsedActionDto action) {
    return new ActionValidationResult(true, Optional.of(action), List.of());
  }

  public static ActionValidationResult invalid(List<String> errors) {
    return new ActionValidationResult(false, Optional.empty(), errors);
  }
}
