package com.recruita.api.common.exception;

public class ApplicantNotFoundException extends RuntimeException {

  public ApplicantNotFoundException(String message) {
    super(message);
  }
}
