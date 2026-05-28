package com.recruita.api.config.validation;

public enum ApplicantValidationMessageKey {
  ID_REQUIRED(Codes.ID_REQUIRED);

  public static final class Codes {
    public static final String ID_REQUIRED = "recruita.applicant.validation.id-required";

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
