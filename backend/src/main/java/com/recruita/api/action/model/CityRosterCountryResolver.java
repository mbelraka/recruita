package com.recruita.api.action.model;

import java.util.Map;

/** Maps roster city labels to their country label. */
public final class CityRosterCountryResolver {

  private CityRosterCountryResolver() {}

  public static String resolve(String token, Map<String, String> cityToCountry) {
    if (token == null || token.isBlank() || cityToCountry == null || cityToCountry.isEmpty()) {
      return null;
    }
    return cityToCountry.get(RosterLocaleSupport.normalizeKey(token));
  }
}
