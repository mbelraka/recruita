package com.recruita.api.action.validation;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruita.api.action.model.ParamsValidationResult;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;

final class ActionOptionalWireParamsValidatorSupport {

  private ActionOptionalWireParamsValidatorSupport() {}

  static ParamsValidationResult validate(
      JsonNode params,
      String paramsMustBeObjectMessage,
      String wireParamKey,
      Predicate<String> isValidWireValue,
      String invalidWireMessage,
      FilterParamsValidator filterParamsValidator) {
    if (!ActionJsonSupport.isObject(params)) {
      return ParamsValidationResult.invalid(List.of(paramsMustBeObjectMessage));
    }

    JsonNode wireValue = params.get(wireParamKey);
    if (wireValue == null || !wireValue.isTextual() || !isValidWireValue.test(wireValue.asText())) {
      return ParamsValidationResult.invalid(List.of(invalidWireMessage));
    }

    Map<String, Object> actionParams = new LinkedHashMap<>();
    actionParams.put(wireParamKey, wireValue.asText());

    return ActionOptionalFiltersSupport.mergeOptionalFilters(
        params, actionParams, filterParamsValidator);
  }
}
