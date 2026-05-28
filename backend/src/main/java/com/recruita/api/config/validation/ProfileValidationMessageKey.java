package com.recruita.api.config.validation;

public enum ProfileValidationMessageKey {
  ID_REQUIRED(Codes.ID_REQUIRED),
  LAST_LANGUAGE_REQUIRED(Codes.LAST_LANGUAGE_REQUIRED);

  public static final class Codes {
    public static final String ID_REQUIRED = "recruita.profile.validation.id-required";
    public static final String LAST_LANGUAGE_REQUIRED =
        "recruita.profile.validation.last-language-required";

    private Codes() {}
  }

  private final String code;

  ProfileValidationMessageKey(String code) {
    this.code = code;
  }

  public String code() {
    return code;
  }
}
