package com.recruita.api.action.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class FilterRosterContextTest {

  @Test
  void defensivelyCopiesCollections() {
    List<String> countries = new ArrayList<>(List.of("USA"));
    List<String> skills = new ArrayList<>(List.of("React"));
    List<String> cities = new ArrayList<>(List.of("Berlin"));
    Map<String, String> cityToCountry = new HashMap<>(Map.of("berlin", "Germany"));

    FilterRosterContext context = new FilterRosterContext(countries, skills, cities, cityToCountry);

    countries.add("Canada");
    skills.add("Angular");
    cities.add("Toronto");
    cityToCountry.put("toronto", "Canada");

    assertThat(context.countries()).containsExactly("USA");
    assertThat(context.skills()).containsExactly("React");
    assertThat(context.cities()).containsExactly("Berlin");
    assertThat(context.cityToCountry()).containsOnly(Map.entry("berlin", "Germany"));
  }

  @Test
  void emptySnapshotUsesImmutableCollections() {
    FilterRosterContext context = FilterRosterContext.empty();

    assertThat(context.countries()).isEmpty();
    assertThatThrownBy(() -> context.countries().add("USA"))
        .isInstanceOf(UnsupportedOperationException.class);
  }
}
