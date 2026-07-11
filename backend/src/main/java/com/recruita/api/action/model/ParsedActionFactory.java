package com.recruita.api.action.model;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class ParsedActionFactory {

  private final ObjectMapper objectMapper;

  public ParsedActionFactory(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  public ParsedActionDto from(ActionType type, Map<String, Object> params) {
    return switch (type) {
      case FILTER_APPLICANTS ->
          new FilterApplicantsActionDto(convert(params, FilterParamsDto.class));
      case UPDATE_STATUS -> new UpdateStatusActionDto(convert(params, UpdateStatusParamsDto.class));
      case EXPORT_DATA -> new ExportDataActionDto(convert(params, ExportParamsDto.class));
      case CREATE_APPLICANT ->
          new CreateApplicantActionDto(convert(params, CreateApplicantParamsDto.class));
      case DELETE_APPLICANT ->
          new DeleteApplicantActionDto(convert(params, DeleteApplicantParamsDto.class));
      case GENERATE_REPORT ->
          new GenerateReportActionDto(convert(params, GenerateReportParamsDto.class));
      case MATCH_JOB -> new MatchJobActionDto(convert(params, MatchJobParamsDto.class));
      case BULK_UPDATE -> new BulkUpdateActionDto(convert(params, BulkUpdateParamsDto.class));
      case CLARIFY -> new ClarifyActionDto(convert(params, ClarifyParamsDto.class));
    };
  }

  private <T> T convert(Map<String, Object> params, Class<T> targetType) {
    return objectMapper.convertValue(params, targetType);
  }
}
