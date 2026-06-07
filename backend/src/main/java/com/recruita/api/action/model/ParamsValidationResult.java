package com.recruita.api.action.model;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public record ParamsValidationResult(Optional<Map<String, Object>> value, List<String> errors) {

  public ParamsValidationResult {
    value = value.map(Map::copyOf);
    errors = List.copyOf(errors);
  }

  public boolean isValid() {
    return errors.isEmpty();
  }

  public static ParamsValidationResult valid(Map<String, Object> value) {
    return new ParamsValidationResult(Optional.of(value), List.of());
  }

  public static ParamsValidationResult invalid(List<String> errors) {
    return new ParamsValidationResult(Optional.empty(), errors);
  }
}
