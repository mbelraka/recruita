package com.recruita.api.action.validation;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruita.api.action.model.ActionParamKey;
import com.recruita.api.action.model.ActionType;
import com.recruita.api.action.model.ActionValidationResult;
import com.recruita.api.action.model.ParamsValidationResult;
import com.recruita.api.action.model.ParsedActionFactory;
import com.recruita.api.config.properties.ActionMessageProperties;
import com.recruita.api.config.properties.RecruitaProperties;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class ActionValidator {

  private final ActionParamsValidators paramsValidators;
  private final ParsedActionFactory parsedActionFactory;
  private final ActionMessageProperties messages;

  public ActionValidator(
      ActionParamsValidators paramsValidators,
      ParsedActionFactory parsedActionFactory,
      RecruitaProperties properties) {
    this.paramsValidators = paramsValidators;
    this.parsedActionFactory = parsedActionFactory;
    this.messages = properties.getAction().getMessages();
  }

  public ActionValidationResult validate(JsonNode root) {
    if (!ActionJsonSupport.isObject(root)) {
      return ActionValidationResult.invalid(List.of(messages.getActionMustBeObject()));
    }

    JsonNode typeNode = root.get(ActionParamKey.TYPE);
    if (typeNode == null || !typeNode.isTextual()) {
      return ActionValidationResult.invalid(List.of(messages.getActionTypeRequired()));
    }

    ActionType actionType = parseActionType(typeNode.asText());
    if (actionType == null) {
      return ActionValidationResult.invalid(
          List.of(messages.formatInvalidActionType(typeNode.asText(), joinedActionTypes())));
    }

    JsonNode params = root.get(ActionParamKey.PARAMS);
    ParamsValidationResult paramsResult = paramsValidators.validate(actionType, params);
    if (!paramsResult.isValid()) {
      return ActionValidationResult.invalid(paramsResult.errors());
    }

    return ActionValidationResult.valid(
        parsedActionFactory.from(actionType, paramsResult.value().orElseThrow()));
  }

  private static ActionType parseActionType(String value) {
    try {
      return ActionType.valueOf(value);
    } catch (IllegalArgumentException ex) {
      return null;
    }
  }

  private static String joinedActionTypes() {
    return Arrays.stream(ActionType.values()).map(Enum::name).collect(Collectors.joining(", "));
  }
}
