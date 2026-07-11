package com.recruita.api.api.advice;

import com.recruita.api.common.problem.ApiProblemType;
import com.recruita.api.config.properties.ApiProperties;
import com.recruita.api.config.properties.RecruitaProperties;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;

@Component
public class ApiProblemDetailSupport {

  private final ApiProperties.ProblemDetailProperties problemDetail;

  public ApiProblemDetailSupport(RecruitaProperties properties) {
    this.problemDetail = properties.getApi().getProblemDetail();
  }

  public ProblemDetail create(HttpStatus status, ApiProblemType type, String detail) {
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
    problem.setType(type.typeUri(problemDetail.getTypeBaseUri()));
    problem.setProperty(problemDetail.getErrorPropertyKey(), detail);
    problem.setProperty(problemDetail.getCodePropertyKey(), type.code());
    return problem;
  }
}
