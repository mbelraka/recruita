package com.recruita.api.config.validation;

public enum ApplicantValidationMessageKey {
  ID_REQUIRED(Codes.ID_REQUIRED),
  NAME_REQUIRED(Codes.NAME_REQUIRED),
  EMAIL_REQUIRED(Codes.EMAIL_REQUIRED),
  PHONE_REQUIRED(Codes.PHONE_REQUIRED),
  LOCATION_REQUIRED(Codes.LOCATION_REQUIRED),
  APPLICATION_STATUS_REQUIRED(Codes.APPLICATION_STATUS_REQUIRED),
  CURRENT_JOB_TITLE_REQUIRED(Codes.CURRENT_JOB_TITLE_REQUIRED),
  YEARS_OF_EXPERIENCE_REQUIRED(Codes.YEARS_OF_EXPERIENCE_REQUIRED),
  SKILLS_REQUIRED(Codes.SKILLS_REQUIRED);

  public static final class Codes {
    public static final String ID_REQUIRED = "recruita.applicant.validation.id-required";
    public static final String NAME_REQUIRED = "recruita.applicant.validation.name-required";
    public static final String EMAIL_REQUIRED = "recruita.applicant.validation.email-required";
    public static final String PHONE_REQUIRED = "recruita.applicant.validation.phone-required";
    public static final String LOCATION_REQUIRED =
        "recruita.applicant.validation.location-required";
    public static final String APPLICATION_STATUS_REQUIRED =
        "recruita.applicant.validation.application-status-required";
    public static final String CURRENT_JOB_TITLE_REQUIRED =
        "recruita.applicant.validation.current-job-title-required";
    public static final String YEARS_OF_EXPERIENCE_REQUIRED =
        "recruita.applicant.validation.years-of-experience-required";
    public static final String SKILLS_REQUIRED = "recruita.applicant.validation.skills-required";

    private Codes() {}
  }

  private final String code;

  ApplicantValidationMessageKey(String code) {
    this.code = code;
  }

  public String code() {
    return code;
  }
}
