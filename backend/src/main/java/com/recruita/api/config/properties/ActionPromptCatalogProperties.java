package com.recruita.api.config.properties;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/** LLM prompt catalog for smart-action parsing (`recruita.action.prompt-catalog`). */
public class ActionPromptCatalogProperties {

  @NotBlank
  private String assistantRole =
      "You are an AI assistant for Recruita, an applicant tracking system.";

  @NotBlank
  private String responseRule = "Return ONLY valid JSON — no explanations, no markdown fences.";

  @NotBlank private String rosterEmptyLabel = "(none loaded)";
  @NotBlank private String userLanguagePrefix = "User language: ";
  @NotBlank private String userCommandPrefix = "User command: \"";
  @NotBlank private String availableActionsPrefix = "AVAILABLE ACTIONS: {actions}";

  @NotNull @NotEmpty
  private List<@NotBlank String> catalogIntroduction =
      List.of(
          "You convert the user command into ONE JSON action. You own all semantic matching.",
          "The application does not reinterpret your output — put every filter in the correct field.");

  @NotNull @NotEmpty
  private List<@NotBlank String> actionLines =
      List.of(
          "1. FILTER_APPLICANTS — country, skills, minExperience, maxExperience, status ({statuses}), searchTerm",
          "2. UPDATE_STATUS — applicantIdentifier, newStatus ({statuses})",
          "3. EXPORT_DATA — format ({formats}), optional filters",
          "4. CREATE_APPLICANT — name, email, phone?, skills, yearsOfExperience, currentJobTitle",
          "5. DELETE_APPLICANT — applicantIdentifier",
          "6. GENERATE_REPORT — reportType ({reportTypes}), optional filters",
          "7. MATCH_JOB — jobDescription, optional limit (default {matchLimitDefault})",
          "8. BULK_UPDATE — filters, updates (applicationStatus or notes)",
          "9. CLARIFY — questions (string[]) when the command is ambiguous");

  @NotBlank
  private String filterFieldRulesHeader = "FILTER_APPLICANTS field rules (you must follow these):";

  @NotNull @NotEmpty
  private List<@NotBlank String> filterFieldRules =
      List.of(
          "- country: roster country label when the user mentions a country or region",
          "- skills: roster skill labels when the user mentions skills (array of strings)",
          "- status: only when the user names a pipeline stage from: {statuses}",
          "- minExperience / maxExperience: only when the user states experience bounds",
          "- Use exact roster labels from ROSTER CONTEXT for country and skills; exact status wire values",
          "- The user command may be in any supported UI language (en, de, fr, it, rm, es); interpret geography, skills, and status words in that language, then output roster labels",
          "- searchTerm: ONLY person names or job-title text — NEVER countries, cities, skills, or status words",
          "- Omit every param the user did not mention",
          "- NEVER put US/USA/UK/Canada or any geography in searchTerm — always use country",
          "- Ranking words (top, best, leading) are NOT status and NOT searchTerm — omit them");

  @NotBlank private String filterExamplesHeader = "FILTER_APPLICANTS examples:";

  @NotNull @NotEmpty
  private List<@NotBlank String> filterExamples =
      List.of(
          "  \"show top applicants in the US\" -> {\"type\":\"FILTER_APPLICANTS\",\"params\":{\"country\":\"USA\"}}",
          "  \"find React developers in Canada\" -> {\"type\":\"FILTER_APPLICANTS\",\"params\":{\"country\":\"Canada\",\"skills\":[\"React\"]}}",
          "  \"developers in Berlin\" -> {\"type\":\"FILTER_APPLICANTS\",\"params\":{\"country\":\"Germany\"}}",
          "  \"Entwickler in Deutschland\" (de) -> {\"type\":\"FILTER_APPLICANTS\",\"params\":{\"country\":\"Germany\"}}",
          "  \"candidats présélectionnés au Canada\" (fr) -> {\"type\":\"FILTER_APPLICANTS\",\"params\":{\"country\":\"Canada\",\"status\":\"shortlisted\"}}",
          "  \"shortlisted candidates with 5+ years\" -> {\"type\":\"FILTER_APPLICANTS\",\"params\":{\"status\":\"shortlisted\",\"minExperience\":5}}");

  @NotBlank private String generalRulesHeader = "RULES:";

