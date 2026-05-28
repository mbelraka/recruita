package com.recruita.api.profile.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.recruita.api.api.dto.profile.SaveProfileRequestDto;
import com.recruita.api.common.enums.UiLanguage;
import org.junit.jupiter.api.Test;

class ProfileMapperTest {

  private final ProfileMapper mapper = new ProfileMapper();

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
}
