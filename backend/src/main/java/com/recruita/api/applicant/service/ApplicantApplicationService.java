package com.recruita.api.applicant.service;

import com.recruita.api.api.dto.applicant.ApplicantDto;
import com.recruita.api.api.dto.applicant.ApplicantSummaryDto;
import com.recruita.api.api.dto.applicant.SaveApplicantRequestDto;
import com.recruita.api.applicant.roster.RosterWatermark;
import java.util.List;
import java.util.Optional;

public interface ApplicantApplicationService {

  RosterWatermark rosterWatermark();

  Optional<List<ApplicantSummaryDto>> listSummariesIfNotModified(String ifNoneMatch);

  List<ApplicantSummaryDto> listSummaries();

  List<ApplicantDto> listFull();

  ApplicantDto findById(String id);

  ApplicantDto create(SaveApplicantRequestDto request);

  ApplicantDto update(String id, SaveApplicantRequestDto request);

  void delete(String id);
}
