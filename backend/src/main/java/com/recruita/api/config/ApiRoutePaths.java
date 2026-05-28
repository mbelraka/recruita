package com.recruita.api.config;

import com.recruita.api.config.properties.RecruitaProperties;
import org.springframework.stereotype.Component;

/** Exposes configured API paths for SpEL-based request mappings and security rules. */
@Component("apiRoutePaths")
public class ApiRoutePaths {

  private final String healthPath;
  private final String matchPath;
  private final String matchLegacyPath;
  private final String applicantsPath;
  private final String applicantsPathWithId;
  private final String profilesPath;
  private final String profilesPathWithId;

  public ApiRoutePaths(RecruitaProperties properties) {
    var routes = properties.getApi().getRoutes();
    this.healthPath = routes.getHealthPath();
    this.matchPath = routes.getMatchPath();
    this.matchLegacyPath = routes.getMatchLegacyPath();
    this.applicantsPath = routes.getApplicantsPath();
    this.applicantsPathWithId = routes.getApplicantsPathWithId();
    this.profilesPath = routes.getProfilesPath();
    this.profilesPathWithId = routes.getProfilesPathWithId();
  }

  public String getHealthPath() {
    return healthPath;
  }

  public String getMatchPath() {
    return matchPath;
  }

  public String getMatchLegacyPath() {
    return matchLegacyPath;
  }

  public String getApplicantsPath() {
    return applicantsPath;
  }

  public String getApplicantsPathWithId() {
    return applicantsPathWithId;
  }

  public String getProfilesPath() {
    return profilesPath;
  }

  public String getProfilesPathWithId() {
    return profilesPathWithId;
  }
}
