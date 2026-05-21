package com.recruita.api.config.validation;

import com.recruita.api.config.properties.ApplicantProperties;
import com.recruita.api.config.properties.MatchProperties;
import com.recruita.api.config.properties.RecruitaProperties;
import java.text.MessageFormat;
import java.util.Locale;
import org.springframework.context.support.AbstractMessageSource;
import org.springframework.stereotype.Component;

/** Resolves Bean Validation message keys from {@link RecruitaProperties}. */
@Component
public class RecruitaValidationMessageSource extends AbstractMessageSource {

  public static final String CANDIDATES_MUST_BE_ARRAY_KEY =
      "recruita.match.validation.candidates-must-be-array";
  public static final String CANDIDATE_ID_REQUIRED_KEY =
      "recruita.match.validation.candidate-id-required";
  public static final String APPLICANT_ID_REQUIRED_KEY =
      "recruita.applicant.validation.id-required";

  private final MatchProperties.MessageProperties matchMessages;
  private final ApplicantProperties applicantMessages;

  public RecruitaValidationMessageSource(RecruitaProperties properties) {
    this.matchMessages = properties.getMatch().getMessages();
    this.applicantMessages = properties.getApplicant();
  }

  @Override
  protected MessageFormat resolveCode(String code, Locale locale) {
    String message =
        switch (code) {
          case CANDIDATES_MUST_BE_ARRAY_KEY -> matchMessages.getCandidatesMustBeArray();
          case CANDIDATE_ID_REQUIRED_KEY -> matchMessages.getCandidateIdRequired();
          case APPLICANT_ID_REQUIRED_KEY -> applicantMessages.getIdRequired();
          default -> null;
        };
    if (message == null) {
      return null;
    }
    return createMessageFormat(message, locale);
  }
}
