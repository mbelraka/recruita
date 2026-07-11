package com.recruita.api.match.service;

import com.recruita.api.api.dto.match.MatchRequestDto;
import com.recruita.api.api.dto.match.MatchResponseDto;

public interface MatchApplicationService {

  MatchResponseDto evaluate(MatchRequestDto request);

  void invalidateMatchCache();
}
