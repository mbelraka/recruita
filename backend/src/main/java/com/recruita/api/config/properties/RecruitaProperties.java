package com.recruita.api.config.properties;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "recruita")
@Validated
public class RecruitaProperties {

  @Valid @NotNull private RuntimeProperties runtime = new RuntimeProperties();
  @Valid @NotNull private ApiProperties api = new ApiProperties();
  @Valid @NotNull private SecurityProperties security = new SecurityProperties();
  @Valid @NotNull private MatchProperties match = new MatchProperties();
  @Valid @NotNull private OperationalProperties operational = new OperationalProperties();
  @Valid @NotNull private PersistenceProperties persistence = new PersistenceProperties();
  @Valid @NotNull private ProfileProperties profileApi = new ProfileProperties();
  @Valid @NotNull private SeedProperties seed = new SeedProperties();

  public RuntimeProperties getRuntime() {
    return runtime;
  }

  public void setRuntime(RuntimeProperties runtime) {
    this.runtime = runtime;
  }

  public ApiProperties getApi() {
    return api;
  }

  public void setApi(ApiProperties api) {
    this.api = api;
  }

  public SecurityProperties getSecurity() {
    return security;
  }

  public void setSecurity(SecurityProperties security) {
    this.security = security;
  }

  public MatchProperties getMatch() {
    return match;
  }

  public void setMatch(MatchProperties match) {
    this.match = match;
  }

  public OperationalProperties getOperational() {
    return operational;
  }

  public void setOperational(OperationalProperties operational) {
    this.operational = operational;
  }

  public PersistenceProperties getPersistence() {
    return persistence;
  }

  public void setPersistence(PersistenceProperties persistence) {
    this.persistence = persistence;
  }

  public ProfileProperties getProfileApi() {
    return profileApi;
  }

  public void setProfileApi(ProfileProperties profileApi) {
    this.profileApi = profileApi;
  }

  public SeedProperties getSeed() {
    return seed;
  }

  public void setSeed(SeedProperties seed) {
    this.seed = seed;
  }

  public boolean isProduction() {
    return runtime.isProduction();
  }
}
