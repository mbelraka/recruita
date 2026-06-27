package com.recruita.api.api.controller;

import com.recruita.api.api.dto.match.MatchRequestDto;
import com.recruita.api.generated.api.MatchApi;
import com.recruita.api.match.evaluation.MatchEvaluationResult;
import com.recruita.api.match.service.MatchApplicationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RestController;

@Tag(
    name = "Match",
    description =
        "Score anonymized candidates against a job description via Groq or deterministic rubric")
@Validated
@RestController
public class MatchController implements MatchApi {

  private final MatchApplicationService matchApplicationService;

  public MatchController(MatchApplicationService matchApplicationService) {
    this.matchApplicationService = matchApplicationService;
  }

  @Override
  public ResponseEntity<MatchEvaluationResult> match(MatchRequestDto request) {
    return ResponseEntity.ok(matchApplicationService.evaluate(request));
  }

  @Override
  public ResponseEntity<MatchEvaluationResult> matchLegacy(MatchRequestDto request) {
    return match(request);
  }
}
