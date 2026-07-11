package com.recruita.api.action.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import java.util.Optional;

public record ParseActionResponse(
    boolean valid,
    @JsonInclude(JsonInclude.Include.NON_ABSENT) Optional<ParsedActionDto> action,
    List<String> errors) {

  public ParseActionResponse {
    errors = List.copyOf(errors);
    if (valid && action.isEmpty()) {
      throw new IllegalArgumentException("Valid responses require an action");
    }
    if (!valid && action.isPresent()) {
      throw new IllegalArgumentException("Invalid responses must not include an action");
    }
  }

  public static ParseActionResponse from(ActionValidationResult result) {
    return new ParseActionResponse(result.valid(), result.action(), result.errors());
  }
}
