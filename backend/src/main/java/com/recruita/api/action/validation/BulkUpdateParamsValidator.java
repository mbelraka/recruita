package com.recruita.api.action.validation;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruita.api.action.model.ActionParamKey;
import com.recruita.api.action.model.ApplicationStatusWire;
import com.recruita.api.action.model.ParamsValidationResult;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class BulkUpdateParamsValidator {

  private static final Set<String> VALID_UPDATE_KEYS =
      Set.of(ActionParamKey.APPLICATION_STATUS, ActionParamKey.NOTES);

  private final FilterParamsValidator filterParamsValidator;

  public BulkUpdateParamsValidator(FilterParamsValidator filterParamsValidator) {
    this.filterParamsValidator = filterParamsValidator;
  }

  public ParamsValidationResult validate(JsonNode params) {
    if (!ActionJsonSupport.isObject(params)) {
      return ParamsValidationResult.invalid(List.of("Bulk update params must be an object"));
    }

    ParamsValidationResult filtersResult =
        filterParamsValidator.validate(params.get(ActionParamKey.FILTERS));
    if (!filtersResult.isValid() || filtersResult.value().isEmpty()) {
      return ParamsValidationResult.invalid(
          filtersResult.errors().isEmpty()
              ? List.of("filters are required")
              : filtersResult.errors());
    }

    JsonNode updates = params.get(ActionParamKey.UPDATES);
    if (!ActionJsonSupport.isObject(updates)) {
      return ParamsValidationResult.invalid(List.of("updates must be an object"));
    }

    List<String> invalidKeys = new ArrayList<>();
    updates
        .fieldNames()
        .forEachRemaining(
            name -> {
              if (!VALID_UPDATE_KEYS.contains(name)) {
                invalidKeys.add(name);
              }
            });
    if (!invalidKeys.isEmpty()) {
      return ParamsValidationResult.invalid(
          List.of("Invalid update fields: " + String.join(", ", invalidKeys)));
    }

    JsonNode applicationStatus = updates.get(ActionParamKey.APPLICATION_STATUS);
    if (applicationStatus != null
        && !applicationStatus.isMissingNode()
        && !ApplicationStatusWire.isWireValue(applicationStatus.asText())) {
      return ParamsValidationResult.invalid(List.of("Invalid applicationStatus value"));
    }

    Map<String, Object> actionParams = new LinkedHashMap<>();
    actionParams.put(ActionParamKey.FILTERS, filtersResult.value().orElseThrow());
    actionParams.put(ActionParamKey.UPDATES, ActionJsonSupport.toStringObjectMap(updates));
    return ParamsValidationResult.valid(actionParams);
  }
}
