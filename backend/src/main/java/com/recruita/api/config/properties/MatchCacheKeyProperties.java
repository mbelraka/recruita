package com.recruita.api.config.properties;

import jakarta.validation.constraints.NotBlank;

/** Stable cache key field names (aligned with Node `MATCH_BODY_ALLOWED_KEYS`). */
public class MatchCacheKeyProperties {

  @NotBlank private String jobDescription = "jobDescription";
  @NotBlank private String candidates = "candidates";
  @NotBlank private String model = "model";
  @NotBlank private String temperature = "temperature";
  @NotBlank private String topP = "topP";
  @NotBlank private String seed = "seed";
  @NotBlank private String deterministic = "deterministic";
  @NotBlank private String rosterVersion = "rosterVersion";
  @NotBlank private String schemaVersion = "schemaVersion";

  public String getJobDescription() {
    return jobDescription;
  }

  public void setJobDescription(String jobDescription) {
    this.jobDescription = jobDescription;
  }

  public String getCandidates() {
    return candidates;
  }

  public void setCandidates(String candidates) {
    this.candidates = candidates;
  }

  public String getModel() {
    return model;
  }

  public void setModel(String model) {
    this.model = model;
  }

  public String getTemperature() {
    return temperature;
  }

  public void setTemperature(String temperature) {
    this.temperature = temperature;
  }

  public String getTopP() {
    return topP;
  }

  public void setTopP(String topP) {
    this.topP = topP;
  }

  public String getSeed() {
    return seed;
  }

  public void setSeed(String seed) {
    this.seed = seed;
  }

  public String getDeterministic() {
    return deterministic;
  }

  public void setDeterministic(String deterministic) {
    this.deterministic = deterministic;
  }

  public String getRosterVersion() {
    return rosterVersion;
  }

  public void setRosterVersion(String rosterVersion) {
    this.rosterVersion = rosterVersion;
  }

  public String getSchemaVersion() {
    return schemaVersion;
  }

  public void setSchemaVersion(String schemaVersion) {
    this.schemaVersion = schemaVersion;
  }
}
