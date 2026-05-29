package com.recruita.api.applicant.service;

import com.recruita.api.api.dto.applicant.ApplicantDto;
import com.recruita.api.api.dto.applicant.ApplicantSummaryDto;
import com.recruita.api.api.dto.applicant.SaveApplicantRequestDto;
import com.recruita.api.applicant.mapper.ApplicantMapper;
import com.recruita.api.applicant.message.ApplicantApiErrorMessage;
import com.recruita.api.common.exception.ApplicantConflictException;
import com.recruita.api.common.exception.ApplicantNotFoundException;
import com.recruita.api.persistence.entity.ApplicantEntity;
import com.recruita.api.persistence.repository.ApplicantRepository;
import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@ConditionalOnProperty(prefix = "recruita.persistence", name = "enabled", havingValue = "true")
public class DefaultApplicantApplicationService implements ApplicantApplicationService {

  private static final Sort LIST_SORT = Sort.by(Sort.Direction.DESC, "updatedAt");

  private final ApplicantRepository repository;
  private final ApplicantMapper mapper;

  public DefaultApplicantApplicationService(
      ApplicantRepository repository, ApplicantMapper mapper) {
    this.repository = repository;
    this.mapper = mapper;
  }

  @Override
  @Transactional(readOnly = true)
  public List<ApplicantSummaryDto> listSummaries() {
    return mapper.toSummaryDtoList(repository.findAll(LIST_SORT));
  }

  @Override
  @Transactional(readOnly = true)
  public List<ApplicantDto> listFull() {
    return mapper.toDtoList(repository.findAll(LIST_SORT));
  }

  @Override
  @Transactional(readOnly = true)
  public ApplicantDto findById(String id) {
    ApplicantEntity entity =
        repository
            .findById(id)
            .orElseThrow(
                () -> new ApplicantNotFoundException(ApplicantApiErrorMessage.NOT_FOUND.message()));
    return mapper.toDto(entity);
  }

  @Override
  @Transactional
  public ApplicantDto create(SaveApplicantRequestDto request) {
    if (repository.existsById(request.id())) {
      throw new ApplicantConflictException(ApplicantApiErrorMessage.ALREADY_EXISTS.message());
    }
    ApplicantEntity entity = mapper.toNewEntity(request);
    return mapper.toDto(repository.save(entity));
  }

  @Override
  @Transactional
  public ApplicantDto update(String id, SaveApplicantRequestDto request) {
    ApplicantEntity entity =
        repository
            .findById(id)
            .orElseThrow(
                () -> new ApplicantNotFoundException(ApplicantApiErrorMessage.NOT_FOUND.message()));
    mapper.applyRequest(entity, request);
    return mapper.toDto(repository.save(entity));
  }

  @Override
  @Transactional
  public void delete(String id) {
    if (!repository.existsById(id)) {
      throw new ApplicantNotFoundException(ApplicantApiErrorMessage.NOT_FOUND.message());
    }
    repository.deleteById(id);
  }
}
