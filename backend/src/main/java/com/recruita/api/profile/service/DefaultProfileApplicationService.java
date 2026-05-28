package com.recruita.api.profile.service;

import com.recruita.api.api.dto.profile.ProfileDto;
import com.recruita.api.api.dto.profile.SaveProfileRequestDto;
import com.recruita.api.common.exception.ProfileConflictException;
import com.recruita.api.common.exception.ProfileNotFoundException;
import com.recruita.api.persistence.entity.ProfileEntity;
import com.recruita.api.persistence.repository.ProfileRepository;
import com.recruita.api.profile.mapper.ProfileMapper;
import com.recruita.api.profile.message.ProfileApiErrorMessage;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@ConditionalOnProperty(prefix = "recruita.persistence", name = "enabled", havingValue = "true")
public class DefaultProfileApplicationService implements ProfileApplicationService {

  private final ProfileRepository repository;
  private final ProfileMapper mapper;

  public DefaultProfileApplicationService(ProfileRepository repository, ProfileMapper mapper) {
    this.repository = repository;
    this.mapper = mapper;
  }

  @Override
  @Transactional(readOnly = true)
  public ProfileDto findById(String id) {
    return mapper.toDto(
        repository
            .findById(id)
            .orElseThrow(
                () -> new ProfileNotFoundException(ProfileApiErrorMessage.NOT_FOUND.message())));
  }

  @Override
  @Transactional
  public ProfileDto create(SaveProfileRequestDto request) {
    if (repository.existsById(request.id())) {
      throw new ProfileConflictException(ProfileApiErrorMessage.ALREADY_EXISTS.message());
    }
    ProfileEntity entity = mapper.toNewEntity(request);
    return mapper.toDto(repository.save(entity));
  }

  @Override
  @Transactional
  public ProfileDto update(String id, SaveProfileRequestDto request) {
    ProfileEntity entity =
        repository
            .findById(id)
            .orElseThrow(
                () -> new ProfileNotFoundException(ProfileApiErrorMessage.NOT_FOUND.message()));
    mapper.applyRequest(entity, request);
    return mapper.toDto(repository.save(entity));
  }
}
