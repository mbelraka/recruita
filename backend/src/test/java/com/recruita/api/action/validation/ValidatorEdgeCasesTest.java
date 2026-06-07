package com.recruita.api.action.validation;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruita.api.action.model.ApplicationStatusWire;
import com.recruita.api.action.model.ExportFormatWire;
import com.recruita.api.action.model.ReportType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ValidatorEdgeCasesTest {

  @Autowired private ClarifyParamsValidator clarifyParamsValidator;

  @Autowired private DeleteApplicantParamsValidator deleteApplicantParamsValidator;

  @Autowired private UpdateStatusParamsValidator updateStatusParamsValidator;

  @Autowired private ExportParamsValidator exportParamsValidator;

  @Autowired private GenerateReportParamsValidator generateReportParamsValidator;

  @Autowired private ObjectMapper objectMapper;

  @Test
  void clarifyRejectsNonObjectParams() {
    assertThat(clarifyParamsValidator.validate(null).isValid()).isFalse();
  }

  @Test
  void deleteRejectsNonObjectParams() {
    assertThat(deleteApplicantParamsValidator.validate(null).isValid()).isFalse();
  }

  @Test
  void updateStatusRejectsNonObjectParams() {
    assertThat(updateStatusParamsValidator.validate(null).isValid()).isFalse();
  }

  @Test
  void exportRejectsNonObjectParams() {
    assertThat(exportParamsValidator.validate(null).isValid()).isFalse();
  }

  @Test
  void generateReportRejectsNonObjectParams() throws Exception {
    assertThat(
            generateReportParamsValidator
                .validate(
                    objectMapper.readTree(
                        "{\"reportType\":\"pipeline_summary\",\"filters\":{\"skills\":[1]}}"))
                .isValid())
        .isFalse();
  }

  @Test
  void updateStatusRejectsMissingIdentifier() throws Exception {
    assertThat(
            updateStatusParamsValidator
                .validate(
                    objectMapper.readTree(
                        "{\"applicantIdentifier\":\"\",\"newStatus\":\"received\"}"))
                .isValid())
        .isFalse();
  }

  @Test
  void wireEnumsExposeCatalogValues() {
    assertThat(ApplicationStatusWire.isWireValue("received")).isTrue();
    assertThat(ApplicationStatusWire.formatList()).contains("received");
    assertThat(ExportFormatWire.isWireValue("pdf")).isTrue();
    assertThat(ExportFormatWire.joinedPipe()).contains("pdf");
    assertThat(ReportType.PIPELINE_SUMMARY.wireValue()).isEqualTo("pipeline_summary");
    assertThat(ReportType.isWireValue("pipeline_summary")).isTrue();
    assertThat(ReportType.joinedPipe()).contains("pipeline_summary");
    assertThat(ApplicationStatusWire.joinedPipe()).contains("received");
  }
}
