package com.recruita.api.match.domain;

import java.util.List;

public record MatchScore(
    String correlationId,
    int matchScore,
    List<String> matchingSkills,
    List<String> missingSkills,
    CandidateProfile candidateProfile,
    String recommendation) {

  public MatchScore {
    matchingSkills = List.copyOf(matchingSkills);
    missingSkills = List.copyOf(missingSkills);
  }
}
