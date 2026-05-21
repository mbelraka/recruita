package com.recruita.api.applicant.service;

import com.recruita.api.api.dto.applicant.ApplicantDto;
import com.recruita.api.api.dto.applicant.SaveApplicantRequestDto;
import com.recruita.api.applicant.mapper.ApplicantMapper;
import com.recruita.api.common.exception.ApplicantConflictException;
import com.recruita.api.common.exception.ApplicantNotFoundException;
import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.persistence.entity.ApplicantEntity;
import com.recruita.api.persistence.repository.ApplicantRepository;
import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@ConditionalOnProperty(prefix = "recruita.persistence", name = "enabled", havingValue = "true")
public class DefaultApplicantApplicationService implements ApplicantApplicationService {

  private final ApplicantRepository repository;
  private final ApplicantMapper mapper;
  private final RecruitaProperties properties;

  public DefaultApplicantApplicationService(
      ApplicantRepository repository, ApplicantMapper mapper, RecruitaProperties properties) {
    this.repository = repository;
    this.mapper = mapper;
    this.properties = properties;
  }

  @Override
  @Transactional(readOnly = true)
  public List<ApplicantDto> listAll() {
    return mapper.toDtoList(repository.findAll());
  }

  @Override
  @Transactional
  public ApplicantDto create(SaveApplicantRequestDto request) {
    if (repository.existsById(request.id())) {
      throw new ApplicantConflictException(properties.getApplicant().getAlreadyExists());
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
                () -> new ApplicantNotFoundException(properties.getApplicant().getNotFound()));
    mapper.applyRequest(entity, request);
    return mapper.toDto(repository.save(entity));
  }

  @Override
  @Transactional
  public void delete(String id) {
    if (!repository.existsById(id)) {
      throw new ApplicantNotFoundException(properties.getApplicant().getNotFound());
    }
    repository.deleteById(id);
  }
}
