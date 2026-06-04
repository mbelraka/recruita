package com.recruita.api.profile.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.recruita.api.api.dto.profile.SaveProfileRequestDto;
import com.recruita.api.common.enums.UiLanguage;
import com.recruita.api.persistence.entity.ProfileEntity;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

class ProfileMapperTest {

  private final ProfileMapper mapper = Mappers.getMapper(ProfileMapper.class);

  @Test
  void mapsPrivacyFlagToDto() {
    var entity =
        mapper.toNewEntity(
            new SaveProfileRequestDto("p-1", true, UiLanguage.DE, true, false, true));

    var dto = mapper.toDto(entity);

    assertTrue(dto.privacyNoticeAccepted());
    assertEquals(UiLanguage.DE, dto.lastLanguage());
    assertTrue(dto.optionalRemoteTranslation());
    assertFalse(dto.optionalGeocoding());
    assertTrue(dto.optionalAiMatching());
  }

  @Test
  void applyRequestUpdatesExistingEntity() {
    ProfileEntity entity = new ProfileEntity();
    entity.setId("p-1");
    entity.setPrivacyNoticeAccepted(false);
    entity.setLastLanguage(UiLanguage.EN);
    entity.setOptionalRemoteTranslation(false);
    entity.setOptionalGeocoding(false);
    entity.setOptionalAiMatching(false);

    mapper.applyRequest(
        entity, new SaveProfileRequestDto("p-1", true, UiLanguage.FR, true, true, false));

    assertTrue(entity.isPrivacyNoticeAccepted());
    assertEquals(UiLanguage.FR, entity.getLastLanguage());
    assertTrue(entity.isOptionalRemoteTranslation());
    assertTrue(entity.isOptionalGeocoding());
    assertFalse(entity.isOptionalAiMatching());
  }
}
