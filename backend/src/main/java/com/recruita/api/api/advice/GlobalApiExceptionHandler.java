package com.recruita.api.api.advice;

import com.recruita.api.common.exception.ApplicantConflictException;
import com.recruita.api.common.exception.ApplicantNotFoundException;
import com.recruita.api.common.exception.MatchServiceUnavailableException;
import com.recruita.api.common.exception.MatchValidationException;
import com.recruita.api.common.exception.ProfileConflictException;
import com.recruita.api.common.exception.ProfileNotFoundException;
import com.recruita.api.common.problem.ApiProblemType;
import com.recruita.api.config.properties.RecruitaProperties;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalApiExceptionHandler {

  private final RecruitaProperties properties;
  private final ApiProblemDetailSupport problemDetailSupport;

  public GlobalApiExceptionHandler(
      RecruitaProperties properties, ApiProblemDetailSupport problemDetailSupport) {
    this.properties = properties;
    this.problemDetailSupport = problemDetailSupport;
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
    String message =
        ex.getBindingResult().getFieldErrors().stream()
            .findFirst()
            .map(FieldError::getDefaultMessage)
            .orElse(properties.getApi().getValidation().getDefaultMessage());
    return problemDetailSupport.create(
        HttpStatus.BAD_REQUEST, ApiProblemType.REQUEST_VALIDATION, message);
  }

  @ExceptionHandler(ApplicantNotFoundException.class)
  public ProblemDetail handleApplicantNotFound(ApplicantNotFoundException ex) {
    return problemDetailSupport.create(
        HttpStatus.NOT_FOUND, ApiProblemType.APPLICANT_NOT_FOUND, ex.getMessage());
  }

  @ExceptionHandler(ApplicantConflictException.class)
  public ProblemDetail handleApplicantConflict(ApplicantConflictException ex) {
    return problemDetailSupport.create(
        HttpStatus.CONFLICT, ApiProblemType.APPLICANT_CONFLICT, ex.getMessage());
  }

  @ExceptionHandler(ProfileNotFoundException.class)
  public ProblemDetail handleProfileNotFound(ProfileNotFoundException ex) {
    return problemDetailSupport.create(
        HttpStatus.NOT_FOUND, ApiProblemType.PROFILE_NOT_FOUND, ex.getMessage());
  }

  @ExceptionHandler(ProfileConflictException.class)
  public ProblemDetail handleProfileConflict(ProfileConflictException ex) {
    return problemDetailSupport.create(
        HttpStatus.CONFLICT, ApiProblemType.PROFILE_CONFLICT, ex.getMessage());
  }

  @ExceptionHandler(MatchValidationException.class)
  public ProblemDetail handlePolicyValidation(MatchValidationException ex) {
    return problemDetailSupport.create(
        HttpStatus.BAD_REQUEST, ApiProblemType.MATCH_VALIDATION, ex.getMessage());
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ProblemDetail handleUnreadable(HttpMessageNotReadableException ex) {
    return problemDetailSupport.create(
        HttpStatus.BAD_REQUEST,
        ApiProblemType.INVALID_JSON_BODY,
        properties.getMatch().getMessages().getInvalidJsonBody());
  }

  @ExceptionHandler(MatchServiceUnavailableException.class)
  public ProblemDetail handleUnavailable(MatchServiceUnavailableException ex) {
    String message =
        ex.suppressDetail() || properties.getRuntime().shouldSuppressErrorDetail()
            ? properties.getMatch().getMessages().getGroqUnavailable()
            : ex.getMessage();
    return problemDetailSupport.create(
        HttpStatus.INTERNAL_SERVER_ERROR, ApiProblemType.MATCH_SERVICE_UNAVAILABLE, message);
  }

  @ExceptionHandler({NoHandlerFoundException.class, NoResourceFoundException.class})
  public ProblemDetail handleNotFound() {
    return problemDetailSupport.create(
        HttpStatus.NOT_FOUND,
        ApiProblemType.ROUTE_NOT_FOUND,
        properties.getMatch().getMessages().getNotFound());
  }

  @ExceptionHandler(Exception.class)
  public ProblemDetail handleGeneric(Exception ex) {
    String message =
        properties.getRuntime().shouldSuppressErrorDetail()
            ? properties.getMatch().getMessages().getInternalError()
            : ex.getMessage();
    return problemDetailSupport.create(
        HttpStatus.INTERNAL_SERVER_ERROR, ApiProblemType.INTERNAL_ERROR, message);
  }
}
