package com.recruita.api.profile.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.recruita.api.api.dto.profile.SaveProfileRequestDto;
import com.recruita.api.common.enums.UiLanguage;
import com.recruita.api.common.exception.ProfileConflictException;
import com.recruita.api.common.exception.ProfileNotFoundException;
import com.recruita.api.persistence.entity.ProfileEntity;
import com.recruita.api.persistence.repository.ProfileRepository;
import com.recruita.api.profile.mapper.ProfileMapper;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DefaultProfileApplicationServiceTest {

  @Mock private ProfileRepository repository;

  private DefaultProfileApplicationService service;

  @BeforeEach
  void setUp() {
    service = new DefaultProfileApplicationService(repository, new ProfileMapper());
  }

  @Test
  void findByIdReturnsMappedProfile() {
    ProfileEntity entity = new ProfileEntity();
    entity.setId("p-1");
    entity.setPrivacyNoticeAccepted(true);
    entity.setLastLanguage(UiLanguage.DE);
    entity.setOptionalRemoteTranslation(true);
    entity.setOptionalGeocoding(false);
    entity.setOptionalAiMatching(true);
    when(repository.findById("p-1")).thenReturn(Optional.of(entity));

    var profile = service.findById("p-1");

    assertEquals(true, profile.privacyNoticeAccepted());
    assertEquals(UiLanguage.DE, profile.lastLanguage());
    assertEquals(true, profile.optionalRemoteTranslation());
    assertEquals(false, profile.optionalGeocoding());
    assertEquals(true, profile.optionalAiMatching());
  }

  @Test
  void createRejectsDuplicateIds() {
    when(repository.existsById("dup")).thenReturn(true);

    assertThrows(
        ProfileConflictException.class,
        () ->
            service.create(
                new SaveProfileRequestDto("dup", true, UiLanguage.EN, false, false, false)));
    verify(repository, never()).save(any());
  }

  @Test
  void updateThrowsWhenMissing() {
    when(repository.findById("missing")).thenReturn(Optional.empty());

    assertThrows(
        ProfileNotFoundException.class,
        () ->
            service.update(
                "missing",
                new SaveProfileRequestDto("missing", true, UiLanguage.EN, false, false, false)));
  }
}
