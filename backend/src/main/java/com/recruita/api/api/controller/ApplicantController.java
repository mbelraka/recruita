package com.recruita.api.api.controller;

import com.recruita.api.api.dto.applicant.ApplicantDto;
import com.recruita.api.api.dto.applicant.ApplicantSummaryDto;
import com.recruita.api.api.dto.applicant.SaveApplicantRequestDto;
import com.recruita.api.applicant.roster.RosterWatermark;
import com.recruita.api.applicant.service.ApplicantApplicationService;
import com.recruita.api.applicant.service.ApplicantSummaryListResult;
import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.generated.api.ApplicantsApi;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
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
  private final String rosterVersionHeader;
  private final String rosterUpdatedAtHeader;

  public ApplicantController(
      ApplicantApplicationService applicantApplicationService, RecruitaProperties properties) {
    this.applicantApplicationService = applicantApplicationService;
    this.rosterVersionHeader = properties.getApplicant().getRoster().getVersionResponseHeader();
    this.rosterUpdatedAtHeader = properties.getApplicant().getRoster().getUpdatedAtResponseHeader();
  }

  @Override
  public ResponseEntity<List<ApplicantSummaryDto>> listApplicantSummaries(String ifNoneMatch) {
    ApplicantSummaryListResult result = applicantApplicationService.listSummaries(ifNoneMatch);
    HttpHeaders headers = rosterHeaders(result.watermark());
    if (result.summaries().isEmpty()) {
      return ResponseEntity.status(HttpStatus.NOT_MODIFIED).headers(headers).build();
    }
    return ResponseEntity.ok().headers(headers).body(result.summaries().orElseThrow());
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

  private HttpHeaders rosterHeaders(RosterWatermark watermark) {
    HttpHeaders headers = new HttpHeaders();
    headers.setETag(watermark.etag());
    headers.add(rosterVersionHeader, Long.toString(watermark.version()));
    headers.add(rosterUpdatedAtHeader, watermark.lastModified().toString());
    return headers;
  }
}
