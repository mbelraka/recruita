package com.recruita.api.match.validation;

import static org.junit.jupiter.api.Assertions.assertThrows;

import com.recruita.api.api.dto.match.MatchCandidateDto;
import com.recruita.api.api.dto.match.MatchRequestDto;
import com.recruita.api.common.exception.MatchValidationException;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(
    properties = {
      "recruita.match.request-limits.candidates-max-count=1",
      "recruita.match.request-limits.skill-count-max=1"
    })
class MatchRequestPolicyValidatorLimitsTest {

  @Autowired private MatchRequestPolicyValidator validator;

  @Test
  void rejectsTooManyCandidates() {
    MatchRequestDto request =
        new MatchRequestDto(
            "Role",
            List.of(
                new MatchCandidateDto("a", List.of("java"), 1.0, "Dev"),
                new MatchCandidateDto("b", List.of("go"), 2.0, "Dev")),
            true,
            null,
            null,
            null,
            null);

    assertThrows(MatchValidationException.class, () -> validator.validate(request));
  }

  @Test
  void rejectsTooManySkills() {
    MatchRequestDto request =
        new MatchRequestDto(
            "Role",
            List.of(new MatchCandidateDto("a", List.of("java", "go"), 1.0, "Dev")),
            true,
            null,
            null,
            null,
            null);

    assertThrows(MatchValidationException.class, () -> validator.validate(request));
  }

  @Test
  void rejectsOversizedSkillEntry() {
    String longSkill = "s".repeat(257);
    MatchRequestDto request =
        new MatchRequestDto(
            "Role",
            List.of(new MatchCandidateDto("a", List.of(longSkill), 1.0, "Dev")),
            true,
            null,
            null,
            null,
            null);

    assertThrows(MatchValidationException.class, () -> validator.validate(request));
  }

  @Test
  void rejectsOversizedCandidateId() {
    String longId = "x".repeat(4097);
    MatchRequestDto request =
        new MatchRequestDto(
            "Role",
            List.of(new MatchCandidateDto(longId, List.of("java"), 1.0, "Dev")),
            true,
            null,
            null,
            null,
            null);

    assertThrows(MatchValidationException.class, () -> validator.validate(request));
  }
}
