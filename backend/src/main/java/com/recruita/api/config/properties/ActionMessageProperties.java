package com.recruita.api.config.properties;

import jakarta.validation.constraints.NotBlank;
import java.text.MessageFormat;

/** User-facing validation messages for smart-action parse/validate (`recruita.action.messages`). */
public class ActionMessageProperties {

  @NotBlank private String actionMustBeObject = "Action must be an object";
  @NotBlank private String actionTypeRequired = "Action type is required";

  @NotBlank private String invalidActionType = "Invalid action type: {0}. Valid types: {1}";

  @NotBlank private String clarifyParamsMustBeObject = "Clarify params must be an object";

  @NotBlank
  private String questionsMustBeNonEmptyArray = "questions must be a non-empty string array";

  @NotBlank private String filterParamsMustBeObject = "Filter params must be an object";
  @NotBlank private String skillsMustBeArray = "Skills must be an array of strings";

  @NotBlank private String tooManySkills = "Too many skills. Maximum: {0}";

  @NotBlank
  private String invalidSkill = "Invalid skill. Use roster skill labels from ROSTER CONTEXT";

  @NotBlank
  private String invalidCountry = "Invalid country. Use roster country labels from ROSTER CONTEXT";

  @NotBlank private String minExperienceTooLow = "minExperience must be a number >= {0}";
  @NotBlank private String maxExperienceTooHigh = "maxExperience must be a number <= {0}";

  @NotBlank private String invalidStatus = "Invalid status. Valid: {0}";

  @NotBlank private String optionalTextFieldInvalid = "{0} must be a string <= {1} characters";

  @NotBlank
  private String createApplicantParamsMustBeObject = "Create applicant params must be an object";

  @NotBlank private String invalidName = "name must be a valid name ({0}-{1} characters)";

  @NotBlank private String invalidEmail = "email must be a valid email address";

  @NotBlank private String skillsRequired = "skills must be a non-empty array of strings";

  @NotBlank private String yearsOfExperienceRange = "yearsOfExperience must be between {0} and {1}";

  @NotBlank private String currentJobTitleRequired = "currentJobTitle is required";

  @NotBlank
  private String updateStatusParamsMustBeObject = "Update status params must be an object";

  @NotBlank
  private String applicantIdentifierRequired =
      "applicantIdentifier is required and must be a non-empty string";

  @NotBlank private String invalidNewStatus = "newStatus must be one of: {0}";

  @NotBlank private String exportParamsMustBeObject = "Export params must be an object";
  @NotBlank private String invalidFormat = "format must be one of: {0}";

  @NotBlank
  private String deleteApplicantParamsMustBeObject = "Delete applicant params must be an object";

  @NotBlank
  private String generateReportParamsMustBeObject = "Generate report params must be an object";

  @NotBlank private String invalidReportType = "reportType must be one of: {0}";

  @NotBlank private String matchJobParamsMustBeObject = "Match job params must be an object";
  @NotBlank private String jobDescriptionRequired = "jobDescription is required";

  @NotBlank private String invalidMatchLimit = "limit must be a number between {0} and {1}";

  @NotBlank private String bulkUpdateParamsMustBeObject = "Bulk update params must be an object";
  @NotBlank private String filtersRequired = "filters are required";
  @NotBlank private String updatesMustBeObject = "updates must be an object";

  @NotBlank private String invalidUpdateFields = "Invalid update fields: {0}";
  @NotBlank private String invalidApplicationStatus = "Invalid applicationStatus value";

  @NotBlank private String failedToParseLlmResponse = "Failed to parse LLM response as JSON";

  public String getActionMustBeObject() {
    return actionMustBeObject;
  }

  public void setActionMustBeObject(String actionMustBeObject) {
    this.actionMustBeObject = actionMustBeObject;
  }

  public String getActionTypeRequired() {
    return actionTypeRequired;
  }

  public void setActionTypeRequired(String actionTypeRequired) {
    this.actionTypeRequired = actionTypeRequired;
  }

  public String getInvalidActionType() {
    return invalidActionType;
  }

  public String formatInvalidActionType(String type, String validTypes) {
    return MessageFormat.format(invalidActionType, type, validTypes);
  }

  public void setInvalidActionType(String invalidActionType) {
    this.invalidActionType = invalidActionType;
  }

  public String getClarifyParamsMustBeObject() {
    return clarifyParamsMustBeObject;
  }

  public void setClarifyParamsMustBeObject(String clarifyParamsMustBeObject) {
    this.clarifyParamsMustBeObject = clarifyParamsMustBeObject;
  }

  public String getQuestionsMustBeNonEmptyArray() {
    return questionsMustBeNonEmptyArray;
  }

