package com.recruita.api.action.validation;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruita.api.action.model.ActionParamKey;
import com.recruita.api.action.model.ParamsValidationResult;
import java.util.Map;

final class ActionOptionalFiltersSupport {

  private ActionOptionalFiltersSupport() {}

  static ParamsValidationResult mergeOptionalFilters(
      JsonNode params,
      Map<String, Object> actionParams,
      FilterParamsValidator filterParamsValidator) {
    JsonNode filters = params.get(ActionParamKey.FILTERS);
    if (filters != null && !filters.isMissingNode()) {
      ParamsValidationResult filtersResult = filterParamsValidator.validate(filters);
      if (!filtersResult.isValid()) {
        return filtersResult;
      }
      filtersResult.value().ifPresent(value -> actionParams.put(ActionParamKey.FILTERS, value));
    }

    return ParamsValidationResult.valid(actionParams);
  }
}
