package com.recruita.api.config.properties;

import jakarta.validation.constraints.NotBlank;

public class ApplicantProperties {

  @NotBlank private String idRequired = "Applicant id is required.";
  @NotBlank private String notFound = "Applicant not found.";
  @NotBlank private String alreadyExists = "An applicant with this id already exists.";

  public String getIdRequired() {
    return idRequired;
  }

  public void setIdRequired(String idRequired) {
    this.idRequired = idRequired;
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
