package com.recruita.api.action.model;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Shared helpers for building roster geography from applicant locations. */
public final class FilterRosterLocationSupport {

  private FilterRosterLocationSupport() {}

  public static void addLocation(
      String location,
      Set<String> countries,
      Set<String> cities,
      Map<String, String> cityToCountry) {
    if (location == null || location.isBlank()) {
      return;
    }
    List<String> parts =
        Arrays.stream(location.split(","))
            .map(String::trim)
            .filter(part -> !part.isEmpty())
            .toList();
    if (parts.isEmpty()) {
      return;
    }

    String city = parts.get(0);
    String country = parts.get(parts.size() - 1);
    cities.add(city);
    countries.add(country);
    cityToCountry.putIfAbsent(RosterLocaleSupport.normalizeKey(city), country);
  }
}
