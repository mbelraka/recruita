package com.recruita.api.action.model;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "type",
    visible = true)
@JsonSubTypes({
  @JsonSubTypes.Type(value = FilterApplicantsActionDto.class, name = "FILTER_APPLICANTS"),
  @JsonSubTypes.Type(value = UpdateStatusActionDto.class, name = "UPDATE_STATUS"),
  @JsonSubTypes.Type(value = ExportDataActionDto.class, name = "EXPORT_DATA"),
  @JsonSubTypes.Type(value = CreateApplicantActionDto.class, name = "CREATE_APPLICANT"),
  @JsonSubTypes.Type(value = DeleteApplicantActionDto.class, name = "DELETE_APPLICANT"),
  @JsonSubTypes.Type(value = GenerateReportActionDto.class, name = "GENERATE_REPORT"),
  @JsonSubTypes.Type(value = MatchJobActionDto.class, name = "MATCH_JOB"),
  @JsonSubTypes.Type(value = BulkUpdateActionDto.class, name = "BULK_UPDATE"),
  @JsonSubTypes.Type(value = ClarifyActionDto.class, name = "CLARIFY")
})
public sealed interface ParsedActionDto
    permits BulkUpdateActionDto,
        ClarifyActionDto,
        CreateApplicantActionDto,
        DeleteApplicantActionDto,
        ExportDataActionDto,
        FilterApplicantsActionDto,
        GenerateReportActionDto,
        MatchJobActionDto,
        UpdateStatusActionDto {

  ActionType type();
}
