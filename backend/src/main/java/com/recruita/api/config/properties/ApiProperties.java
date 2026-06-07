package com.recruita.api.config.properties;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ApiProperties {

  @Valid @NotNull private RouteProperties routes = new RouteProperties();
  @Valid @NotNull private OpenApiProperties openapi = new OpenApiProperties();
  @Valid @NotNull private ProblemDetailProperties problemDetail = new ProblemDetailProperties();
  @Valid @NotNull private ValidationProperties validation = new ValidationProperties();

  public RouteProperties getRoutes() {
    return routes;
  }

  public void setRoutes(RouteProperties routes) {
    this.routes = routes;
  }

  public OpenApiProperties getOpenapi() {
    return openapi;
  }

  public void setOpenapi(OpenApiProperties openapi) {
    this.openapi = openapi;
  }

  /** API and OpenAPI documentation paths permitted without authentication. */
  public String[] publicPaths() {
    return concat(routes.permitAllPaths(), openapi.permittedPathsArray());
  }

  public ProblemDetailProperties getProblemDetail() {
    return problemDetail;
  }

  public void setProblemDetail(ProblemDetailProperties problemDetail) {
    this.problemDetail = problemDetail;
  }

  public ValidationProperties getValidation() {
    return validation;
  }

  public void setValidation(ValidationProperties validation) {
    this.validation = validation;
  }

  public static class ValidationProperties {
    @NotBlank private String defaultMessage = "Request validation failed.";

    public String getDefaultMessage() {
      return defaultMessage;
    }

    public void setDefaultMessage(String defaultMessage) {
      this.defaultMessage = defaultMessage;
    }
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
    private String actionParsePath = "/api/action/parse";

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

    public String getActionParsePath() {
      return actionParsePath;
    }

    public void setActionParsePath(String actionParsePath) {
      this.actionParsePath = actionParsePath;
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

    String[] permitAllPaths() {
      return new String[] {
        healthPath,
        matchPath,
        matchLegacyPath,
        applicantsPath,
        applicantsPath + "/**",
        profilesPath,
        profilesPath + "/**",
        actionParsePath
      };
    }
  }

  private static String[] concat(String[] first, String[] second) {
    String[] merged = new String[first.length + second.length];
    System.arraycopy(first, 0, merged, 0, first.length);
    System.arraycopy(second, 0, merged, first.length, second.length);
    return merged;
  }
}
