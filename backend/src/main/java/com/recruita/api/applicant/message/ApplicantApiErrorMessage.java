package com.recruita.api.applicant.message;

public enum ApplicantApiErrorMessage {
  ID_REQUIRED("Applicant id is required."),
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
