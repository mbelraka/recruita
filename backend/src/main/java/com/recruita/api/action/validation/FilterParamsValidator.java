package com.recruita.api.action.validation;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruita.api.action.model.ActionParamKey;
import com.recruita.api.action.model.ApplicationStatusWire;
import com.recruita.api.action.model.ParamsValidationResult;
import com.recruita.api.config.properties.ActionProperties;
import com.recruita.api.config.properties.RecruitaProperties;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class FilterParamsValidator {

  private final ActionProperties.ValidationLimitsProperties limits;

  public FilterParamsValidator(RecruitaProperties properties) {
    this.limits = properties.getAction().getValidation();
  }

  public ParamsValidationResult validate(JsonNode params) {
    List<String> errors = new ArrayList<>();
    if (!ActionJsonSupport.isObject(params)) {
      return ParamsValidationResult.invalid(List.of("Filter params must be an object"));
    }

    JsonNode skills = params.get(ActionParamKey.SKILLS);
    if (skills != null && !skills.isMissingNode()) {
      if (!ActionJsonSupport.isStringArray(skills)) {
        errors.add("Skills must be an array of strings");
      } else if (skills.size() > limits.getMaxSkills()) {
        errors.add("Too many skills. Maximum: " + limits.getMaxSkills());
      }
    }

    JsonNode minExperience = params.get(ActionParamKey.MIN_EXPERIENCE);
    if (minExperience != null
        && !minExperience.isMissingNode()
        && (!minExperience.isNumber() || minExperience.asInt() < limits.getMinExperience())) {
      errors.add("minExperience must be a number >= " + limits.getMinExperience());
    }

    JsonNode maxExperience = params.get(ActionParamKey.MAX_EXPERIENCE);
    if (maxExperience != null
        && !maxExperience.isMissingNode()
        && (!maxExperience.isNumber() || maxExperience.asInt() > limits.getMaxExperience())) {
      errors.add("maxExperience must be a number <= " + limits.getMaxExperience());
    }

    JsonNode status = params.get(ActionParamKey.STATUS);
    if (status != null
        && !status.isMissingNode()
        && !ApplicationStatusWire.isWireValue(status.asText())) {
      errors.add("Invalid status. Valid: " + ApplicationStatusWire.formatList());
    }

    JsonNode searchTerm = params.get(ActionParamKey.SEARCH_TERM);
    if (searchTerm != null
        && !searchTerm.isMissingNode()
        && (!searchTerm.isTextual()
            || searchTerm.asText().length() > limits.getMaxSearchTermLength())) {
      errors.add(
          "searchTerm must be a string <= " + limits.getMaxSearchTermLength() + " characters");
    }

    if (!errors.isEmpty()) {
      return ParamsValidationResult.invalid(errors);
    }

    Map<String, Object> value = ActionJsonSupport.toStringObjectMap(params);
    return ParamsValidationResult.valid(value);
  }
}
