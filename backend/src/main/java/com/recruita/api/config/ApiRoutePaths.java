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
  private final String applicantsFullPath;
  private final String applicantsPathWithId;
  private final String profilesPath;
  private final String profilesPathWithId;
  private final String actionParsePath;

  public ApiRoutePaths(RecruitaProperties properties) {
    var routes = properties.getApi().getRoutes();
    this.healthPath = routes.getHealthPath();
    this.matchPath = routes.getMatchPath();
    this.matchLegacyPath = routes.getMatchLegacyPath();
    this.applicantsPath = routes.getApplicantsPath();
    this.applicantsFullPath = routes.getApplicantsFullPath();
    this.applicantsPathWithId = routes.getApplicantsPathWithId();
    this.profilesPath = routes.getProfilesPath();
    this.profilesPathWithId = routes.getProfilesPathWithId();
    this.actionParsePath = routes.getActionParsePath();
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

  public String getApplicantsFullPath() {
    return applicantsFullPath;
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

  public String getActionParsePath() {
    return actionParsePath;
  }
}
