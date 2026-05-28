package com.recruita.api.api.controller;

import com.recruita.api.api.dto.profile.ProfileDto;
import com.recruita.api.api.dto.profile.SaveProfileRequestDto;
import com.recruita.api.profile.service.ProfileApplicationService;
import jakarta.validation.Valid;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping
@ConditionalOnProperty(prefix = "recruita.persistence", name = "enabled", havingValue = "true")
public class ProfileController {

  private final ProfileApplicationService profileApplicationService;

  public ProfileController(ProfileApplicationService profileApplicationService) {
    this.profileApplicationService = profileApplicationService;
  }

  @GetMapping(path = "#{@apiRoutePaths.profilesPathWithId}")
  public ProfileDto getProfile(@PathVariable String id) {
    return profileApplicationService.findById(id);
  }

  @PostMapping(path = "#{@apiRoutePaths.profilesPath}")
  @ResponseStatus(HttpStatus.CREATED)
  public ProfileDto createProfile(@Valid @RequestBody SaveProfileRequestDto request) {
    return profileApplicationService.create(request);
  }

  @PutMapping(path = "#{@apiRoutePaths.profilesPathWithId}")
  public ProfileDto updateProfile(
      @PathVariable String id, @Valid @RequestBody SaveProfileRequestDto request) {
    return profileApplicationService.update(id, request);
  }
}
