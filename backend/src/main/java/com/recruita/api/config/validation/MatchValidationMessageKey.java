package com.recruita.api.config.validation;

public enum MatchValidationMessageKey {
  CANDIDATES_MUST_BE_ARRAY(Codes.CANDIDATES_MUST_BE_ARRAY),
  CANDIDATE_ID_REQUIRED(Codes.CANDIDATE_ID_REQUIRED);

  public static final class Codes {
    public static final String CANDIDATES_MUST_BE_ARRAY =
        "recruita.match.validation.candidates-must-be-array";
    public static final String CANDIDATE_ID_REQUIRED =
        "recruita.match.validation.candidate-id-required";

    private Codes() {}
  }

  private final String code;

  MatchValidationMessageKey(String code) {
    this.code = code;
  }

  public String code() {
    return code;
  }
}
