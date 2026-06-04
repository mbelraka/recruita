package com.recruita.api.match.validation;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.recruita.api.api.dto.match.MatchCandidateDto;
import com.recruita.api.api.dto.match.MatchRequestDto;
import com.recruita.api.common.exception.MatchValidationException;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class MatchRequestPolicyValidatorTest {

  @Autowired private MatchRequestPolicyValidator validator;

  @Test
  void rejectsOversizedJobDescription() {
    String huge = "x".repeat(24_577);
    MatchRequestDto request =
        new MatchRequestDto(
            huge,
            List.of(new MatchCandidateDto("a", List.of("java"), 1.0, "Dev")),
            true,
            null,
            null,
            null,
            null);

    MatchValidationException ex =
        assertThrows(MatchValidationException.class, () -> validator.validate(request));
    assertEquals("jobDescription exceeds maximum allowed length.", ex.getMessage());
  }

  @Test
  void rejectsInvalidModel() {
    MatchRequestDto request =
        new MatchRequestDto(
            "Role",
            List.of(new MatchCandidateDto("a", List.of("java"), 1.0, "Dev")),
            true,
            "bad model!",
            null,
            null,
            null);

    MatchValidationException ex =
        assertThrows(MatchValidationException.class, () -> validator.validate(request));
    assertEquals("Model parameter format is invalid.", ex.getMessage());
  }

  @Test
  void acceptsValidRequest() {
    MatchRequestDto request =
        new MatchRequestDto(
            "Java engineer with 3+ years",
            List.of(new MatchCandidateDto("a", List.of("java"), 3.0, "Engineer")),
            true,
            "llama-3.3-70b-versatile",
            null,
            null,
            null);

    assertDoesNotThrow(() -> validator.validate(request));
  }
}
