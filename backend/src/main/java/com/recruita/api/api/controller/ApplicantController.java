package com.recruita.api.api.controller;

import com.recruita.api.api.dto.applicant.ApplicantDto;
import com.recruita.api.api.dto.applicant.SaveApplicantRequestDto;
import com.recruita.api.applicant.service.ApplicantApplicationService;
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

@Validated
@RestController
@RequestMapping
@ConditionalOnProperty(prefix = "recruita.persistence", name = "enabled", havingValue = "true")
public class ApplicantController {

  private final ApplicantApplicationService applicantApplicationService;

  public ApplicantController(ApplicantApplicationService applicantApplicationService) {
    this.applicantApplicationService = applicantApplicationService;
  }

  @GetMapping(path = "#{@apiRoutePaths.applicantsPath}")
  public List<ApplicantDto> listApplicants() {
    return applicantApplicationService.listAll();
  }

  @PostMapping(path = "#{@apiRoutePaths.applicantsPath}")
  @ResponseStatus(HttpStatus.CREATED)
  public ApplicantDto createApplicant(@Valid @RequestBody SaveApplicantRequestDto request) {
    return applicantApplicationService.create(request);
  }

  @PutMapping(path = "#{@apiRoutePaths.applicantsPathWithId}")
  public ApplicantDto updateApplicant(
      @PathVariable String id, @Valid @RequestBody SaveApplicantRequestDto request) {
    return applicantApplicationService.update(id, request);
  }

  @DeleteMapping(path = "#{@apiRoutePaths.applicantsPathWithId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteApplicant(@PathVariable String id) {
    applicantApplicationService.delete(id);
  }
}
