package com.recruita.api.api.controller;

import com.recruita.api.api.dto.applicant.ApplicantDto;
import com.recruita.api.api.dto.applicant.ApplicantSummaryDto;
import com.recruita.api.api.dto.applicant.SaveApplicantRequestDto;
import com.recruita.api.applicant.service.ApplicantApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(
    name = "Applicants",
    description =
        "Applicant roster CRUD (requires recruita.persistence.enabled=true / dev,persistence)")
@Validated
@RestController
@RequestMapping
@ConditionalOnProperty(prefix = "recruita.persistence", name = "enabled", havingValue = "true")
public class ApplicantController {

  private final ApplicantApplicationService applicantApplicationService;

  public ApplicantController(ApplicantApplicationService applicantApplicationService) {
    this.applicantApplicationService = applicantApplicationService;
  }

  @Operation(summary = "List applicant summaries")
  @GetMapping(path = "#{@apiRoutePaths.applicantsPath}")
  public List<ApplicantSummaryDto> listApplicantSummaries() {
    return applicantApplicationService.listSummaries();
  }

  @Operation(summary = "List applicants with full fields")
  @GetMapping(path = "#{@apiRoutePaths.applicantsFullPath}")
  public List<ApplicantDto> listApplicantsFull() {
    return applicantApplicationService.listFull();
  }

  @Operation(summary = "Get applicant by id")
  @GetMapping(path = "#{@apiRoutePaths.applicantsPathWithId}")
  public ApplicantDto getApplicant(@PathVariable String id) {
    return applicantApplicationService.findById(id);
  }

  @Operation(summary = "Create applicant")
  @PostMapping(path = "#{@apiRoutePaths.applicantsPath}")
  @ResponseStatus(HttpStatus.CREATED)
  public ApplicantDto createApplicant(@Valid @RequestBody SaveApplicantRequestDto request) {
    return applicantApplicationService.create(request);
  }

  @Operation(summary = "Update applicant")
  @PutMapping(path = "#{@apiRoutePaths.applicantsPathWithId}")
  public ApplicantDto updateApplicant(
      @PathVariable String id, @Valid @RequestBody SaveApplicantRequestDto request) {
    return applicantApplicationService.update(id, request);
  }

  @Operation(summary = "Delete applicant")
  @DeleteMapping(path = "#{@apiRoutePaths.applicantsPathWithId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteApplicant(@PathVariable String id) {
    applicantApplicationService.delete(id);
  }
}
