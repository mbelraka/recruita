package com.recruita.api.action.validation;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruita.api.action.model.ActionParamKey;
import com.recruita.api.action.model.ExportFormatWire;
import com.recruita.api.action.model.ParamsValidationResult;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class ExportParamsValidator {

  private final FilterParamsValidator filterParamsValidator;

  public ExportParamsValidator(FilterParamsValidator filterParamsValidator) {
    this.filterParamsValidator = filterParamsValidator;
  }

  public ParamsValidationResult validate(JsonNode params) {
    if (!ActionJsonSupport.isObject(params)) {
      return ParamsValidationResult.invalid(List.of("Export params must be an object"));
    }

    JsonNode format = params.get(ActionParamKey.FORMAT);
    if (format == null || !ExportFormatWire.isWireValue(format.asText())) {
      return ParamsValidationResult.invalid(
          List.of("format must be one of: " + ExportFormatWire.joinedPipe()));
    }

    Map<String, Object> actionParams = new LinkedHashMap<>();
    actionParams.put(ActionParamKey.FORMAT, format.asText());

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
