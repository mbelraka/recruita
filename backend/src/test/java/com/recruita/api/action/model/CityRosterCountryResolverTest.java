package com.recruita.api.action.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;

class CityRosterCountryResolverTest {

  @Test
  void resolvesRosterCityToCountry() {
    Map<String, String> cityToCountry = Map.of("berlin", "Germany", "toronto", "Canada");

    assertThat(CityRosterCountryResolver.resolve("Berlin", cityToCountry)).isEqualTo("Germany");
    assertThat(CityRosterCountryResolver.resolve("toronto", cityToCountry)).isEqualTo("Canada");
  }

  @Test
  void returnsNullForUnknownCity() {
    assertThat(CityRosterCountryResolver.resolve("Paris", Map.of("berlin", "Germany"))).isNull();
  }

  @Test
  void returnsNullForBlankTokenOrEmptyMap() {
    assertThat(CityRosterCountryResolver.resolve(" ", Map.of("berlin", "Germany"))).isNull();
    assertThat(CityRosterCountryResolver.resolve("Berlin", Map.of())).isNull();
    assertThat(CityRosterCountryResolver.resolve(null, Map.of("berlin", "Germany"))).isNull();
  }
}
