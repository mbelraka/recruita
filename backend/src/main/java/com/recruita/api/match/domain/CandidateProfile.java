package com.recruita.api.match.domain;

import java.util.List;

public record CandidateProfile(
    List<String> skills, double yearsExperience, List<String> topJobTitles, String education) {

  public CandidateProfile {
    skills = List.copyOf(skills);
    topJobTitles = List.copyOf(topJobTitles);
  }
}
