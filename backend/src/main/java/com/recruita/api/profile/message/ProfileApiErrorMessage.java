package com.recruita.api.profile.message;

public enum ProfileApiErrorMessage {
  ID_REQUIRED("Profile id is required."),
  LAST_LANGUAGE_REQUIRED("Last language is required."),
  NOT_FOUND("Profile not found."),
  ALREADY_EXISTS("A profile with this id already exists.");

  private final String message;

  ProfileApiErrorMessage(String message) {
    this.message = message;
  }

  public String message() {
    return message;
  }
}
