package com.recruita.api.config.validation;

import com.recruita.api.applicant.message.ApplicantApiErrorMessage;
import com.recruita.api.match.message.MatchApiErrorMessage;
import com.recruita.api.profile.message.ProfileApiErrorMessage;
import java.text.MessageFormat;
import java.util.Locale;
import org.springframework.context.support.AbstractMessageSource;
import org.springframework.stereotype.Component;

/** Resolves Bean Validation message keys from typed API error message enums. */
@Component
public class RecruitaValidationMessageSource extends AbstractMessageSource {

  @Override
  protected MessageFormat resolveCode(String code, Locale locale) {
    String message =
        switch (code) {
          case MatchValidationMessageKey.Codes.CANDIDATES_MUST_BE_ARRAY ->
              MatchApiErrorMessage.CANDIDATES_MUST_BE_ARRAY.message();
          case MatchValidationMessageKey.Codes.CANDIDATE_ID_REQUIRED ->
              MatchApiErrorMessage.CANDIDATE_ID_REQUIRED.message();
          case ApplicantValidationMessageKey.Codes.ID_REQUIRED ->
              ApplicantApiErrorMessage.ID_REQUIRED.message();
          case ApplicantValidationMessageKey.Codes.NAME_REQUIRED ->
              ApplicantApiErrorMessage.NAME_REQUIRED.message();
          case ApplicantValidationMessageKey.Codes.EMAIL_REQUIRED ->
              ApplicantApiErrorMessage.EMAIL_REQUIRED.message();
          case ApplicantValidationMessageKey.Codes.PHONE_REQUIRED ->
              ApplicantApiErrorMessage.PHONE_REQUIRED.message();
          case ApplicantValidationMessageKey.Codes.LOCATION_REQUIRED ->
              ApplicantApiErrorMessage.LOCATION_REQUIRED.message();
          case ApplicantValidationMessageKey.Codes.APPLICATION_STATUS_REQUIRED ->
              ApplicantApiErrorMessage.APPLICATION_STATUS_REQUIRED.message();
          case ApplicantValidationMessageKey.Codes.CURRENT_JOB_TITLE_REQUIRED ->
              ApplicantApiErrorMessage.CURRENT_JOB_TITLE_REQUIRED.message();
          case ApplicantValidationMessageKey.Codes.YEARS_OF_EXPERIENCE_REQUIRED ->
              ApplicantApiErrorMessage.YEARS_OF_EXPERIENCE_REQUIRED.message();
          case ApplicantValidationMessageKey.Codes.SKILLS_REQUIRED ->
              ApplicantApiErrorMessage.SKILLS_REQUIRED.message();
          case ProfileValidationMessageKey.Codes.ID_REQUIRED ->
              ProfileApiErrorMessage.ID_REQUIRED.message();
          case ProfileValidationMessageKey.Codes.LAST_LANGUAGE_REQUIRED ->
              ProfileApiErrorMessage.LAST_LANGUAGE_REQUIRED.message();
          default -> null;
        };
    if (message == null) {
      return null;
    }
    return createMessageFormat(message, locale);
  }
}
