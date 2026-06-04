package com.recruita.api.match.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.recruita.api.api.dto.match.MatchCandidateDto;
import com.recruita.api.api.dto.match.MatchRequestDto;
import com.recruita.api.match.evaluation.MatchEvaluationResult;
import com.recruita.api.match.groq.GroqChatClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@TestPropertySource(properties = "recruita.match.cache.enabled=true")
class MatchApplicationServiceCacheTest {

  @Autowired private MatchApplicationService matchApplicationService;

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

    matchApplicationService.evaluate(request);
    MatchEvaluationResult.Groq second =
        (MatchEvaluationResult.Groq) matchApplicationService.evaluate(request);

    verify(groqChatClient, times(1)).complete(any());
    assertEquals(77, second.value().get("scores").get(0).get("matchScore").asInt());
  }
}
