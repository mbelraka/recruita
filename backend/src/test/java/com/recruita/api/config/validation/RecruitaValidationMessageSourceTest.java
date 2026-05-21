package com.recruita.api.config.validation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import com.recruita.api.config.properties.RecruitaProperties;
import java.util.Locale;
import org.junit.jupiter.api.Test;

class RecruitaValidationMessageSourceTest {

  private final RecruitaValidationMessageSource messageSource =
      new RecruitaValidationMessageSource(new RecruitaProperties());

  @Test
  void resolvesConfiguredValidationMessages() {
    assertEquals(
        "candidates must be an array.",
        messageSource
            .resolveCode(RecruitaValidationMessageSource.CANDIDATES_MUST_BE_ARRAY_KEY, Locale.US)
            .format(new Object[] {}));
    assertEquals(
        "Each candidate must include a non-empty string id (correlation id).",
        messageSource
            .resolveCode(RecruitaValidationMessageSource.CANDIDATE_ID_REQUIRED_KEY, Locale.US)
            .format(new Object[] {}));
    assertEquals(
        "Applicant id is required.",
        messageSource
            .resolveCode(RecruitaValidationMessageSource.APPLICANT_ID_REQUIRED_KEY, Locale.US)
            .format(new Object[] {}));
  }

  @Test
  void returnsNullForUnknownCodes() {
    assertNull(messageSource.resolveCode("unknown.validation.key", Locale.US));
  }
}
