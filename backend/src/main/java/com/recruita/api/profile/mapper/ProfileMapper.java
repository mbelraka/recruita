package com.recruita.api.profile.mapper;

import com.recruita.api.api.dto.profile.ProfileDto;
import com.recruita.api.api.dto.profile.SaveProfileRequestDto;
import com.recruita.api.persistence.entity.ProfileEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProfileMapper {

  ProfileDto toDto(ProfileEntity entity);

  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  ProfileEntity toNewEntity(SaveProfileRequestDto request);

  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  void applyRequest(@MappingTarget ProfileEntity entity, SaveProfileRequestDto request);
}
