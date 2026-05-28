package com.recruita.api.seed;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruita.api.api.dto.profile.ProfileDto;
import com.recruita.api.common.enums.UiLanguage;
import com.recruita.api.common.exception.ProfileConflictException;
import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.profile.service.ProfileApplicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminProfileSeederTest {

  @Mock private ProfileApplicationService profileService;

  private AdminProfileSeeder seeder;

  @BeforeEach
  void setUp() {
    RecruitaProperties properties = new RecruitaProperties();
    properties.getProfileApi().setAdminId("admin");
    seeder =
        new AdminProfileSeeder(
            profileService, properties, new ObjectMapper().findAndRegisterModules());
  }

  @Test
  void insertsMissingAdminProfile() throws Exception {
    when(profileService.create(any()))
        .thenReturn(new ProfileDto("admin", false, UiLanguage.EN, false, false, false, null, null));

    seeder.run();

    verify(profileService).create(any());
  }

  @Test
  void skipsExistingAdminProfile() throws Exception {
    doThrow(new ProfileConflictException("exists")).when(profileService).create(any());

    seeder.run();

    verify(profileService).create(any());
  }
}
