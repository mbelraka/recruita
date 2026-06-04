package com.recruita.api.applicant.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import com.recruita.api.api.dto.applicant.SaveApplicantRequestDto;
import com.recruita.api.persistence.entity.ApplicantEntity;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

class ApplicantMapperTest {

  private final ApplicantMapper mapper = Mappers.getMapper(ApplicantMapper.class);

  @Test
  void mapsEntityToSummaryDtoWithoutNotes() {
    ApplicantEntity entity = new ApplicantEntity();
    entity.setId("a-1");
    entity.setName("Alex");
    entity.setNotes("internal");

    var summary = mapper.toSummaryDto(entity);

    assertEquals("a-1", summary.id());
    assertEquals("Alex", summary.name());
  }

  @Test
  void mapsEntityWithNullSkillsToEmptyListInSummaryDto() {
    ApplicantEntity entity = new ApplicantEntity();
    entity.setId("a-1");
    entity.setSkills(null);

    var summary = mapper.toSummaryDto(entity);

    assertEquals(List.of(), summary.skills());
  }

  @Test
  void mapsEntityToDto() {
    ApplicantEntity entity = new ApplicantEntity();
    entity.setId("a-1");
    entity.setName("Alex");
    entity.setEmail("alex@example.com");
    entity.setSkills(List.of("java", "spring"));
    entity.setAvailableFrom(LocalDate.parse("2026-06-01"));

    var dto = mapper.toDto(entity);

    assertEquals("a-1", dto.id());
    assertEquals("Alex", dto.name());
    assertEquals("alex@example.com", dto.email());
    assertEquals(List.of("java", "spring"), dto.skills());
    assertEquals(LocalDate.parse("2026-06-01"), dto.availableFrom());
  }

  @Test
  void mapsRequestToNewEntity() {
    var request =
        new SaveApplicantRequestDto(
            "a-2",
            "Sam",
            "sam@example.com",
            "+1",
            "Berlin",
            4.0,
            "screening",
            "Engineer",
            LocalDate.parse("2026-07-01"),
            List.of("angular"),
            "notes");

    ApplicantEntity entity = mapper.toNewEntity(request);

    assertEquals("a-2", entity.getId());
    assertEquals("Sam", entity.getName());
    assertEquals(List.of("angular"), entity.getSkills());
    assertNull(entity.getCreatedAt());
  }

  @Test
  void applyRequestUpdatesExistingEntityIncludingSkills() {
    ApplicantEntity entity = new ApplicantEntity();
    entity.setId("a-1");
    entity.setName("Before");
    entity.setSkills(List.of("legacy"));

    var request =
        new SaveApplicantRequestDto(
            "a-1",
            "After",
            "after@example.com",
            "+1",
            "Berlin",
            3.0,
            "screening",
            "Engineer",
            LocalDate.parse("2026-08-01"),
            List.of("spring"),
            "updated");

    mapper.applyRequest(entity, request);

    assertEquals("After", entity.getName());
    assertEquals(List.of("spring"), entity.getSkills());
  }
}
