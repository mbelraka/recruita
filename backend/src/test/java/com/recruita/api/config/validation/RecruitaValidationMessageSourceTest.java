package com.recruita.api.config.validation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import com.recruita.api.config.properties.RecruitaProperties;
import java.util.Locale;
import org.junit.jupiter.api.Test;

class RecruitaValidationMessageSourceTest {

  private final RecruitaProperties properties = new RecruitaProperties();
  private final RecruitaValidationMessageSource messageSource =
      new RecruitaValidationMessageSource(properties);

  @Test
  void resolvesConfiguredValidationMessages() {
    assertEquals(
        properties.getMatch().getMessages().getCandidatesMustBeArray(),
        messageSource
            .resolveCode(MatchValidationMessageKey.Codes.CANDIDATES_MUST_BE_ARRAY, Locale.US)
            .format(new Object[] {}));
    assertEquals(
        properties.getMatch().getMessages().getCandidateIdRequired(),
        messageSource
            .resolveCode(MatchValidationMessageKey.Codes.CANDIDATE_ID_REQUIRED, Locale.US)
            .format(new Object[] {}));
    assertEquals(
        properties.getApplicant().getMessages().getIdRequired(),
        messageSource
            .resolveCode(ApplicantValidationMessageKey.Codes.ID_REQUIRED, Locale.US)
            .format(new Object[] {}));
    assertEquals(
        properties.getApplicant().getMessages().getNameRequired(),
        messageSource
            .resolveCode(ApplicantValidationMessageKey.Codes.NAME_REQUIRED, Locale.US)
            .format(new Object[] {}));
    assertEquals(
        properties.getProfileApi().getMessages().getIdRequired(),
        messageSource
            .resolveCode(ProfileValidationMessageKey.Codes.ID_REQUIRED, Locale.US)
            .format(new Object[] {}));
  }

  @Test
  void resolvesAllApplicantValidationMessageKeys() {
    assertEquals(
        properties.getApplicant().getMessages().getPhoneRequired(),
        messageSource
            .resolveCode(ApplicantValidationMessageKey.Codes.PHONE_REQUIRED, Locale.US)
            .format(new Object[] {}));
    assertEquals(
        properties.getApplicant().getMessages().getLocationRequired(),
        messageSource
            .resolveCode(ApplicantValidationMessageKey.Codes.LOCATION_REQUIRED, Locale.US)
            .format(new Object[] {}));
    assertEquals(
        properties.getApplicant().getMessages().getApplicationStatusRequired(),
        messageSource
            .resolveCode(ApplicantValidationMessageKey.Codes.APPLICATION_STATUS_REQUIRED, Locale.US)
            .format(new Object[] {}));
    assertEquals(
        properties.getApplicant().getMessages().getCurrentJobTitleRequired(),
        messageSource
            .resolveCode(ApplicantValidationMessageKey.Codes.CURRENT_JOB_TITLE_REQUIRED, Locale.US)
            .format(new Object[] {}));
    assertEquals(
        properties.getApplicant().getMessages().getYearsOfExperienceRequired(),
        messageSource
            .resolveCode(
                ApplicantValidationMessageKey.Codes.YEARS_OF_EXPERIENCE_REQUIRED, Locale.US)
            .format(new Object[] {}));
  }

  @Test
  void resolvesApplicantValidationMessages() {
    assertEquals(
        properties.getApplicant().getMessages().getEmailRequired(),
        messageSource
            .resolveCode(ApplicantValidationMessageKey.Codes.EMAIL_REQUIRED, Locale.US)
            .format(new Object[] {}));
    assertEquals(
        properties.getApplicant().getMessages().getSkillsRequired(),
        messageSource
            .resolveCode(ApplicantValidationMessageKey.Codes.SKILLS_REQUIRED, Locale.US)
            .format(new Object[] {}));
  }

  @Test
  void returnsNullForUnknownCodes() {
    assertNull(messageSource.resolveCode("unknown.validation.key", Locale.US));
  }
}
