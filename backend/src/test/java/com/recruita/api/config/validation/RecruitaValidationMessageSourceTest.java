package com.recruita.api.config.validation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import com.recruita.api.applicant.message.ApplicantApiErrorMessage;
import com.recruita.api.match.message.MatchApiErrorMessage;
import com.recruita.api.profile.message.ProfileApiErrorMessage;
import java.util.Locale;
import org.junit.jupiter.api.Test;

class RecruitaValidationMessageSourceTest {

  private final RecruitaValidationMessageSource messageSource =
      new RecruitaValidationMessageSource();

  @Test
  void resolvesConfiguredValidationMessages() {
    assertEquals(
        MatchApiErrorMessage.CANDIDATES_MUST_BE_ARRAY.message(),
        messageSource
            .resolveCode(MatchValidationMessageKey.Codes.CANDIDATES_MUST_BE_ARRAY, Locale.US)
            .format(new Object[] {}));
    assertEquals(
        MatchApiErrorMessage.CANDIDATE_ID_REQUIRED.message(),
        messageSource
            .resolveCode(MatchValidationMessageKey.Codes.CANDIDATE_ID_REQUIRED, Locale.US)
            .format(new Object[] {}));
    assertEquals(
        ApplicantApiErrorMessage.ID_REQUIRED.message(),
        messageSource
            .resolveCode(ApplicantValidationMessageKey.Codes.ID_REQUIRED, Locale.US)
            .format(new Object[] {}));
    assertEquals(
        ProfileApiErrorMessage.ID_REQUIRED.message(),
        messageSource
            .resolveCode(ProfileValidationMessageKey.Codes.ID_REQUIRED, Locale.US)
            .format(new Object[] {}));
  }

  @Test
  void returnsNullForUnknownCodes() {
    assertNull(messageSource.resolveCode("unknown.validation.key", Locale.US));
  }
}
