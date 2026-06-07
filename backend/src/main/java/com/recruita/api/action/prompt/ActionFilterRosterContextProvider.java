package com.recruita.api.action.prompt;

import com.recruita.api.action.model.FilterRosterContext;
import com.recruita.api.action.model.FilterRosterLocationSupport;
import com.recruita.api.persistence.entity.ApplicantEntity;
import com.recruita.api.persistence.repository.ApplicantRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Component;

@Component
public class ActionFilterRosterContextProvider {

  private final ObjectProvider<ApplicantRepository> repositoryProvider;
  private final FilterRosterSeedLoader seedLoader;

  public ActionFilterRosterContextProvider(
      ObjectProvider<ApplicantRepository> repositoryProvider, FilterRosterSeedLoader seedLoader) {
    this.repositoryProvider = repositoryProvider;
    this.seedLoader = seedLoader;
  }

  public FilterRosterContext snapshot() {
    ApplicantRepository repository = repositoryProvider.getIfAvailable();
    if (repository == null) {
      return seedLoader.load();
    }
    FilterRosterContext fromDatabase = buildFromEntities(repository.findAll());
    if (fromDatabase.countries().isEmpty()) {
      return seedLoader.load();
    }
    return fromDatabase;
  }

  private static FilterRosterContext buildFromEntities(List<ApplicantEntity> applicants) {
    if (applicants.isEmpty()) {
      return FilterRosterContext.empty();
    }

    TreeSet<String> countries = new TreeSet<>();
    TreeSet<String> skills = new TreeSet<>();
    TreeSet<String> cities = new TreeSet<>();
    Map<String, String> cityToCountry = new LinkedHashMap<>();

    for (ApplicantEntity applicant : applicants) {
      FilterRosterLocationSupport.addLocation(
          applicant.getLocation(), countries, cities, cityToCountry);
      List<String> applicantSkills = applicant.getSkills();
      if (applicantSkills == null) {
        continue;
      }
      for (String skill : applicantSkills) {
        if (skill != null && !skill.isBlank()) {
          skills.add(skill.trim());
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
