package com.recruita.api.api.dto.match;

import java.util.List;

public record CandidateProfileDto(
    List<String> skills, double yearsExperience, List<String> topJobTitles, String education) {

  public CandidateProfileDto {
    skills = List.copyOf(skills);
    topJobTitles = List.copyOf(topJobTitles);
  }
}