  public void setQuestionsMustBeNonEmptyArray(String questionsMustBeNonEmptyArray) {
    this.questionsMustBeNonEmptyArray = questionsMustBeNonEmptyArray;
  }

  public String getFilterParamsMustBeObject() {
    return filterParamsMustBeObject;
  }

  public void setFilterParamsMustBeObject(String filterParamsMustBeObject) {
    this.filterParamsMustBeObject = filterParamsMustBeObject;
  }

  public String getSkillsMustBeArray() {
    return skillsMustBeArray;
  }

  public void setSkillsMustBeArray(String skillsMustBeArray) {
    this.skillsMustBeArray = skillsMustBeArray;
  }

  public String getTooManySkills() {
    return tooManySkills;
  }

  public String formatTooManySkills(int maxSkills) {
    return MessageFormat.format(tooManySkills, maxSkills);
  }

  public void setTooManySkills(String tooManySkills) {
    this.tooManySkills = tooManySkills;
  }

  public String getInvalidSkill() {
    return invalidSkill;
  }

  public void setInvalidSkill(String invalidSkill) {
    this.invalidSkill = invalidSkill;
  }

  public String getInvalidCountry() {
    return invalidCountry;
  }

  public void setInvalidCountry(String invalidCountry) {
    this.invalidCountry = invalidCountry;
  }

  public String getMinExperienceTooLow() {
    return minExperienceTooLow;
  }

  public String formatMinExperienceTooLow(int minExperience) {
    return MessageFormat.format(minExperienceTooLow, minExperience);
  }

  public void setMinExperienceTooLow(String minExperienceTooLow) {
    this.minExperienceTooLow = minExperienceTooLow;
  }

  public String getMaxExperienceTooHigh() {
    return maxExperienceTooHigh;
  }

  public String formatMaxExperienceTooHigh(int maxExperience) {
    return MessageFormat.format(maxExperienceTooHigh, maxExperience);
  }

  public void setMaxExperienceTooHigh(String maxExperienceTooHigh) {
    this.maxExperienceTooHigh = maxExperienceTooHigh;
  }

  public String getInvalidStatus() {
    return invalidStatus;
  }

  public String formatInvalidStatus(String validStatuses) {
    return MessageFormat.format(invalidStatus, validStatuses);
  }

  public void setInvalidStatus(String invalidStatus) {
    this.invalidStatus = invalidStatus;
  }

  public String getOptionalTextFieldInvalid() {
    return optionalTextFieldInvalid;
  }

  public String formatOptionalTextFieldInvalid(String fieldName, int maxLength) {
    return MessageFormat.format(optionalTextFieldInvalid, fieldName, maxLength);
  }

  public void setOptionalTextFieldInvalid(String optionalTextFieldInvalid) {
    this.optionalTextFieldInvalid = optionalTextFieldInvalid;
  }

  public String getCreateApplicantParamsMustBeObject() {
    return createApplicantParamsMustBeObject;
  }

  public void setCreateApplicantParamsMustBeObject(String createApplicantParamsMustBeObject) {
    this.createApplicantParamsMustBeObject = createApplicantParamsMustBeObject;
  }

  public String getInvalidName() {
    return invalidName;
  }

  public String formatInvalidName(int minLength, int maxLength) {
    return MessageFormat.format(invalidName, minLength, maxLength);
  }

  public void setInvalidName(String invalidName) {
    this.invalidName = invalidName;
  }

  public String getInvalidEmail() {
    return invalidEmail;
  }

  public void setInvalidEmail(String invalidEmail) {
    this.invalidEmail = invalidEmail;
  }

  public String getSkillsRequired() {
    return skillsRequired;
  }

  public void setSkillsRequired(String skillsRequired) {
    this.skillsRequired = skillsRequired;
  }

  public String getYearsOfExperienceRange() {
    return yearsOfExperienceRange;
  }

  public String formatYearsOfExperienceRange(int minExperience, int maxExperience) {
    return MessageFormat.format(yearsOfExperienceRange, minExperience, maxExperience);
  }

  public void setYearsOfExperienceRange(String yearsOfExperienceRange) {
    this.yearsOfExperienceRange = yearsOfExperienceRange;
  }

  public String getCurrentJobTitleRequired() {
    return currentJobTitleRequired;
  }

  public void setCurrentJobTitleRequired(String currentJobTitleRequired) {
    this.currentJobTitleRequired = currentJobTitleRequired;
  }

  public String getUpdateStatusParamsMustBeObject() {
    return updateStatusParamsMustBeObject;
  }

