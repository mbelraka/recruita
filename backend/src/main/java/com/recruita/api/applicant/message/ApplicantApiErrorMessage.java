package com.recruita.api.applicant.message;

public enum ApplicantApiErrorMessage {
  ID_REQUIRED("Applicant id is required."),
  NAME_REQUIRED("Applicant name is required."),
  EMAIL_REQUIRED("Applicant email is required."),
  PHONE_REQUIRED("Applicant phone is required."),
  LOCATION_REQUIRED("Applicant location is required."),
  APPLICATION_STATUS_REQUIRED("Applicant application status is required."),
  CURRENT_JOB_TITLE_REQUIRED("Applicant current job title is required."),
  YEARS_OF_EXPERIENCE_REQUIRED("Applicant years of experience is required."),
  SKILLS_REQUIRED("Applicant must include at least one skill."),
  ID_MISMATCH("Applicant id in the request body must match the path id."),
  NOT_FOUND("Applicant not found."),
  ALREADY_EXISTS("An applicant with this id already exists.");

  private final String message;

  ApplicantApiErrorMessage(String message) {
    this.message = message;
  }

  public String message() {
    return message;
  }
}
