package com.recruita.api.config.properties;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/** Natural-language action parsing (Groq-backed `/api/action/parse`). */
public class ActionProperties {

  @NotBlank private String parsePath = "/api/action/parse";
  @Valid @NotNull private GroqInvocationProperties groq = new GroqInvocationProperties();
  @Valid @NotNull private PromptCatalogProperties promptCatalog = new PromptCatalogProperties();
  @Valid @NotNull private ValidationLimitsProperties validation = new ValidationLimitsProperties();

  public String getParsePath() {
    return parsePath;
  }

  public void setParsePath(String parsePath) {
    this.parsePath = parsePath;
  }

  public GroqInvocationProperties getGroq() {
    return groq;
  }

  public void setGroq(GroqInvocationProperties groq) {
    this.groq = groq;
  }

  public PromptCatalogProperties getPromptCatalog() {
    return promptCatalog;
  }

  public void setPromptCatalog(PromptCatalogProperties promptCatalog) {
    this.promptCatalog = promptCatalog;
  }

  public ValidationLimitsProperties getValidation() {
    return validation;
  }

  public void setValidation(ValidationLimitsProperties validation) {
    this.validation = validation;
  }

  public static class ValidationLimitsProperties {
    @Positive private int maxSkills = 20;

    @Min(0)
    private int minExperience = 0;

    @Positive private int maxExperience = 50;
    @Positive private int maxSearchTermLength = 100;
    @Positive private int minNameLength = 2;
    @Positive private int maxNameLength = 100;
    @Positive private int minMatchLimit = 1;
    @Positive private int matchLimitDefault = 10;
    @Positive private int matchLimitMax = 100;

    public int getMaxSkills() {
      return maxSkills;
    }

    public void setMaxSkills(int maxSkills) {
      this.maxSkills = maxSkills;
    }

    public int getMinExperience() {
      return minExperience;
    }

    public void setMinExperience(int minExperience) {
      this.minExperience = minExperience;
    }

    public int getMaxExperience() {
      return maxExperience;
    }

    public void setMaxExperience(int maxExperience) {
      this.maxExperience = maxExperience;
    }

    public int getMaxSearchTermLength() {
      return maxSearchTermLength;
    }

    public void setMaxSearchTermLength(int maxSearchTermLength) {
      this.maxSearchTermLength = maxSearchTermLength;
    }

    public int getMinNameLength() {
      return minNameLength;
    }

    public void setMinNameLength(int minNameLength) {
      this.minNameLength = minNameLength;
    }

    public int getMaxNameLength() {
      return maxNameLength;
    }

    public void setMaxNameLength(int maxNameLength) {
      this.maxNameLength = maxNameLength;
    }

    public int getMinMatchLimit() {
      return minMatchLimit;
    }

    public void setMinMatchLimit(int minMatchLimit) {
      this.minMatchLimit = minMatchLimit;
    }

    public int getMatchLimitDefault() {
      return matchLimitDefault;
    }

    public void setMatchLimitDefault(int matchLimitDefault) {
      this.matchLimitDefault = matchLimitDefault;
    }

    public int getMatchLimitMax() {
      return matchLimitMax;
    }

    public void setMatchLimitMax(int matchLimitMax) {
      this.matchLimitMax = matchLimitMax;
    }
  }

  public static class GroqInvocationProperties {
    private double temperature = 0.1;
    @Positive private int maxTokens = 500;
    @NotBlank private String model = "llama-3.3-70b-versatile";

    public double getTemperature() {
      return temperature;
    }

    public void setTemperature(double temperature) {
      this.temperature = temperature;
    }

    public int getMaxTokens() {
      return maxTokens;
    }

    public void setMaxTokens(int maxTokens) {
      this.maxTokens = maxTokens;
    }

    public String getModel() {
      return model;
    }

    public void setModel(String model) {
      this.model = model;
    }
  }

  public static class PromptCatalogProperties {
    @NotBlank
    private String assistantRole =
        "You are an AI assistant for Recruita, an applicant tracking system.";

    @NotBlank
    private String responseRule = "Return ONLY valid JSON — no explanations, no markdown fences.";

    public String getAssistantRole() {
      return assistantRole;
    }

    public void setAssistantRole(String assistantRole) {
      this.assistantRole = assistantRole;
    }

    public String getResponseRule() {
      return responseRule;
    }

    public void setResponseRule(String responseRule) {
      this.responseRule = responseRule;
    }
  }
}
