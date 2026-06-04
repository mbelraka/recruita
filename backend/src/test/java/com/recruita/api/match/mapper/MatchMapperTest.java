package com.recruita.api.match.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.recruita.api.api.dto.match.MatchCandidateDto;
import com.recruita.api.api.dto.match.MatchRequestDto;
import com.recruita.api.api.dto.match.MatchResponseDto;
import com.recruita.api.api.dto.match.MatchScoreDto;
import com.recruita.api.match.domain.MatchCandidate;
import com.recruita.api.match.domain.MatchRequest;
import com.recruita.api.match.domain.MatchScore;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class MatchMapperTest {

  @Autowired private MatchRequestMapper requestMapper;
  @Autowired private MatchResponseMapper responseMapper;

  @Test
  void mapsRequestDtoToDomain() {
    MatchRequestDto dto =
        new MatchRequestDto(
            "Backend role",
            List.of(new MatchCandidateDto("id-1", List.of("java"), 4.0, "Developer")),
            true,
            null,
            null,
            null,
            null);

    MatchRequest domain = requestMapper.toDomain(dto);

    assertEquals("Backend role", domain.jobDescription());
    assertEquals(1, domain.candidates().size());
    MatchCandidate candidate = domain.candidates().getFirst();
    assertEquals("id-1", candidate.correlationId());
    assertEquals("java", candidate.skills().getFirst());
  }

  @Test
  void mapsDomainScoresToResponseDto() {
    MatchScore score =
        new MatchScore(
            "id-1",
            88,
            List.of("java"),
            List.of(),
            new MatchScore.CandidateProfile(List.of("java"), 4.0, List.of("Developer"), ""),
            "Strong fit");
    MatchResponseDto response = responseMapper.toDto(List.of(score));

    MatchScoreDto dto = response.scores().getFirst();
    assertEquals("id-1", dto.id());
    assertEquals(88, dto.matchScore());
    assertEquals("Strong fit", dto.recommendation());
  }
}
