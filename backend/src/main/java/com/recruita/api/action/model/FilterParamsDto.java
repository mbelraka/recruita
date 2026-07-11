package com.recruita.api.action.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record FilterParamsDto(
    List<String> skills,
    Double minExperience,
    Double maxExperience,
    String status,
    String country,
    String location,
    String searchTerm) {

  public FilterParamsDto {
    skills = skills == null ? List.of() : List.copyOf(skills);
  }
}
