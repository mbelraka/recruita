package com.recruita.api.action.validation;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruita.api.action.model.ActionParamKey;
import com.recruita.api.action.model.ParamsValidationResult;
import com.recruita.api.config.properties.ActionProperties;
import com.recruita.api.config.properties.RecruitaProperties;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class MatchJobParamsValidator {

  private final ActionProperties.ValidationLimitsProperties limits;

  public MatchJobParamsValidator(RecruitaProperties properties) {
    this.limits = properties.getAction().getValidation();
  }

  public ParamsValidationResult validate(JsonNode params) {
    List<String> errors = new ArrayList<>();
    if (!ActionJsonSupport.isObject(params)) {
      return ParamsValidationResult.invalid(List.of("Match job params must be an object"));
    }

    JsonNode jobDescription = params.get(ActionParamKey.JOB_DESCRIPTION);
    if (jobDescription == null
        || !jobDescription.isTextual()
        || jobDescription.asText().isBlank()) {
      errors.add("jobDescription is required");
    }

    JsonNode limit = params.get(ActionParamKey.LIMIT);
    if (limit != null
        && !limit.isMissingNode()
        && (!limit.isNumber()
            || limit.asInt() < limits.getMinMatchLimit()
            || limit.asInt() > limits.getMatchLimitMax())) {
      errors.add(
          "limit must be a number between "
              + limits.getMinMatchLimit()
              + " and "
              + limits.getMatchLimitMax());
    }

    if (!errors.isEmpty()) {
      return ParamsValidationResult.invalid(errors);
    }

    Map<String, Object> actionParams = new LinkedHashMap<>();
    actionParams.put(ActionParamKey.JOB_DESCRIPTION, jobDescription.asText());
    actionParams.put(
        ActionParamKey.LIMIT,
        limit != null && limit.isNumber() ? limit.numberValue() : limits.getMatchLimitDefault());
    return ParamsValidationResult.valid(actionParams);
  }
}
