package com.recruita.api.match.normalization;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.recruita.api.match.domain.MatchCandidate;
import java.util.List;
import org.junit.jupiter.api.Test;

class CandidateNormalizationServiceTest {

  private final CandidateNormalizationService service = new CandidateNormalizationService();

  @Test
  void normalizesSkillsAndSortsCandidatesDeterministically() {
    List<MatchCandidate> normalized =
        service.normalize(
            List.of(
                new MatchCandidate("b", List.of("java", "spring"), 3.0, "Engineer"),
                new MatchCandidate("a", List.of("spring", "java"), 2.0, null)));

    assertEquals("a", normalized.get(0).correlationId());
    assertEquals(List.of("java", "spring"), normalized.get(0).skills());
    assertEquals("", normalized.get(0).currentJobTitle());
    assertEquals("b", normalized.get(1).correlationId());
  }
}
