package com.recruita.api.action.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TreeSet;
import org.junit.jupiter.api.Test;

class FilterRosterLocationSupportTest {

  @Test
  void indexesCityToCountryFromApplicantLocation() {
    TreeSet<String> countries = new TreeSet<>();
    TreeSet<String> cities = new TreeSet<>();
    Map<String, String> cityToCountry = new LinkedHashMap<>();

    FilterRosterLocationSupport.addLocation("Berlin, Germany", countries, cities, cityToCountry);

    assertThat(countries).containsExactly("Germany");
    assertThat(cities).containsExactly("Berlin");
    assertThat(cityToCountry).containsEntry("berlin", "Germany");
  }

  @Test
  void ignoresNullLocation() {
    TreeSet<String> countries = new TreeSet<>();
    TreeSet<String> cities = new TreeSet<>();
    Map<String, String> cityToCountry = new LinkedHashMap<>();

    FilterRosterLocationSupport.addLocation(null, countries, cities, cityToCountry);

    assertThat(countries).isEmpty();
    assertThat(cities).isEmpty();
    assertThat(cityToCountry).isEmpty();
  }

  @Test
  void ignoresBlankLocation() {
    TreeSet<String> countries = new TreeSet<>();
    TreeSet<String> cities = new TreeSet<>();
    Map<String, String> cityToCountry = new LinkedHashMap<>();

    FilterRosterLocationSupport.addLocation("  ", countries, cities, cityToCountry);

    assertThat(countries).isEmpty();
    assertThat(cities).isEmpty();
    assertThat(cityToCountry).isEmpty();
  }

  @Test
  void ignoresLocationWithoutUsableParts() {
    TreeSet<String> countries = new TreeSet<>();
    TreeSet<String> cities = new TreeSet<>();
    Map<String, String> cityToCountry = new LinkedHashMap<>();

    FilterRosterLocationSupport.addLocation(", ,", countries, cities, cityToCountry);

    assertThat(countries).isEmpty();
    assertThat(cities).isEmpty();
    assertThat(cityToCountry).isEmpty();
  }

  @Test
  void indexesSingleSegmentLocationAsCityAndCountry() {
    TreeSet<String> countries = new TreeSet<>();
    TreeSet<String> cities = new TreeSet<>();
    Map<String, String> cityToCountry = new LinkedHashMap<>();

    FilterRosterLocationSupport.addLocation("Denmark", countries, cities, cityToCountry);

    assertThat(countries).containsExactly("Denmark");
    assertThat(cities).containsExactly("Denmark");
    assertThat(cityToCountry).containsEntry("denmark", "Denmark");
  }
}
