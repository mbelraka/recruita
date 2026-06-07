package com.recruita.api.action.validation;

import com.recruita.api.action.model.ActionParamKey;
import com.recruita.api.action.model.ApplicationStatusWire;
import com.recruita.api.action.model.CityRosterCountryResolver;
import com.recruita.api.action.model.FilterRosterContext;
import com.recruita.api.action.model.RosterLabelMatcher;
import com.recruita.api.action.model.RosterLocaleSupport;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class FilterParamsRosterNormalizer {

  private FilterParamsRosterNormalizer() {}

  static Map<String, Object> normalize(Map<String, Object> params, FilterRosterContext roster) {
    Map<String, Object> normalized = new LinkedHashMap<>(params);
    List<String> rosterCountries = roster.countries();
    List<String> rosterSkills = roster.skills();

    Object country = normalized.get(ActionParamKey.COUNTRY);
    if (country instanceof String countryText && !countryText.isBlank()) {
      normalized.put(ActionParamKey.COUNTRY, resolveGeographyToken(countryText, roster));
    }

    Object location = normalized.get(ActionParamKey.LOCATION);
    if (location instanceof String locationText && !locationText.isBlank()) {
      String resolved = resolveGeographyToken(locationText, roster);
      if (isRosterCountry(resolved, rosterCountries) && !hasCountry(normalized)) {
        normalized.put(ActionParamKey.COUNTRY, resolved);
        normalized.remove(ActionParamKey.LOCATION);
      }
    }

    Object status = normalized.get(ActionParamKey.STATUS);
    if (status instanceof String statusText
        && !statusText.isBlank()
        && ApplicationStatusWire.isWireValue(statusText.trim())) {
      normalized.put(ActionParamKey.STATUS, statusText.trim());
    }

    Object skills = normalized.get(ActionParamKey.SKILLS);
    if (skills instanceof List<?> skillList
        && skillList.stream().allMatch(String.class::isInstance)) {
      List<String> normalizedSkills = new ArrayList<>();
      for (Object value : skillList) {
        normalizedSkills.add(RosterLabelMatcher.match((String) value, rosterSkills));
      }
      normalized.put(ActionParamKey.SKILLS, normalizedSkills);
    }

    return normalized;
  }

  private static boolean hasCountry(Map<String, Object> params) {
    Object country = params.get(ActionParamKey.COUNTRY);
    return country instanceof String countryText && !countryText.isBlank();
  }

  private static boolean isRosterCountry(String label, List<String> rosterCountries) {
    return rosterCountries.stream()
        .anyMatch(country -> RosterLocaleSupport.labelsEqual(country, label));
  }

  private static String resolveGeographyToken(String token, FilterRosterContext roster) {
    String countryResolved = RosterLabelMatcher.match(token, roster.countries());
    if (isRosterCountry(countryResolved, roster.countries())) {
      return countryResolved;
    }

    String cityCountry = CityRosterCountryResolver.resolve(token, roster.cityToCountry());
    if (cityCountry != null && isRosterCountry(cityCountry, roster.countries())) {
      return cityCountry;
    }

    return countryResolved;
  }
}
