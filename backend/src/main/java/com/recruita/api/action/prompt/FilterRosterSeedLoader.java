package com.recruita.api.action.prompt;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruita.api.action.model.FilterRosterContext;
import com.recruita.api.action.model.FilterRosterLocationSupport;
import com.recruita.api.api.dto.applicant.SaveApplicantRequestDto;
import java.io.IOException;
import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

/** Loads roster labels from the demo seed file when persistence is unavailable. */
@Component
class FilterRosterSeedLoader {

  private static final String DEMO_APPLICANTS_RESOURCE = "seed/applicants-demo.json";

  private final ObjectMapper objectMapper;

  FilterRosterSeedLoader(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  FilterRosterContext load() {
    try {
      return buildFromApplicants(loadDemoApplicants());
    } catch (IOException ex) {
      return FilterRosterContext.empty();
    }
  }

  private List<SaveApplicantRequestDto> loadDemoApplicants() throws IOException {
    ClassPathResource resource = new ClassPathResource(DEMO_APPLICANTS_RESOURCE);
    try (InputStream input = resource.getInputStream()) {
      return objectMapper.readValue(input, new TypeReference<>() {});
    }
  }

  private static FilterRosterContext buildFromApplicants(List<SaveApplicantRequestDto> applicants) {
    TreeSet<String> countries = new TreeSet<>();
    TreeSet<String> skills = new TreeSet<>();
    TreeSet<String> cities = new TreeSet<>();
    Map<String, String> cityToCountry = new LinkedHashMap<>();

    for (SaveApplicantRequestDto applicant : applicants) {
      FilterRosterLocationSupport.addLocation(
          applicant.location(), countries, cities, cityToCountry);
      if (applicant.skills() != null) {
        for (String skill : applicant.skills()) {
          if (skill != null && !skill.isBlank()) {
            skills.add(skill.trim());
          }
        }
      }
    }

    return new FilterRosterContext(
        List.copyOf(countries),
        List.copyOf(skills),
        List.copyOf(cities),
        Map.copyOf(cityToCountry));
  }
}