  @NotNull @NotEmpty
  private List<@NotBlank String> generalRules =
      List.of(
          "- Return ONLY valid JSON (no markdown fences, no prose)",
          "- Use exact action names and enum values (case-sensitive)",
          "- If ambiguous, return {\"type\":\"CLARIFY\",\"params\":{\"questions\":[\"...\"]}}");

  @NotBlank
  private String rosterContextHeader =
      "ROSTER CONTEXT (live applicant data — use these exact labels in country and skills):";

  @NotBlank private String rosterCountriesLabel = "- Countries: ";
  @NotBlank private String rosterCitiesLabel = "- Cities: ";
  @NotBlank private String rosterSkillsLabel = "- Skills: ";
  @NotBlank private String rosterStatusesLabel = "- Statuses: ";

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

  public String getRosterEmptyLabel() {
    return rosterEmptyLabel;
  }

  public void setRosterEmptyLabel(String rosterEmptyLabel) {
    this.rosterEmptyLabel = rosterEmptyLabel;
  }

  public String getUserLanguagePrefix() {
    return userLanguagePrefix;
  }

  public void setUserLanguagePrefix(String userLanguagePrefix) {
    this.userLanguagePrefix = userLanguagePrefix;
  }

  public String getUserCommandPrefix() {
    return userCommandPrefix;
  }

  public void setUserCommandPrefix(String userCommandPrefix) {
    this.userCommandPrefix = userCommandPrefix;
  }

  public String getAvailableActionsPrefix() {
    return availableActionsPrefix;
  }

  public void setAvailableActionsPrefix(String availableActionsPrefix) {
    this.availableActionsPrefix = availableActionsPrefix;
  }

  public List<String> getCatalogIntroduction() {
    return catalogIntroduction;
  }

  public void setCatalogIntroduction(List<String> catalogIntroduction) {
    this.catalogIntroduction = catalogIntroduction;
  }

  public List<String> getActionLines() {
    return actionLines;
  }

  public void setActionLines(List<String> actionLines) {
    this.actionLines = actionLines;
  }

  public String getFilterFieldRulesHeader() {
    return filterFieldRulesHeader;
  }

  public void setFilterFieldRulesHeader(String filterFieldRulesHeader) {
    this.filterFieldRulesHeader = filterFieldRulesHeader;
  }

  public List<String> getFilterFieldRules() {
    return filterFieldRules;
  }

  public void setFilterFieldRules(List<String> filterFieldRules) {
    this.filterFieldRules = filterFieldRules;
  }

  public String getFilterExamplesHeader() {
    return filterExamplesHeader;
  }

  public void setFilterExamplesHeader(String filterExamplesHeader) {
    this.filterExamplesHeader = filterExamplesHeader;
  }

  public List<String> getFilterExamples() {
    return filterExamples;
  }

  public void setFilterExamples(List<String> filterExamples) {
    this.filterExamples = filterExamples;
  }

  public String getGeneralRulesHeader() {
    return generalRulesHeader;
  }

  public void setGeneralRulesHeader(String generalRulesHeader) {
    this.generalRulesHeader = generalRulesHeader;
  }

  public List<String> getGeneralRules() {
    return generalRules;
  }

  public void setGeneralRules(List<String> generalRules) {
    this.generalRules = generalRules;
  }

  public String getRosterContextHeader() {
    return rosterContextHeader;
  }

  public void setRosterContextHeader(String rosterContextHeader) {
    this.rosterContextHeader = rosterContextHeader;
  }

  public String getRosterCountriesLabel() {
    return rosterCountriesLabel;
  }

  public void setRosterCountriesLabel(String rosterCountriesLabel) {
    this.rosterCountriesLabel = rosterCountriesLabel;
  }

  public String getRosterCitiesLabel() {
    return rosterCitiesLabel;
  }

  public void setRosterCitiesLabel(String rosterCitiesLabel) {
    this.rosterCitiesLabel = rosterCitiesLabel;
  }

  public String getRosterSkillsLabel() {
    return rosterSkillsLabel;
  }

  public void setRosterSkillsLabel(String rosterSkillsLabel) {
    this.rosterSkillsLabel = rosterSkillsLabel;
  }

  public String getRosterStatusesLabel() {
    return rosterStatusesLabel;
  }

  public void setRosterStatusesLabel(String rosterStatusesLabel) {
    this.rosterStatusesLabel = rosterStatusesLabel;
  }
}
