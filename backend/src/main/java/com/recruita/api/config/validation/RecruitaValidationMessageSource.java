package com.recruita.api.config.validation;

import com.recruita.api.config.properties.ApplicantProperties;
import com.recruita.api.config.properties.MatchProperties;
import com.recruita.api.config.properties.ProfileProperties;
import com.recruita.api.config.properties.RecruitaProperties;
import java.text.MessageFormat;
import java.util.Locale;
import org.springframework.context.support.AbstractMessageSource;
import org.springframework.stereotype.Component;

/** Resolves Bean Validation message keys from `recruita.*.messages` configuration. */
@Component
public class RecruitaValidationMessageSource extends AbstractMessageSource {

  private final MatchProperties.MessageProperties matchMessages;
  private final ApplicantProperties.MessageProperties applicantMessages;
  private final ProfileProperties.MessageProperties profileMessages;

  public RecruitaValidationMessageSource(RecruitaProperties properties) {
    this.matchMessages = properties.getMatch().getMessages();
    this.applicantMessages = properties.getApplicant().getMessages();
    this.profileMessages = properties.getProfileApi().getMessages();
  }

  @Override
  protected MessageFormat resolveCode(String code, Locale locale) {
    String message =
        switch (code) {
          case MatchValidationMessageKey.Codes.CANDIDATES_MUST_BE_ARRAY ->
              matchMessages.getCandidatesMustBeArray();
          case MatchValidationMessageKey.Codes.CANDIDATE_ID_REQUIRED ->
              matchMessages.getCandidateIdRequired();
          case ApplicantValidationMessageKey.Codes.ID_REQUIRED -> applicantMessages.getIdRequired();
          case ApplicantValidationMessageKey.Codes.NAME_REQUIRED ->
              applicantMessages.getNameRequired();
          case ApplicantValidationMessageKey.Codes.EMAIL_REQUIRED ->
              applicantMessages.getEmailRequired();
          case ApplicantValidationMessageKey.Codes.PHONE_REQUIRED ->
              applicantMessages.getPhoneRequired();
          case ApplicantValidationMessageKey.Codes.LOCATION_REQUIRED ->
              applicantMessages.getLocationRequired();
          case ApplicantValidationMessageKey.Codes.APPLICATION_STATUS_REQUIRED ->
              applicantMessages.getApplicationStatusRequired();
          case ApplicantValidationMessageKey.Codes.CURRENT_JOB_TITLE_REQUIRED ->
              applicantMessages.getCurrentJobTitleRequired();
          case ApplicantValidationMessageKey.Codes.YEARS_OF_EXPERIENCE_REQUIRED ->
              applicantMessages.getYearsOfExperienceRequired();
          case ApplicantValidationMessageKey.Codes.SKILLS_REQUIRED ->
              applicantMessages.getSkillsRequired();
          case ProfileValidationMessageKey.Codes.ID_REQUIRED -> profileMessages.getIdRequired();
          case ProfileValidationMessageKey.Codes.LAST_LANGUAGE_REQUIRED ->
              profileMessages.getLastLanguageRequired();
          default -> null;
        };
    if (message == null) {
      return null;
    }
    return createMessageFormat(message, locale);
  }
}
