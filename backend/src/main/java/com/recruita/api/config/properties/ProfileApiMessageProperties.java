package com.recruita.api.config.properties;

import jakarta.validation.constraints.NotBlank;

/** Profile API user-facing messages (`recruita.profile-api.messages`). */
public class ProfileApiMessageProperties {

  @NotBlank private String idRequired = "Profile id is required.";
  @NotBlank private String lastLanguageRequired = "Last language is required.";
  @NotBlank private String idMismatch = "Profile id in the request body must match the path id.";
  @NotBlank private String notFound = "Profile not found.";
  @NotBlank private String alreadyExists = "A profile with this id already exists.";

  public String getIdRequired() {
    return idRequired;
  }

  public void setIdRequired(String idRequired) {
    this.idRequired = idRequired;
  }

  public String getLastLanguageRequired() {
    return lastLanguageRequired;
  }

  public void setLastLanguageRequired(String lastLanguageRequired) {
    this.lastLanguageRequired = lastLanguageRequired;
  }

  public String getIdMismatch() {
    return idMismatch;
  }

  public void setIdMismatch(String idMismatch) {
    this.idMismatch = idMismatch;
  }

  public String getNotFound() {
    return notFound;
  }

  public void setNotFound(String notFound) {
    this.notFound = notFound;
  }

  public String getAlreadyExists() {
    return alreadyExists;
  }

  public void setAlreadyExists(String alreadyExists) {
    this.alreadyExists = alreadyExists;
  }
}
