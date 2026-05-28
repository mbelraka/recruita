package com.recruita.api.profile.mapper;

import com.recruita.api.api.dto.profile.ProfileDto;
import com.recruita.api.api.dto.profile.SaveProfileRequestDto;
import com.recruita.api.persistence.entity.ProfileEntity;
import org.springframework.stereotype.Component;

@Component
public class ProfileMapper {

  public ProfileDto toDto(ProfileEntity entity) {
    return new ProfileDto(
        entity.getId(),
        entity.isPrivacyNoticeAccepted(),
        entity.getLastLanguage(),
        entity.isOptionalRemoteTranslation(),
        entity.isOptionalGeocoding(),
        entity.isOptionalAiMatching(),
        entity.getCreatedAt(),
        entity.getUpdatedAt());
  }

  public ProfileEntity toNewEntity(SaveProfileRequestDto request) {
    ProfileEntity entity = new ProfileEntity();
    applyRequest(entity, request);
    return entity;
  }

  public void applyRequest(ProfileEntity entity, SaveProfileRequestDto request) {
    entity.setId(request.id());
    entity.setPrivacyNoticeAccepted(
        request.privacyNoticeAccepted() != null && request.privacyNoticeAccepted());
    entity.setLastLanguage(request.lastLanguage());
    entity.setOptionalRemoteTranslation(
        request.optionalRemoteTranslation() != null && request.optionalRemoteTranslation());
    entity.setOptionalGeocoding(request.optionalGeocoding() != null && request.optionalGeocoding());
    entity.setOptionalAiMatching(
        request.optionalAiMatching() != null && request.optionalAiMatching());
  }
}
