package com.recruita.api.applicant.mapper;

import com.recruita.api.api.dto.applicant.ApplicantDto;
import com.recruita.api.api.dto.applicant.SaveApplicantRequestDto;
import com.recruita.api.persistence.entity.ApplicantEntity;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class ApplicantMapper {

  public ApplicantDto toDto(ApplicantEntity entity) {
    return new ApplicantDto(
        entity.getId(),
        entity.getName(),
        entity.getEmail(),
        entity.getPhone(),
        entity.getLocation(),
        entity.getYearsOfExperience(),
        entity.getApplicationStatus(),
        entity.getCurrentJobTitle(),
        entity.getAvailableFrom(),
        entity.getSkills(),
        entity.getNotes(),
        entity.getCreatedAt(),
        entity.getUpdatedAt());
  }

  public List<ApplicantDto> toDtoList(List<ApplicantEntity> entities) {
    return entities.stream().map(this::toDto).toList();
  }

  public ApplicantEntity toNewEntity(SaveApplicantRequestDto request) {
    ApplicantEntity entity = new ApplicantEntity();
    applyRequest(entity, request);
    return entity;
  }

  public void applyRequest(ApplicantEntity entity, SaveApplicantRequestDto request) {
    entity.setId(request.id());
    entity.setName(request.name());
    entity.setEmail(request.email());
    entity.setPhone(request.phone());
    entity.setLocation(request.location());
    entity.setYearsOfExperience(request.yearsOfExperience());
    entity.setApplicationStatus(request.applicationStatus());
    entity.setCurrentJobTitle(request.currentJobTitle());
    entity.setAvailableFrom(request.availableFrom());
    entity.setSkills(request.skills());
    entity.setNotes(request.notes());
  }
}
