package com.recruita.api.api.controller;

import com.recruita.api.api.dto.match.MatchRequestDto;
import com.recruita.api.match.evaluation.MatchEvaluationResult;
import com.recruita.api.match.service.MatchApplicationService;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping
public class MatchController {

  private final MatchApplicationService matchApplicationService;

  public MatchController(MatchApplicationService matchApplicationService) {
    this.matchApplicationService = matchApplicationService;
  }

  @PostMapping(path = "#{@apiRoutePaths.matchPath}")
  public MatchEvaluationResult match(@Valid @RequestBody MatchRequestDto request) {
    return matchApplicationService.evaluate(request);
  }

  @PostMapping(path = "#{@apiRoutePaths.matchLegacyPath}")
  public MatchEvaluationResult matchLegacy(@Valid @RequestBody MatchRequestDto request) {
    return matchApplicationService.evaluate(request);
  }
}
