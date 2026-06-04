package com.recruita.api.match.validation;

import static org.junit.jupiter.api.Assertions.assertThrows;

import com.recruita.api.api.dto.match.MatchCandidateDto;
import com.recruita.api.api.dto.match.MatchRequestDto;
import com.recruita.api.common.exception.MatchValidationException;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class MatchRequestPolicyValidatorCandidateTest {

  @Autowired private MatchRequestPolicyValidator validator;

  @Test
  void rejectsMissingCandidateId() {
    MatchRequestDto request =
        new MatchRequestDto(
            "Role",
            List.of(new MatchCandidateDto(" ", List.of("java"), 1.0, "Dev")),
            true,
            null,
            null,
            null,
            null);

    assertThrows(MatchValidationException.class, () -> validator.validate(request));
  }

  @Test
  void rejectsNonFiniteYearsOfExperience() {
    MatchRequestDto request =
        new MatchRequestDto(
            "Role",
            List.of(new MatchCandidateDto("a", List.of("java"), Double.NaN, "Dev")),
            true,
            null,
            null,
            null,
            null);

    assertThrows(MatchValidationException.class, () -> validator.validate(request));
  }
}
