package com.recruita.api.api.controller;

import com.recruita.api.api.dto.applicant.ApplicantDto;
import com.recruita.api.api.dto.applicant.ApplicantSummaryDto;
import com.recruita.api.api.dto.applicant.SaveApplicantRequestDto;
import com.recruita.api.applicant.service.ApplicantApplicationService;
import com.recruita.api.generated.api.ApplicantsApi;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RestController;

@Tag(
    name = "Applicants",
    description =
        "Applicant roster CRUD (requires recruita.persistence.enabled=true / dev,persistence)")
@Validated
@RestController
@ConditionalOnProperty(prefix = "recruita.persistence", name = "enabled", havingValue = "true")
public class ApplicantController implements ApplicantsApi {

  private final ApplicantApplicationService applicantApplicationService;

  public ApplicantController(ApplicantApplicationService applicantApplicationService) {
    this.applicantApplicationService = applicantApplicationService;
  }

  @Override
  public ResponseEntity<List<ApplicantSummaryDto>> listApplicantSummaries() {
    return ResponseEntity.ok(applicantApplicationService.listSummaries());
  }

  @Override
  public ResponseEntity<List<ApplicantDto>> listApplicantsFull() {
    return ResponseEntity.ok(applicantApplicationService.listFull());
  }

  @Override
  public ResponseEntity<ApplicantDto> getApplicant(String id) {
    return ResponseEntity.ok(applicantApplicationService.findById(id));
  }

  @Override
  public ResponseEntity<ApplicantDto> createApplicant(SaveApplicantRequestDto request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(applicantApplicationService.create(request));
  }

  @Override
  public ResponseEntity<ApplicantDto> updateApplicant(String id, SaveApplicantRequestDto request) {
    return ResponseEntity.ok(applicantApplicationService.update(id, request));
  }

  @Override
  public ResponseEntity<Void> deleteApplicant(String id) {
    applicantApplicationService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
