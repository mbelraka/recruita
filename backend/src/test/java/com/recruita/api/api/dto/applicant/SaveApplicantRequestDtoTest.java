package com.recruita.api.api.dto.applicant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import org.junit.jupiter.api.Test;

class SaveApplicantRequestDtoTest {

  @Test
  void normalizesNullSkillsToEmptyList() {
    var dto =
        new SaveApplicantRequestDto(
            "a-1", null, null, null, null, null, null, null, null, null, null);

    assertTrue(dto.skills().isEmpty());
  }

  @Test
  void copiesSkillsDefensively() {
    var skills = new java.util.ArrayList<>(List.of("java"));
    var dto =
        new SaveApplicantRequestDto(
            "a-1", null, null, null, null, null, null, null, null, skills, null);

    skills.add("spring");

    assertEquals(List.of("java"), dto.skills());
  }
}
