package com.recruita.api.action.model;

import java.util.List;
import java.util.Map;
import java.util.TreeSet;

/** Builds {@link FilterRosterContext} from applicant location and skill data. */
public final class FilterRosterContextBuilder {

  private FilterRosterContextBuilder() {}

  public static void accumulateApplicant(
      String location,
      List<String> applicantSkills,
      TreeSet<String> countries,
      TreeSet<String> skillLabels,
      TreeSet<String> cities,
      Map<String, String> cityToCountry) {
    FilterRosterLocationSupport.addLocation(location, countries, cities, cityToCountry);
    if (applicantSkills == null) {
      return;
    }
    for (String skill : applicantSkills) {
      if (skill != null && !skill.isBlank()) {
        skillLabels.add(skill.trim());
      }
    }
  }

  public static FilterRosterContext build(
      TreeSet<String> countries,
      TreeSet<String> skillLabels,
      TreeSet<String> cities,
      Map<String, String> cityToCountry) {
    return new FilterRosterContext(
        List.copyOf(countries),
        List.copyOf(skillLabels),
        List.copyOf(cities),
        Map.copyOf(cityToCountry));
  }
}
