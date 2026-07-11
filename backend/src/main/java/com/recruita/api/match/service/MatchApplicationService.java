package com.recruita.api.match.service;

import com.recruita.api.api.dto.match.MatchRequestDto;
import com.recruita.api.match.evaluation.MatchEvaluationResult;

public interface MatchApplicationService {

  MatchEvaluationResult evaluate(MatchRequestDto request);

  void invalidateMatchCache();
}
