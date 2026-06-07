package com.recruita.api.action.validation;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruita.api.action.model.ActionParamKey;
import com.recruita.api.action.model.ParamsValidationResult;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class ClarifyParamsValidator {

  public ParamsValidationResult validate(JsonNode params) {
    if (!ActionJsonSupport.isObject(params)) {
      return ParamsValidationResult.invalid(List.of("Clarify params must be an object"));
    }
    JsonNode questions = params.get(ActionParamKey.QUESTIONS);
    if (!ActionJsonSupport.isStringArray(questions) || questions.isEmpty()) {
      return ParamsValidationResult.invalid(List.of("questions must be a non-empty string array"));
    }
    Map<String, Object> actionParams = new LinkedHashMap<>();
    actionParams.put(ActionParamKey.QUESTIONS, ActionJsonSupport.toStringList(questions));
    return ParamsValidationResult.valid(actionParams);
  }
}
