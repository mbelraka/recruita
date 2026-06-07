package com.recruita.api.action.validation;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruita.api.action.model.ActionParamKey;
import com.recruita.api.action.model.ApplicationStatusWire;
import com.recruita.api.action.model.ParamsValidationResult;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class UpdateStatusParamsValidator {

  public ParamsValidationResult validate(JsonNode params) {
    List<String> errors = new ArrayList<>();
    if (!ActionJsonSupport.isObject(params)) {
      return ParamsValidationResult.invalid(List.of("Update status params must be an object"));
    }

    JsonNode applicantIdentifier = params.get(ActionParamKey.APPLICANT_IDENTIFIER);
    if (applicantIdentifier == null
        || !applicantIdentifier.isTextual()
        || applicantIdentifier.asText().trim().isEmpty()) {
      errors.add("applicantIdentifier is required and must be a non-empty string");
    }

    JsonNode newStatus = params.get(ActionParamKey.NEW_STATUS);
    if (newStatus == null || !ApplicationStatusWire.isWireValue(newStatus.asText())) {
      errors.add("newStatus must be one of: " + ApplicationStatusWire.formatList());
    }

    if (!errors.isEmpty()) {
      return ParamsValidationResult.invalid(errors);
    }

    Map<String, Object> actionParams = new LinkedHashMap<>();
    actionParams.put(ActionParamKey.APPLICANT_IDENTIFIER, applicantIdentifier.asText());
    actionParams.put(ActionParamKey.NEW_STATUS, newStatus.asText());
    return ParamsValidationResult.valid(actionParams);
  }
}
