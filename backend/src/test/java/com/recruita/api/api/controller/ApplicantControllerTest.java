package com.recruita.api.api.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.recruita.api.api.dto.applicant.ApplicantDto;
import com.recruita.api.api.dto.applicant.ApplicantSummaryDto;
import com.recruita.api.api.dto.applicant.SaveApplicantRequestDto;
import com.recruita.api.applicant.roster.RosterWatermark;
import com.recruita.api.applicant.service.ApplicantApplicationService;
import com.recruita.api.applicant.service.ApplicantSummaryListResult;
import com.recruita.api.config.properties.RecruitaProperties;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class ApplicantControllerTest {

  @Mock private ApplicantApplicationService applicantApplicationService;

  private ApplicantController controller;

  private static final SaveApplicantRequestDto SAVE_REQUEST =
      new SaveApplicantRequestDto(
          "a-1", "Alex", null, null, null, null, null, null, null, List.of(), "notes");

  @BeforeEach
  void setUp() {
    controller = new ApplicantController(applicantApplicationService, new RecruitaProperties());
  }

  @Test
  void listApplicantSummariesReturnsSummaryProjection() {
    List<ApplicantSummaryDto> summaries =
        List.of(
            new ApplicantSummaryDto(
                "a-1", "Alex", null, null, null, null, null, null, null, List.of()));
    RosterWatermark watermark = new RosterWatermark(1L, "\"roster-v1-0-1\"", Instant.EPOCH, 1L);
    when(applicantApplicationService.listSummaries(null))
        .thenReturn(new ApplicantSummaryListResult(watermark, Optional.of(summaries)));

    var response = controller.listApplicantSummaries(null);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(summaries, response.getBody());
    assertEquals(watermark.etag(), response.getHeaders().getETag());
    verify(applicantApplicationService).listSummaries(null);
  }

  @Test
  void listApplicantSummariesReturnsNotModifiedWhenEtagMatches() {
    RosterWatermark watermark = new RosterWatermark(2L, "\"roster-v2-0-1\"", Instant.EPOCH, 1L);
    when(applicantApplicationService.listSummaries(watermark.etag()))
        .thenReturn(new ApplicantSummaryListResult(watermark, Optional.empty()));

    var response = controller.listApplicantSummaries(watermark.etag());

    assertEquals(HttpStatus.NOT_MODIFIED, response.getStatusCode());
    assertEquals(watermark.etag(), response.getHeaders().getETag());
    verify(applicantApplicationService).listSummaries(watermark.etag());
  }

  @Test
  void listApplicantsFullReturnsDetailProjection() {
    List<ApplicantDto> applicants =
        List.of(
            new ApplicantDto(
                "a-1", "Alex", null, null, null, null, null, null, null, List.of(), "notes", null,
                null));
    when(applicantApplicationService.listFull()).thenReturn(applicants);

    List<ApplicantDto> result = controller.listApplicantsFull().getBody();

    assertEquals(applicants, result);
    verify(applicantApplicationService).listFull();
  }

  @Test
  void getApplicantReturnsDetailRecord() {
    ApplicantDto applicant =
        new ApplicantDto(
            "a-1", "Alex", null, null, null, null, null, null, null, List.of(), "notes", null,
            null);
    when(applicantApplicationService.findById("a-1")).thenReturn(applicant);

    ApplicantDto result = controller.getApplicant("a-1").getBody();

    assertEquals(applicant, result);
    verify(applicantApplicationService).findById("a-1");
  }

  @Test
  void createApplicantReturnsCreatedRecord() {
    ApplicantDto applicant =
        new ApplicantDto(
            "a-1", "Alex", null, null, null, null, null, null, null, List.of(), "notes", null,
            null);
    when(applicantApplicationService.create(SAVE_REQUEST)).thenReturn(applicant);

    var response = controller.createApplicant(SAVE_REQUEST);

    assertEquals(HttpStatus.CREATED, response.getStatusCode());
    assertEquals(applicant, response.getBody());
    verify(applicantApplicationService).create(SAVE_REQUEST);
  }

  @Test
  void updateApplicantReturnsUpdatedRecord() {
    ApplicantDto applicant =
        new ApplicantDto(
            "a-1", "Alex", null, null, null, null, null, null, null, List.of(), "notes", null,
            null);
    when(applicantApplicationService.update("a-1", SAVE_REQUEST)).thenReturn(applicant);

    ApplicantDto result = controller.updateApplicant("a-1", SAVE_REQUEST).getBody();

    assertEquals(applicant, result);
    verify(applicantApplicationService).update("a-1", SAVE_REQUEST);
  }

  @Test
  void deleteApplicantDelegatesToService() {
    var response = controller.deleteApplicant("a-1");

    assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    verify(applicantApplicationService).delete("a-1");
  }
}
