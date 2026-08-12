package com.recruita.api.applicant.service;

import com.recruita.api.api.dto.applicant.ApplicantDto;
import com.recruita.api.api.dto.applicant.ApplicantSummaryDto;
import com.recruita.api.api.dto.applicant.SaveApplicantRequestDto;
import com.recruita.api.applicant.mapper.ApplicantMapper;
import com.recruita.api.applicant.roster.RosterMutationCoordinator;
import com.recruita.api.applicant.roster.RosterWatermark;
import com.recruita.api.common.exception.ApplicantConflictException;
import com.recruita.api.common.exception.ApplicantNotFoundException;
import com.recruita.api.config.properties.ApplicantProperties;
import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.persistence.entity.ApplicantEntity;
import com.recruita.api.persistence.repository.ApplicantRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@ConditionalOnProperty(prefix = "recruita.persistence", name = "enabled", havingValue = "true")
public class DefaultApplicantApplicationService implements ApplicantApplicationService {

  private final ApplicantRepository repository;
  private final ApplicantMapper mapper;
  private final RosterWatermarkService rosterWatermarkService;
  private final RosterMutationCoordinator rosterMutationCoordinator;
  private final ApplicantProperties.MessageProperties messages;
  private final Sort listSort;

  public DefaultApplicantApplicationService(
      ApplicantRepository repository,
      ApplicantMapper mapper,
      RosterWatermarkService rosterWatermarkService,
      RosterMutationCoordinator rosterMutationCoordinator,
      RecruitaProperties properties) {
    this.repository = repository;
    this.mapper = mapper;
    this.rosterWatermarkService = rosterWatermarkService;
    this.rosterMutationCoordinator = rosterMutationCoordinator;
    this.messages = properties.getApplicant().getMessages();
    this.listSort = Sort.by(Sort.Direction.DESC, properties.getApplicant().getListSortProperty());
  }

  @Override
  @Transactional(readOnly = true)
  public ApplicantSummaryListResult listSummaries(String ifNoneMatch) {
    RosterWatermark watermark = rosterWatermarkService.current();
    if (matchesIfNoneMatch(ifNoneMatch, watermark.etag())) {
      return new ApplicantSummaryListResult(watermark, Optional.empty());
    }
    return new ApplicantSummaryListResult(
        watermark, Optional.of(mapper.toSummaryDtoList(repository.findAll(listSort))));
  }

  @Override
  @Transactional(readOnly = true)
  public List<ApplicantSummaryDto> listSummaries() {
    return mapper.toSummaryDtoList(repository.findAll(listSort));
  }

  @Override
  @Transactional(readOnly = true)
  public List<ApplicantDto> listFull() {
    return mapper.toDtoList(repository.findAll(listSort));
  }

  @Override
  @Transactional(readOnly = true)
  public ApplicantDto findById(String id) {
    ApplicantEntity entity =
        repository
            .findById(id)
            .orElseThrow(() -> new ApplicantNotFoundException(messages.getNotFound()));
    return mapper.toDto(entity);
  }

  @Override
  @Transactional
  public ApplicantDto create(SaveApplicantRequestDto request) {
    if (repository.existsById(request.id())) {
      throw new ApplicantConflictException(messages.getAlreadyExists());
    }
    ApplicantEntity entity = mapper.toNewEntity(request);
    ApplicantDto created = mapper.toDto(repository.save(entity));
    rosterMutationCoordinator.onRosterMutation();
    return created;
  }

  @Override
  @Transactional
  public ApplicantDto update(String id, SaveApplicantRequestDto request) {
    if (!id.equals(request.id())) {
      throw new ApplicantConflictException(messages.getIdMismatch());
    }
    ApplicantEntity entity =
        repository
            .findById(id)
            .orElseThrow(() -> new ApplicantNotFoundException(messages.getNotFound()));
    mapper.applyRequest(entity, request);
    ApplicantDto updated = mapper.toDto(repository.save(entity));
    rosterMutationCoordinator.onRosterMutation();
    return updated;
  }

  @Override
  @Transactional
  public void delete(String id) {
    if (!repository.existsById(id)) {
      throw new ApplicantNotFoundException(messages.getNotFound());
    }
    repository.deleteById(id);
    rosterMutationCoordinator.onRosterMutation();
  }

  private static boolean matchesIfNoneMatch(String ifNoneMatch, String etag) {
    if (ifNoneMatch == null || ifNoneMatch.isBlank()) {
      return false;
    }
    String trimmed = ifNoneMatch.trim();
    for (String candidate : trimmed.split(",")) {
      if (etag.equals(candidate.trim())) {
        return true;
      }
    }
    return false;
  }
}
