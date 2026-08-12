package com.recruita.api.match.cache;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.recruita.api.api.dto.match.CandidateProfileDto;
import com.recruita.api.api.dto.match.MatchResponseDto;
import com.recruita.api.api.dto.match.MatchScoreDto;
import com.recruita.api.match.domain.MatchCandidate;
import com.recruita.api.match.domain.MatchRequest;
import com.recruita.api.match.evaluation.DeterministicMatchEvaluationResult;
import com.recruita.api.match.evaluation.MatchEvaluationResult;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = "recruita.match.cache.enabled=true")
class MatchResponseCacheTest {

  @Autowired private MatchResponseCache cache;

  @Test
  void storesAndReturnsCachedResponses() {
    MatchRequest request =
        new MatchRequest(
            "Role",
            List.of(new MatchCandidate("a", List.of("java"), 1.0, "Dev")),
            true,
            null,
            0,
            1,
            42);
    List<MatchCandidate> normalized = List.of(new MatchCandidate("a", List.of("java"), 1.0, "Dev"));
    MatchResponseDto response =
        new MatchResponseDto(
            List.of(
                new MatchScoreDto(
                    "a",
                    80,
                    List.of("java"),
                    List.of(),
                    new CandidateProfileDto(List.of("java"), 1.0, List.of("Dev"), ""),
                    "ok")));

    cache.put(request, normalized, new DeterministicMatchEvaluationResult(response));

    assertTrue(cache.get(request, normalized).isPresent());
    MatchEvaluationResult cached = cache.get(request, normalized).get();
    assertEquals(
        80, ((DeterministicMatchEvaluationResult) cached).value().scores().getFirst().matchScore());
  }
}
