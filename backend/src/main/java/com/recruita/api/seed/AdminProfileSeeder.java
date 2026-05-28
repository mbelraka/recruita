package com.recruita.api.seed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruita.api.api.dto.profile.SaveProfileRequestDto;
import com.recruita.api.common.exception.ProfileConflictException;
import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.profile.service.ProfileApplicationService;
import java.io.IOException;
import java.io.InputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("seed")
@ConditionalOnProperty(prefix = "recruita.seed", name = "admin-profile", havingValue = "true")
public class AdminProfileSeeder implements CommandLineRunner {

  private static final Logger log = LoggerFactory.getLogger(AdminProfileSeeder.class);
  private static final String ADMIN_PROFILE_RESOURCE = "seed/profile-admin.json";

  private final ProfileApplicationService profileService;
  private final RecruitaProperties properties;
  private final ObjectMapper objectMapper;

  public AdminProfileSeeder(
      ProfileApplicationService profileService,
      RecruitaProperties properties,
      ObjectMapper objectMapper) {
    this.profileService = profileService;
    this.properties = properties;
    this.objectMapper = objectMapper;
  }

  @Override
  @Transactional
  public void run(String... args) throws IOException {
    SaveProfileRequestDto profile = loadAdminProfile();
    String adminId = properties.getProfileApi().getAdminId();
    SaveProfileRequestDto request =
        new SaveProfileRequestDto(
            adminId,
            profile.privacyNoticeAccepted(),
            profile.lastLanguage(),
            profile.optionalRemoteTranslation(),
            profile.optionalGeocoding(),
            profile.optionalAiMatching());

    try {
      profileService.create(request);
      log.info("Admin profile seed complete: inserted id={}", adminId);
    } catch (ProfileConflictException ex) {
      log.info("Admin profile seed complete: skipped existing id={}", adminId);
    }
  }

  private SaveProfileRequestDto loadAdminProfile() throws IOException {
    ClassPathResource resource = new ClassPathResource(ADMIN_PROFILE_RESOURCE);
    try (InputStream input = resource.getInputStream()) {
      return objectMapper.readValue(input, SaveProfileRequestDto.class);
    }
  }
}
