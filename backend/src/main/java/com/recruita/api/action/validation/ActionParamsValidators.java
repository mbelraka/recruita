package com.recruita.api.action.validation;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruita.api.action.model.ActionType;
import com.recruita.api.action.model.ParamsValidationResult;
import org.springframework.stereotype.Component;

@Component
public class ActionParamsValidators {

  private final ClarifyParamsValidator clarifyParamsValidator;
  private final FilterParamsValidator filterParamsValidator;
  private final UpdateStatusParamsValidator updateStatusParamsValidator;
  private final ExportParamsValidator exportParamsValidator;
  private final CreateApplicantParamsValidator createApplicantParamsValidator;
  private final DeleteApplicantParamsValidator deleteApplicantParamsValidator;
  private final GenerateReportParamsValidator generateReportParamsValidator;
  private final MatchJobParamsValidator matchJobParamsValidator;
  private final BulkUpdateParamsValidator bulkUpdateParamsValidator;

  public ActionParamsValidators(
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

  public ParamsValidationResult validate(ActionType actionType, JsonNode params) {
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
}
