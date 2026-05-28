package com.recruita.api.match.message;

public enum MatchApiErrorMessage {
  CANDIDATES_MUST_BE_ARRAY("candidates must be an array."),
  CANDIDATE_ID_REQUIRED("Each candidate must include a non-empty string id (correlation id).");

  private final String message;

  MatchApiErrorMessage(String message) {
    this.message = message;
  }

  public String message() {
    return message;
  }
}
