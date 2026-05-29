package com.recruita.api.api.dto.applicant;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;
import org.junit.jupiter.api.Test;

class ApplicantSummaryDtoTest {

  @Test
  void nullSkillsNormalizesToEmptyList() {
    ApplicantSummaryDto summary =
        new ApplicantSummaryDto("a-1", "Alex", null, null, null, null, null, null, null, null);

    assertEquals(List.of(), summary.skills());
  }
}
