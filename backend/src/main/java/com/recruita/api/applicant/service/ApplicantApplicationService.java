package com.recruita.api.applicant.service;

import com.recruita.api.api.dto.applicant.ApplicantDto;
import com.recruita.api.api.dto.applicant.SaveApplicantRequestDto;
import java.util.List;

public interface ApplicantApplicationService {

  List<ApplicantDto> listAll();

  ApplicantDto create(SaveApplicantRequestDto request);

  ApplicantDto update(String id, SaveApplicantRequestDto request);

  void delete(String id);
}
