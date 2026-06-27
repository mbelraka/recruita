package com.recruita.api.api.controller;

import com.recruita.api.api.dto.profile.ProfileDto;
import com.recruita.api.api.dto.profile.SaveProfileRequestDto;
import com.recruita.api.generated.api.ProfilesApi;
import com.recruita.api.profile.service.ProfileApplicationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RestController;

@Tag(
    name = "Profiles",
    description = "Session profile and privacy consent flags (persistence profile required)")
@Validated
@RestController
@ConditionalOnProperty(prefix = "recruita.persistence", name = "enabled", havingValue = "true")
public class ProfileController implements ProfilesApi {

  private final ProfileApplicationService profileApplicationService;

  public ProfileController(ProfileApplicationService profileApplicationService) {
    this.profileApplicationService = profileApplicationService;
  }

  @Override
  public ResponseEntity<ProfileDto> getProfile(String id) {
    return ResponseEntity.ok(profileApplicationService.findById(id));
  }

  @Override
  public ResponseEntity<ProfileDto> createProfile(SaveProfileRequestDto request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(profileApplicationService.create(request));
  }

  @Override
  public ResponseEntity<ProfileDto> updateProfile(String id, SaveProfileRequestDto request) {
    return ResponseEntity.ok(profileApplicationService.update(id, request));
  }
}