  public void setUpdateStatusParamsMustBeObject(String updateStatusParamsMustBeObject) {
    this.updateStatusParamsMustBeObject = updateStatusParamsMustBeObject;
  }

  public String getApplicantIdentifierRequired() {
    return applicantIdentifierRequired;
  }

  public void setApplicantIdentifierRequired(String applicantIdentifierRequired) {
    this.applicantIdentifierRequired = applicantIdentifierRequired;
  }

  public String getInvalidNewStatus() {
    return invalidNewStatus;
  }

  public String formatInvalidNewStatus(String validStatuses) {
    return MessageFormat.format(invalidNewStatus, validStatuses);
  }

  public void setInvalidNewStatus(String invalidNewStatus) {
    this.invalidNewStatus = invalidNewStatus;
  }

  public String getExportParamsMustBeObject() {
    return exportParamsMustBeObject;
  }

  public void setExportParamsMustBeObject(String exportParamsMustBeObject) {
    this.exportParamsMustBeObject = exportParamsMustBeObject;
  }

  public String getInvalidFormat() {
    return invalidFormat;
  }

  public String formatInvalidFormat(String validFormats) {
    return MessageFormat.format(invalidFormat, validFormats);
  }

  public void setInvalidFormat(String invalidFormat) {
    this.invalidFormat = invalidFormat;
  }

  public String getDeleteApplicantParamsMustBeObject() {
    return deleteApplicantParamsMustBeObject;
  }

  public void setDeleteApplicantParamsMustBeObject(String deleteApplicantParamsMustBeObject) {
    this.deleteApplicantParamsMustBeObject = deleteApplicantParamsMustBeObject;
  }

  public String getGenerateReportParamsMustBeObject() {
    return generateReportParamsMustBeObject;
  }

  public void setGenerateReportParamsMustBeObject(String generateReportParamsMustBeObject) {
    this.generateReportParamsMustBeObject = generateReportParamsMustBeObject;
  }

  public String getInvalidReportType() {
    return invalidReportType;
  }

  public String formatInvalidReportType(String validReportTypes) {
    return MessageFormat.format(invalidReportType, validReportTypes);
  }

  public void setInvalidReportType(String invalidReportType) {
    this.invalidReportType = invalidReportType;
  }

  public String getMatchJobParamsMustBeObject() {
    return matchJobParamsMustBeObject;
  }

  public void setMatchJobParamsMustBeObject(String matchJobParamsMustBeObject) {
    this.matchJobParamsMustBeObject = matchJobParamsMustBeObject;
  }

  public String getJobDescriptionRequired() {
    return jobDescriptionRequired;
  }

  public void setJobDescriptionRequired(String jobDescriptionRequired) {
    this.jobDescriptionRequired = jobDescriptionRequired;
  }

  public String getInvalidMatchLimit() {
    return invalidMatchLimit;
  }

  public String formatInvalidMatchLimit(int minLimit, int maxLimit) {
    return MessageFormat.format(invalidMatchLimit, minLimit, maxLimit);
  }

  public void setInvalidMatchLimit(String invalidMatchLimit) {
    this.invalidMatchLimit = invalidMatchLimit;
  }

  public String getBulkUpdateParamsMustBeObject() {
    return bulkUpdateParamsMustBeObject;
  }

  public void setBulkUpdateParamsMustBeObject(String bulkUpdateParamsMustBeObject) {
    this.bulkUpdateParamsMustBeObject = bulkUpdateParamsMustBeObject;
  }

  public String getFiltersRequired() {
    return filtersRequired;
  }

  public void setFiltersRequired(String filtersRequired) {
    this.filtersRequired = filtersRequired;
  }

  public String getUpdatesMustBeObject() {
    return updatesMustBeObject;
  }

  public void setUpdatesMustBeObject(String updatesMustBeObject) {
    this.updatesMustBeObject = updatesMustBeObject;
  }

  public String getInvalidUpdateFields() {
    return invalidUpdateFields;
  }

  public String formatInvalidUpdateFields(String invalidKeys) {
    return MessageFormat.format(invalidUpdateFields, invalidKeys);
  }

  public void setInvalidUpdateFields(String invalidUpdateFields) {
    this.invalidUpdateFields = invalidUpdateFields;
  }

  public String getInvalidApplicationStatus() {
    return invalidApplicationStatus;
  }

  public void setInvalidApplicationStatus(String invalidApplicationStatus) {
    this.invalidApplicationStatus = invalidApplicationStatus;
  }

  public String getFailedToParseLlmResponse() {
    return failedToParseLlmResponse;
  }

  public void setFailedToParseLlmResponse(String failedToParseLlmResponse) {
    this.failedToParseLlmResponse = failedToParseLlmResponse;
  }
}
