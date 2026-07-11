package com.recruita.api.api.advice;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.recruita.api.common.problem.ApiProblemType;
import com.recruita.api.config.properties.RecruitaProperties;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;

class ApiProblemDetailSupportTest {

  private final ApiProblemDetailSupport support =
      new ApiProblemDetailSupport(new RecruitaProperties());

  @Test
  void setsSemanticTypeUriAndCode() {
    ProblemDetail detail =
        support.create(
            HttpStatus.NOT_FOUND, ApiProblemType.APPLICANT_NOT_FOUND, "Applicant missing.");

    assertEquals("https://recruita.dev/problems/applicant-not-found", detail.getType().toString());
    assertEquals("Applicant missing.", detail.getDetail());
    assertEquals("Applicant missing.", detail.getProperties().get("error"));
    assertEquals("applicant-not-found", detail.getProperties().get("code"));
  }
}
