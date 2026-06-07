package com.recruita.api.action.validation;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruita.api.action.model.ActionParamKey;
import com.recruita.api.action.model.ActionType;
import com.recruita.api.action.model.ActionValidationResult;
import com.recruita.api.action.model.ParamsValidationResult;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class ActionValidator {

  private final ClarifyParamsValidator clarifyParamsValidator;
  private final FilterParamsValidator filterParamsValidator;
  private final UpdateStatusParamsValidator updateStatusParamsValidator;
  private final ExportParamsValidator exportParamsValidator;
  private final CreateApplicantParamsValidator createApplicantParamsValidator;
  private final DeleteApplicantParamsValidator deleteApplicantParamsValidator;
  private final GenerateReportParamsValidator generateReportParamsValidator;
  private final MatchJobParamsValidator matchJobParamsValidator;
  private final BulkUpdateParamsValidator bulkUpdateParamsValidator;

  public ActionValidator(
      ClarifyParamsValidator clarifyParamsValidator,
      FilterParamsValidator filterParamsValidator,
      UpdateStatusParamsValidator updateStatusParamsValidator,
      ExportParamsValidator exportParamsValidator,
      CreateApplicantParamsValidator createApplicantParamsValidator,
      DeleteApplicantParamsValidator deleteApplicantParamsValidator,
      GenerateReportParamsValidator generateReportParamsValidator,
      MatchJobParamsValidator matchJobParamsValidator,
      BulkUpdateParamsValidator bulkUpdateParamsValidator) {
    this.clarifyParamsValidator = clarifyParamsValidator;
    this.filterParamsValidator = filterParamsValidator;
    this.updateStatusParamsValidator = updateStatusParamsValidator;
    this.exportParamsValidator = exportParamsValidator;
    this.createApplicantParamsValidator = createApplicantParamsValidator;
    this.deleteApplicantParamsValidator = deleteApplicantParamsValidator;
    this.generateReportParamsValidator = generateReportParamsValidator;
    this.matchJobParamsValidator = matchJobParamsValidator;
    this.bulkUpdateParamsValidator = bulkUpdateParamsValidator;
  }

  public ActionValidationResult validate(JsonNode root) {
    if (!ActionJsonSupport.isObject(root)) {
      return ActionValidationResult.invalid(List.of("Action must be an object"));
    }

    JsonNode typeNode = root.get(ActionParamKey.TYPE);
    if (typeNode == null || !typeNode.isTextual()) {
      return ActionValidationResult.invalid(List.of("Action type is required"));
    }

    ActionType actionType = parseActionType(typeNode.asText());
    if (actionType == null) {
      return ActionValidationResult.invalid(
          List.of(
              "Invalid action type: "
                  + typeNode.asText()
                  + ". Valid types: "
                  + joinedActionTypes()));
    }

    JsonNode params = root.get(ActionParamKey.PARAMS);
    ParamsValidationResult paramsResult = validateParams(actionType, params);
    if (!paramsResult.isValid()) {
      return ActionValidationResult.invalid(paramsResult.errors());
    }

    return ActionValidationResult.valid(wrapAction(actionType, paramsResult.value().orElseThrow()));
  }

  private ParamsValidationResult validateParams(ActionType actionType, JsonNode params) {
    return switch (actionType) {
      case CLARIFY -> clarifyParamsValidator.validate(params);
      case FILTER_APPLICANTS -> filterParamsValidator.validate(params);
      case UPDATE_STATUS -> updateStatusParamsValidator.validate(params);
      case EXPORT_DATA -> exportParamsValidator.validate(params);
      case CREATE_APPLICANT -> createApplicantParamsValidator.validate(params);
      case DELETE_APPLICANT -> deleteApplicantParamsValidator.validate(params);
      case GENERATE_REPORT -> generateReportParamsValidator.validate(params);
      case MATCH_JOB -> matchJobParamsValidator.validate(params);
      case BULK_UPDATE -> bulkUpdateParamsValidator.validate(params);
    };
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

  private static Map<String, Object> wrapAction(ActionType type, Map<String, Object> params) {
    Map<String, Object> action = new LinkedHashMap<>();
    action.put(ActionParamKey.TYPE, type.name());
    action.put(ActionParamKey.PARAMS, params);
    return action;
  }
}
