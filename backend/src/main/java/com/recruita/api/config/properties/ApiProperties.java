package com.recruita.api.config.properties;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ApiProperties {

  @Valid @NotNull private RouteProperties routes = new RouteProperties();
  @Valid @NotNull private ProblemDetailProperties problemDetail = new ProblemDetailProperties();

  public RouteProperties getRoutes() {
    return routes;
  }

  public void setRoutes(RouteProperties routes) {
    this.routes = routes;
  }

  public ProblemDetailProperties getProblemDetail() {
    return problemDetail;
  }

  public void setProblemDetail(ProblemDetailProperties problemDetail) {
    this.problemDetail = problemDetail;
  }

  public static class ProblemDetailProperties {
    @NotBlank private String errorPropertyKey = "error";

    public String getErrorPropertyKey() {
      return errorPropertyKey;
    }

    public void setErrorPropertyKey(String errorPropertyKey) {
      this.errorPropertyKey = errorPropertyKey;
    }
  }

  public static class RouteProperties {
    private String healthPath = "/api/health";
    private String matchPath = "/api/match";
    private String matchLegacyPath = "/api/match-job";
    private String applicantsPath = "/api/applicants";
    private String profilesPath = "/api/profiles";

    public String getHealthPath() {
      return healthPath;
    }

    public void setHealthPath(String healthPath) {
      this.healthPath = healthPath;
    }

    public String getMatchPath() {
      return matchPath;
    }

    public void setMatchPath(String matchPath) {
      this.matchPath = matchPath;
    }

    public String getMatchLegacyPath() {
      return matchLegacyPath;
    }

    public void setMatchLegacyPath(String matchLegacyPath) {
      this.matchLegacyPath = matchLegacyPath;
    }

    public String getApplicantsPath() {
      return applicantsPath;
    }

    public void setApplicantsPath(String applicantsPath) {
      this.applicantsPath = applicantsPath;
    }

    public String getProfilesPath() {
      return profilesPath;
    }

    public void setProfilesPath(String profilesPath) {
      this.profilesPath = profilesPath;
    }

    public String getApplicantsPathWithId() {
      return applicantsPath + "/{id}";
    }

    public String getApplicantsFullPath() {
      return applicantsPath + "/full";
    }

    public String getProfilesPathWithId() {
      return profilesPath + "/{id}";
    }

    public String[] publicPaths() {
      return new String[] {
        healthPath,
        matchPath,
        matchLegacyPath,
        applicantsPath,
        applicantsPath + "/**",
        profilesPath,
        profilesPath + "/**"
      };
    }
  }
}
