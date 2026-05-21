package com.recruita.api.api.advice;

import com.recruita.api.common.exception.ApplicantConflictException;
import com.recruita.api.common.exception.ApplicantNotFoundException;
import com.recruita.api.common.exception.MatchServiceUnavailableException;
import com.recruita.api.common.exception.MatchValidationException;
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

  public GlobalApiExceptionHandler(RecruitaProperties properties) {
    this.properties = properties;
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
    String message =
        ex.getBindingResult().getFieldErrors().stream()
            .findFirst()
            .map(FieldError::getDefaultMessage)
            .orElse(properties.getMatch().getMessages().getJobDescriptionRequired());
    return problem(HttpStatus.BAD_REQUEST, message);
  }

  @ExceptionHandler(ApplicantNotFoundException.class)
  public ProblemDetail handleApplicantNotFound(ApplicantNotFoundException ex) {
    return problem(HttpStatus.NOT_FOUND, ex.getMessage());
  }

  @ExceptionHandler(ApplicantConflictException.class)
  public ProblemDetail handleApplicantConflict(ApplicantConflictException ex) {
    return problem(HttpStatus.CONFLICT, ex.getMessage());
  }

  @ExceptionHandler(MatchValidationException.class)
  public ProblemDetail handlePolicyValidation(MatchValidationException ex) {
    return problem(HttpStatus.BAD_REQUEST, ex.getMessage());
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ProblemDetail handleUnreadable(HttpMessageNotReadableException ex) {
    return problem(
        HttpStatus.BAD_REQUEST, properties.getMatch().getMessages().getInvalidJsonBody());
  }

  @ExceptionHandler(MatchServiceUnavailableException.class)
  public ProblemDetail handleUnavailable(MatchServiceUnavailableException ex) {
    String message =
        ex.suppressDetail() || properties.getRuntime().shouldSuppressErrorDetail()
            ? properties.getMatch().getMessages().getGroqUnavailable()
            : ex.getMessage();
    return problem(HttpStatus.INTERNAL_SERVER_ERROR, message);
  }

  @ExceptionHandler({NoHandlerFoundException.class, NoResourceFoundException.class})
  public ProblemDetail handleNotFound() {
    return problem(HttpStatus.NOT_FOUND, properties.getMatch().getMessages().getNotFound());
  }

  @ExceptionHandler(Exception.class)
  public ProblemDetail handleGeneric(Exception ex) {
    String message =
        properties.getRuntime().shouldSuppressErrorDetail()
            ? properties.getMatch().getMessages().getInternalError()
            : ex.getMessage();
    return problem(HttpStatus.INTERNAL_SERVER_ERROR, message);
  }

  private ProblemDetail problem(HttpStatus status, String detail) {
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
    problem.setProperty(properties.getApi().getProblemDetail().getErrorPropertyKey(), detail);
    return problem;
  }
}
