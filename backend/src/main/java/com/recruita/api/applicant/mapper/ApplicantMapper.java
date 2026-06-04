package com.recruita.api.applicant.mapper;

import com.recruita.api.api.dto.applicant.ApplicantDto;
import com.recruita.api.api.dto.applicant.ApplicantSummaryDto;
import com.recruita.api.api.dto.applicant.SaveApplicantRequestDto;
import com.recruita.api.persistence.entity.ApplicantEntity;
import java.util.ArrayList;
import java.util.List;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ApplicantMapper {

  ApplicantDto toDto(ApplicantEntity entity);

  ApplicantSummaryDto toSummaryDto(ApplicantEntity entity);

  List<ApplicantSummaryDto> toSummaryDtoList(List<ApplicantEntity> entities);

  List<ApplicantDto> toDtoList(List<ApplicantEntity> entities);

  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  ApplicantEntity toNewEntity(SaveApplicantRequestDto request);

  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  @Mapping(target = "skills", ignore = true)
  void applyRequest(@MappingTarget ApplicantEntity entity, SaveApplicantRequestDto request);

  @AfterMapping
  default void applyMutableSkills(
      SaveApplicantRequestDto request, @MappingTarget ApplicantEntity entity) {
    List<String> skills = request.skills();
    entity.setSkills(skills == null ? new ArrayList<>() : new ArrayList<>(skills));
  }
}
