package com.recruita.api.action.validation;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruita.api.action.model.ActionParamKey;
import com.recruita.api.action.model.ParamsValidationResult;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class DeleteApplicantParamsValidator {

  public ParamsValidationResult validate(JsonNode params) {
    if (!ActionJsonSupport.isObject(params)) {
      return ParamsValidationResult.invalid(List.of("Delete applicant params must be an object"));
    }

    JsonNode applicantIdentifier = params.get(ActionParamKey.APPLICANT_IDENTIFIER);
    if (applicantIdentifier == null
        || !applicantIdentifier.isTextual()
        || applicantIdentifier.asText().isBlank()) {
      return ParamsValidationResult.invalid(
          List.of("applicantIdentifier is required and must be a non-empty string"));
    }

    Map<String, Object> actionParams = new LinkedHashMap<>();
    actionParams.put(ActionParamKey.APPLICANT_IDENTIFIER, applicantIdentifier.asText());
    return ParamsValidationResult.valid(actionParams);
  }
}
