package com.recruita.api.action.validation;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class RemainingActionValidatorsTest {

  @Autowired private CreateApplicantParamsValidator createApplicantParamsValidator;

  @Autowired private ExportParamsValidator exportParamsValidator;

  @Autowired private GenerateReportParamsValidator generateReportParamsValidator;

  @Autowired private BulkUpdateParamsValidator bulkUpdateParamsValidator;

  @Autowired private MatchJobParamsValidator matchJobParamsValidator;

  @Autowired private ObjectMapper objectMapper;

  @Test
  void createApplicantAcceptsOptionalPhone() throws Exception {
    var result =
        createApplicantParamsValidator.validate(
            objectMapper.readTree(
                """
                {"name":"Jane Doe","email":"jane@example.com","phone":"+123","skills":["Java"],"yearsOfExperience":3,"currentJobTitle":"Engineer"}
                """));
    assertThat(result.isValid()).isTrue();
    assertThat(result.value().orElseThrow()).containsEntry("phone", "+123");
  }

  @Test
  void exportAcceptsNestedFilters() throws Exception {
    var result =
        exportParamsValidator.validate(
            objectMapper.readTree(
                """
                {"format":"pdf","filters":{"skills":["Go"]}}
                """));
    assertThat(result.isValid()).isTrue();
    assertThat(result.value().orElseThrow()).containsKey("filters");
  }

  @Test
  void exportRejectsInvalidNestedFilters() throws Exception {
    var result =
        exportParamsValidator.validate(
            objectMapper.readTree(
                """
                {"format":"csv","filters":{"status":"bad"}}
                """));
    assertThat(result.isValid()).isFalse();
  }

  @Test
  void generateReportAcceptsNestedFilters() throws Exception {
    var result =
        generateReportParamsValidator.validate(
            objectMapper.readTree(
                """
                {"reportType":"skills_distribution","filters":{"skills":["TypeScript"]}}
                """));
    assertThat(result.isValid()).isTrue();
  }

  @Test
  void bulkUpdateAcceptsNotesOnly() throws Exception {
    var result =
        bulkUpdateParamsValidator.validate(
            objectMapper.readTree(
                """
                {"filters":{"status":"received"},"updates":{"notes":"follow up"}}
                """));
    assertThat(result.isValid()).isTrue();
  }

  @Test
  void bulkUpdateRequiresFilters() throws Exception {
    var result =
        bulkUpdateParamsValidator.validate(
            objectMapper.readTree("{\"updates\":{\"notes\":\"follow up\"}}"));
    assertThat(result.isValid()).isFalse();
  }

  @Test
  void bulkUpdateRejectsInvalidApplicationStatus() throws Exception {
    var result =
        bulkUpdateParamsValidator.validate(
            objectMapper.readTree(
                """
                {"filters":{"status":"received"},"updates":{"applicationStatus":"bad"}}
                """));
    assertThat(result.isValid()).isFalse();
  }

  @Test
  void matchJobAcceptsMaxLimit() throws Exception {
    var result =
        matchJobParamsValidator.validate(
            objectMapper.readTree("{\"jobDescription\":\"Role\",\"limit\":100}"));
    assertThat(result.isValid()).isTrue();
  }

  @Test
  void matchJobUsesDefaultLimit() throws Exception {
    var result =
        matchJobParamsValidator.validate(
            objectMapper.readTree("{\"jobDescription\":\"Backend engineer\"}"));
    assertThat(result.isValid()).isTrue();
    assertThat(result.value().orElseThrow()).containsKey("limit");
  }
}
