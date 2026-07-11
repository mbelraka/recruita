package com.recruita.api.match.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.recruita.api.api.dto.match.MatchCandidateDto;
import com.recruita.api.api.dto.match.MatchRequestDto;
import com.recruita.api.api.dto.match.MatchResponseDto;
import com.recruita.api.match.cache.MatchResponseCache;
import com.recruita.api.match.domain.MatchRequest;
import com.recruita.api.match.evaluation.MatchEvaluationResult;
import com.recruita.api.match.groq.GroqChatClient;
import com.recruita.api.match.mapper.MatchRequestMapper;
import com.recruita.api.match.normalization.CandidateNormalizationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@TestPropertySource(properties = "recruita.match.cache.enabled=true")
class MatchApplicationServiceCacheTest {

  @Autowired private MatchApplicationService matchApplicationService;
  @Autowired private MatchResponseCache matchResponseCache;
  @Autowired private MatchRequestMapper matchRequestMapper;
  @Autowired private CandidateNormalizationService candidateNormalizationService;

  @MockitoBean private GroqChatClient groqChatClient;

  @Test
  void cachesGroqResponsesForIdenticalRequests() {
    when(groqChatClient.complete(any()))
        .thenReturn("{\"scores\":[{\"id\":\"1\",\"matchScore\":77}]}");

    MatchRequestDto request =
        new MatchRequestDto(
            "Engineer role",
            java.util.List.of(new MatchCandidateDto("1", java.util.List.of("java"), 1.0, "Dev")),
            false,
            null,
            null,
            null,
            null);

    MatchResponseDto first = matchApplicationService.evaluate(request);
    MatchResponseDto second = matchApplicationService.evaluate(request);

    MatchRequest domainRequest = matchRequestMapper.toDomain(request);
    var normalized = candidateNormalizationService.normalize(domainRequest.candidates());
    MatchEvaluationResult cached = matchResponseCache.get(domainRequest, normalized).orElseThrow();

    verify(groqChatClient, times(1)).complete(any());
    assertInstanceOf(MatchEvaluationResult.Groq.class, cached);
    assertEquals(77, first.scores().getFirst().matchScore());
    assertEquals(77, second.scores().getFirst().matchScore());
  }
}
