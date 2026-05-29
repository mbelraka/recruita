package com.recruita.api.api.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.recruita.api.api.dto.applicant.ApplicantDto;
import com.recruita.api.api.dto.applicant.ApplicantSummaryDto;
import com.recruita.api.api.dto.applicant.SaveApplicantRequestDto;
import com.recruita.api.applicant.service.ApplicantApplicationService;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ApplicantControllerTest {

  @Mock private ApplicantApplicationService applicantApplicationService;

  private ApplicantController controller;

  private static final SaveApplicantRequestDto SAVE_REQUEST =
      new SaveApplicantRequestDto(
          "a-1", "Alex", null, null, null, null, null, null, null, List.of(), "notes");

  @BeforeEach
  void setUp() {
    controller = new ApplicantController(applicantApplicationService);
  }

  @Test
  void listApplicantSummariesReturnsSummaryProjection() {
    List<ApplicantSummaryDto> summaries =
        List.of(
            new ApplicantSummaryDto(
                "a-1", "Alex", null, null, null, null, null, null, null, List.of()));
    when(applicantApplicationService.listSummaries()).thenReturn(summaries);

    List<ApplicantSummaryDto> result = controller.listApplicantSummaries();

    assertEquals(summaries, result);
    verify(applicantApplicationService).listSummaries();
  }

  @Test
  void listApplicantsFullReturnsDetailProjection() {
    List<ApplicantDto> applicants =
        List.of(
            new ApplicantDto(
                "a-1", "Alex", null, null, null, null, null, null, null, List.of(), "notes", null,
                null));
    when(applicantApplicationService.listFull()).thenReturn(applicants);

    List<ApplicantDto> result = controller.listApplicantsFull();

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

    ApplicantDto result = controller.getApplicant("a-1");

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

    ApplicantDto result = controller.createApplicant(SAVE_REQUEST);

    assertEquals(applicant, result);
    verify(applicantApplicationService).create(SAVE_REQUEST);
  }

  @Test
  void updateApplicantReturnsUpdatedRecord() {
    ApplicantDto applicant =
        new ApplicantDto(
            "a-1", "Alex", null, null, null, null, null, null, null, List.of(), "notes", null,
            null);
    when(applicantApplicationService.update("a-1", SAVE_REQUEST)).thenReturn(applicant);

    ApplicantDto result = controller.updateApplicant("a-1", SAVE_REQUEST);

    assertEquals(applicant, result);
    verify(applicantApplicationService).update("a-1", SAVE_REQUEST);
  }

  @Test
  void deleteApplicantDelegatesToService() {
    controller.deleteApplicant("a-1");

    verify(applicantApplicationService).delete("a-1");
  }
}
