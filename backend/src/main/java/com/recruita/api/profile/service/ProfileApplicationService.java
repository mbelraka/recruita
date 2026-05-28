package com.recruita.api.profile.service;

import com.recruita.api.api.dto.profile.ProfileDto;
import com.recruita.api.api.dto.profile.SaveProfileRequestDto;

public interface ProfileApplicationService {

  ProfileDto findById(String id);

  ProfileDto create(SaveProfileRequestDto request);

  ProfileDto update(String id, SaveProfileRequestDto request);
}
