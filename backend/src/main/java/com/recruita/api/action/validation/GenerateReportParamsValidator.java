package com.recruita.api.action.validation;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruita.api.action.model.ActionParamKey;
import com.recruita.api.action.model.ParamsValidationResult;
import com.recruita.api.action.model.ReportType;
import com.recruita.api.config.properties.ActionMessageProperties;
import com.recruita.api.config.properties.RecruitaProperties;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class GenerateReportParamsValidator {

  private final FilterParamsValidator filterParamsValidator;
  private final ActionMessageProperties messages;

  public GenerateReportParamsValidator(
      FilterParamsValidator filterParamsValidator, RecruitaProperties properties) {
    this.filterParamsValidator = filterParamsValidator;
    this.messages = properties.getAction().getMessages();
  }

  public ParamsValidationResult validate(JsonNode params) {
    if (!ActionJsonSupport.isObject(params)) {
      return ParamsValidationResult.invalid(
          List.of(messages.getGenerateReportParamsMustBeObject()));
    }

    JsonNode reportType = params.get(ActionParamKey.REPORT_TYPE);
    if (reportType == null || !ReportType.isWireValue(reportType.asText())) {
      return ParamsValidationResult.invalid(
          List.of(messages.formatInvalidReportType(ReportType.joinedPipe())));
    }

    Map<String, Object> actionParams = new LinkedHashMap<>();
    actionParams.put(ActionParamKey.REPORT_TYPE, reportType.asText());

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
