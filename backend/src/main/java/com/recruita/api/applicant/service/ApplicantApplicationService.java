package com.recruita.api.applicant.service;

import com.recruita.api.api.dto.applicant.ApplicantDto;
import com.recruita.api.api.dto.applicant.ApplicantSummaryDto;
import com.recruita.api.api.dto.applicant.SaveApplicantRequestDto;
import java.util.List;

public interface ApplicantApplicationService {

  List<ApplicantSummaryDto> listSummaries();

  List<ApplicantDto> listFull();

  ApplicantDto findById(String id);

  ApplicantDto create(SaveApplicantRequestDto request);

  ApplicantDto update(String id, SaveApplicantRequestDto request);

  void delete(String id);
}
