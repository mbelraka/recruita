package com.recruita.api.action.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;
import org.junit.jupiter.api.Test;

class FilterRosterContextBuilderTest {

  @Test
  void accumulateApplicantSkipsNullSkills() {
    TreeSet<String> countries = new TreeSet<>();
    TreeSet<String> skillLabels = new TreeSet<>();
    TreeSet<String> cities = new TreeSet<>();
    Map<String, String> cityToCountry = new LinkedHashMap<>();

    FilterRosterContextBuilder.accumulateApplicant(
        "Berlin, Germany", null, countries, skillLabels, cities, cityToCountry);

    assertThat(countries).containsExactly("Germany");
    assertThat(skillLabels).isEmpty();
  }

  @Test
  void accumulateApplicantTrimsNonBlankSkillsAndIgnoresNullOrBlankEntries() {
    TreeSet<String> countries = new TreeSet<>();
    TreeSet<String> skillLabels = new TreeSet<>();
    TreeSet<String> cities = new TreeSet<>();
    Map<String, String> cityToCountry = new LinkedHashMap<>();

    var skills = new ArrayList<String>();
    skills.add(" Java ");
    skills.add(null);
    skills.add("");
    skills.add("  ");
    skills.add("Spring");

    FilterRosterContextBuilder.accumulateApplicant(
        null, skills, countries, skillLabels, cities, cityToCountry);

    assertThat(skillLabels).containsExactly("Java", "Spring");
  }

  @Test
  void buildReturnsImmutableCopies() {
    TreeSet<String> countries = new TreeSet<>(List.of("Germany"));
    TreeSet<String> skillLabels = new TreeSet<>(List.of("Java"));
    TreeSet<String> cities = new TreeSet<>(List.of("Berlin"));
    Map<String, String> cityToCountry = new LinkedHashMap<>(Map.of("berlin", "Germany"));

    FilterRosterContext context =
        FilterRosterContextBuilder.build(countries, skillLabels, cities, cityToCountry);

    assertThat(context.countries()).containsExactly("Germany");
    assertThat(context.skills()).containsExactly("Java");
    assertThat(context.cities()).containsExactly("Berlin");
    assertThat(context.cityToCountry()).containsEntry("berlin", "Germany");
  }
}
