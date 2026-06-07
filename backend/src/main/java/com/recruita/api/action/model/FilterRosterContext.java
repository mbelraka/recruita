package com.recruita.api.action.model;

import java.util.List;
import java.util.Map;

/** Snapshot of applicant roster values used to guide LLM filter matching. */
public record FilterRosterContext(
    List<String> countries,
    List<String> skills,
    List<String> cities,
    Map<String, String> cityToCountry) {

  public FilterRosterContext {
    countries = List.copyOf(countries);
    skills = List.copyOf(skills);
    cities = List.copyOf(cities);
    cityToCountry = Map.copyOf(cityToCountry);
  }

  public static FilterRosterContext empty() {
    return new FilterRosterContext(List.of(), List.of(), List.of(), Map.of());
  }
}
