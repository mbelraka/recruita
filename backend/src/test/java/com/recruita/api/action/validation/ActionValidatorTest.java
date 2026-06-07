package com.recruita.api.action.validation;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruita.api.action.model.ActionValidationResult;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ActionValidatorTest {

  @Autowired private ActionValidator actionValidator;

  @Autowired private ObjectMapper objectMapper;

  @Test
  void validatesFilterApplicants() throws Exception {
    assertValid(
        """
        {"type":"FILTER_APPLICANTS","params":{"skills":["React"],"status":"received"}}
        """);
  }

  @Test
  void validatesClarify() throws Exception {
    assertValid(
        """
        {"type":"CLARIFY","params":{"questions":["Which status?"]}}
        """);
  }

  @Test
  void validatesUpdateStatus() throws Exception {
    assertValid(
        """
        {"type":"UPDATE_STATUS","params":{"applicantIdentifier":"a@x.com","newStatus":"screening"}}
        """);
  }

  @Test
  void validatesExportData() throws Exception {
    assertValid(
        """
        {"type":"EXPORT_DATA","params":{"format":"csv"}}
        """);
  }

  @Test
  void validatesCreateApplicant() throws Exception {
    assertValid(
        """
        {"type":"CREATE_APPLICANT","params":{"name":"Jane Doe","email":"jane@example.com","skills":["Java"],"yearsOfExperience":3,"currentJobTitle":"Engineer"}}
        """);
  }

  @Test
  void validatesDeleteApplicant() throws Exception {
    assertValid(
        """
        {"type":"DELETE_APPLICANT","params":{"applicantIdentifier":"id-1"}}
        """);
  }

  @Test
  void validatesGenerateReport() throws Exception {
    assertValid(
        """
        {"type":"GENERATE_REPORT","params":{"reportType":"pipeline_summary"}}
        """);
  }

  @Test
  void validatesMatchJob() throws Exception {
    assertValid(
        """
        {"type":"MATCH_JOB","params":{"jobDescription":"Senior React engineer","limit":5}}
        """);
  }

  @Test
  void validatesBulkUpdate() throws Exception {
    assertValid(
        """
        {"type":"BULK_UPDATE","params":{"filters":{"status":"received"},"updates":{"applicationStatus":"screening"}}}
        """);
  }

  @Test
  void rejectsMissingActionType() throws Exception {
    ActionValidationResult result =
        actionValidator.validate(objectMapper.readTree("{\"params\":{}}"));

    assertThat(result.valid()).isFalse();
    assertThat(result.errors()).contains("Action type is required");
  }

  @Test
  void rejectsUnknownActionType() throws Exception {
    ActionValidationResult result =
        actionValidator.validate(objectMapper.readTree("{\"type\":\"UNKNOWN\",\"params\":{}}"));

    assertThat(result.valid()).isFalse();
    assertThat(result.errors().getFirst()).contains("Invalid action type");
  }

  @Test
  void rejectsInvalidFilterParams() throws Exception {
    ActionValidationResult result =
        actionValidator.validate(
            objectMapper.readTree(
                """
                {"type":"FILTER_APPLICANTS","params":{"skills":[1],"status":"bad"}}
                """));

    assertThat(result.valid()).isFalse();
    assertThat(result.errors()).isNotEmpty();
  }

  @Test
  void rejectsInvalidCreateApplicant() throws Exception {
    ActionValidationResult result =
        actionValidator.validate(
            objectMapper.readTree(
                """
                {"type":"CREATE_APPLICANT","params":{"name":"J","email":"bad","skills":[],"yearsOfExperience":99,"currentJobTitle":""}}
                """));

    assertThat(result.valid()).isFalse();
    assertThat(result.errors().size()).isGreaterThan(1);
  }

  @Test
  void rejectsNonObjectRoot() {
    ActionValidationResult result = actionValidator.validate(null);

    assertThat(result.valid()).isFalse();
    assertThat(result.errors()).contains("Action must be an object");
  }

  @Test
  void rejectsInvalidClarifyQuestions() throws Exception {
    assertInvalid(
        """
        {"type":"CLARIFY","params":{"questions":[]}}
        """);
  }

  @Test
  void rejectsInvalidExportFormat() throws Exception {
    assertInvalid(
        """
        {"type":"EXPORT_DATA","params":{"format":"xml"}}
        """);
  }

  @Test
  void rejectsInvalidDeleteIdentifier() throws Exception {
    assertInvalid(
        """
        {"type":"DELETE_APPLICANT","params":{"applicantIdentifier":"  "}}
        """);
  }

  @Test
  void rejectsInvalidReportType() throws Exception {
    assertInvalid(
        """
        {"type":"GENERATE_REPORT","params":{"reportType":"unknown"}}
        """);
  }

  @Test
  void rejectsInvalidMatchJobDescription() throws Exception {
    assertInvalid(
        """
        {"type":"MATCH_JOB","params":{"jobDescription":"","limit":500}}
        """);
  }

  @Test
  void rejectsBulkUpdateWithInvalidFields() throws Exception {
    assertInvalid(
        """
        {"type":"BULK_UPDATE","params":{"filters":{"status":"bad"},"updates":{"foo":"bar"}}}
        """);
  }

  @Test
  void rejectsUpdateStatusWithInvalidStatus() throws Exception {
    assertInvalid(
        """
        {"type":"UPDATE_STATUS","params":{"applicantIdentifier":"id","newStatus":"bad"}}
        """);
  }

  private void assertInvalid(String json) throws Exception {
    ActionValidationResult result = actionValidator.validate(objectMapper.readTree(json));
    assertThat(result.valid()).isFalse();
    assertThat(result.errors()).isNotEmpty();
  }

  private void assertValid(String json) throws Exception {
    ActionValidationResult result = actionValidator.validate(objectMapper.readTree(json));
    assertThat(result.valid()).isTrue();
    assertThat(result.action()).containsKey("type");
    assertThat(result.action()).containsKey("params");
  }
}
