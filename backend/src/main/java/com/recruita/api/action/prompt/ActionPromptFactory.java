package com.recruita.api.action.prompt;

import com.recruita.api.action.model.ActionType;
import com.recruita.api.action.model.ApplicationStatusWire;
import com.recruita.api.action.model.ExportFormatWire;
import com.recruita.api.action.model.FilterRosterContext;
import com.recruita.api.action.model.ReportType;
import com.recruita.api.common.enums.UiLanguage;
import com.recruita.api.common.text.PromptTextSupport;
import com.recruita.api.config.properties.ActionProperties;
import com.recruita.api.config.properties.RecruitaProperties;
import org.springframework.stereotype.Component;

/** Builds LLM prompts for natural-language action parsing (single source of catalog text). */
@Component
public class ActionPromptFactory {

  private static final String ROSTER_EMPTY_LABEL = "(none loaded)";

  private final ActionProperties.PromptCatalogProperties catalog;
  private final ActionProperties.ValidationLimitsProperties limits;
  private final ActionFilterRosterContextProvider rosterContextProvider;

  public ActionPromptFactory(
      RecruitaProperties properties, ActionFilterRosterContextProvider rosterContextProvider) {
    this.catalog = properties.getAction().getPromptCatalog();
    this.limits = properties.getAction().getValidation();
    this.rosterContextProvider = rosterContextProvider;
  }

  public String systemPrompt() {
    StringBuilder prompt = PromptTextSupport.newBuffer(4096);
    PromptTextSupport.appendParagraph(prompt, catalog.getAssistantRole());
    PromptTextSupport.appendParagraph(prompt, catalog.getResponseRule());
    PromptTextSupport.appendParagraph(prompt, buildActionCatalog());
    PromptTextSupport.appendParagraph(
        prompt, buildFilterRosterContext(rosterContextProvider.snapshot()));
    return prompt.toString();
  }

  public String userPrompt(String command, UiLanguage language) {
    UiLanguage resolved = language != null ? language : UiLanguage.EN;
    String sanitized = command.trim().replace("\"", "'");
    return PromptTextSupport.newBuffer(64 + sanitized.length())
        .append("User language: ")
        .append(resolved.code())
        .append("\nUser command: \"")
        .append(sanitized)
        .append('"')
        .toString();
  }

  private String buildActionCatalog() {
    String validActions = joinEnumNames(ActionType.values());
    String validStatuses = ApplicationStatusWire.joinedPipe();
    String validFormats = ExportFormatWire.joinedPipe();
    String validReportTypes = ReportType.joinedPipe();

    StringBuilder catalog = PromptTextSupport.newBuffer(3072);
    PromptTextSupport.appendLine(
        catalog,
        "You convert the user command into ONE JSON action. You own all semantic matching.");
    PromptTextSupport.appendLine(
        catalog,
        "The application does not reinterpret your output — put every filter in the correct field.");
    PromptTextSupport.appendBlankLine(catalog);
    PromptTextSupport.appendLine(catalog, "AVAILABLE ACTIONS: " + validActions);
    PromptTextSupport.appendBlankLine(catalog);
    PromptTextSupport.appendLine(
        catalog,
        "1. FILTER_APPLICANTS — country, skills, minExperience, maxExperience, status ("
            + validStatuses
            + "), searchTerm");
    PromptTextSupport.appendLine(
        catalog, "2. UPDATE_STATUS — applicantIdentifier, newStatus (" + validStatuses + ")");
    PromptTextSupport.appendLine(
        catalog, "3. EXPORT_DATA — format (" + validFormats + "), optional filters");
    PromptTextSupport.appendLine(
        catalog,
        "4. CREATE_APPLICANT — name, email, phone?, skills, yearsOfExperience, currentJobTitle");
    PromptTextSupport.appendLine(catalog, "5. DELETE_APPLICANT — applicantIdentifier");
    PromptTextSupport.appendLine(
        catalog, "6. GENERATE_REPORT — reportType (" + validReportTypes + "), optional filters");
    PromptTextSupport.appendLine(
        catalog,
        "7. MATCH_JOB — jobDescription, optional limit (default "
            + limits.getMatchLimitDefault()
            + ")");
    PromptTextSupport.appendLine(
        catalog, "8. BULK_UPDATE — filters, updates (applicationStatus or notes)");
    PromptTextSupport.appendLine(
        catalog, "9. CLARIFY — questions (string[]) when the command is ambiguous");
    PromptTextSupport.appendBlankLine(catalog);
    PromptTextSupport.appendLine(catalog, "FILTER_APPLICANTS field rules (you must follow these):");
    PromptTextSupport.appendLine(
        catalog, "- country: roster country label when the user mentions a country or region");
    PromptTextSupport.appendLine(
        catalog, "- skills: roster skill labels when the user mentions skills (array of strings)");
    PromptTextSupport.appendLine(
        catalog, "- status: only when the user names a pipeline stage from: " + validStatuses);
    PromptTextSupport.appendLine(
        catalog, "- minExperience / maxExperience: only when the user states experience bounds");
    PromptTextSupport.appendLine(
        catalog,
        "- Use exact roster labels from ROSTER CONTEXT for country and skills; exact status wire values");
    PromptTextSupport.appendLine(
        catalog,
        "- The user command may be in any supported UI language (en, de, fr, it, rm, es); interpret geography, skills, and status words in that language, then output roster labels");
    PromptTextSupport.appendLine(
        catalog,
        "- searchTerm: ONLY person names or job-title text — NEVER countries, cities, skills, or status words");
    PromptTextSupport.appendLine(catalog, "- Omit every param the user did not mention");
    PromptTextSupport.appendLine(
        catalog,
        "- NEVER put US/USA/UK/Canada or any geography in searchTerm — always use country");
    PromptTextSupport.appendLine(
        catalog,
        "- Ranking words (top, best, leading) are NOT status and NOT searchTerm — omit them");
    PromptTextSupport.appendBlankLine(catalog);
    PromptTextSupport.appendLine(catalog, "FILTER_APPLICANTS examples:");
    PromptTextSupport.appendLine(
        catalog,
        "  \"show top applicants in the US\" -> {\"type\":\"FILTER_APPLICANTS\",\"params\":{\"country\":\"USA\"}}");
    PromptTextSupport.appendLine(
        catalog,
        "  \"find React developers in Canada\" -> {\"type\":\"FILTER_APPLICANTS\",\"params\":{\"country\":\"Canada\",\"skills\":[\"React\"]}}");
    PromptTextSupport.appendLine(
        catalog,
        "  \"developers in Berlin\" -> {\"type\":\"FILTER_APPLICANTS\",\"params\":{\"country\":\"Germany\"}}");
    PromptTextSupport.appendLine(
        catalog,
        "  \"Entwickler in Deutschland\" (de) -> {\"type\":\"FILTER_APPLICANTS\",\"params\":{\"country\":\"Germany\"}}");
    PromptTextSupport.appendLine(
        catalog,
        "  \"candidats présélectionnés au Canada\" (fr) -> {\"type\":\"FILTER_APPLICANTS\",\"params\":{\"country\":\"Canada\",\"status\":\"shortlisted\"}}");
    PromptTextSupport.appendLine(
        catalog,
        "  \"shortlisted candidates with 5+ years\" -> {\"type\":\"FILTER_APPLICANTS\",\"params\":{\"status\":\"shortlisted\",\"minExperience\":5}}");
    PromptTextSupport.appendBlankLine(catalog);
    PromptTextSupport.appendLine(catalog, "RULES:");
    PromptTextSupport.appendLine(
        catalog, "- Return ONLY valid JSON (no markdown fences, no prose)");
    PromptTextSupport.appendLine(
        catalog, "- Use exact action names and enum values (case-sensitive)");
    PromptTextSupport.appendLine(
        catalog,
        "- If ambiguous, return {\"type\":\"CLARIFY\",\"params\":{\"questions\":[\"...\"]}}");
    return catalog.toString();
  }

  private static String buildFilterRosterContext(FilterRosterContext roster) {
    StringBuilder context = PromptTextSupport.newBuffer(512);
    PromptTextSupport.appendLine(
        context,
        "ROSTER CONTEXT (live applicant data — use these exact labels in country and skills):");
    PromptTextSupport.appendLine(
        context,
        "- Countries: "
            + PromptTextSupport.joinCommaSeparated(roster.countries(), ROSTER_EMPTY_LABEL));
    PromptTextSupport.appendLine(
        context,
        "- Cities: " + PromptTextSupport.joinCommaSeparated(roster.cities(), ROSTER_EMPTY_LABEL));
    PromptTextSupport.appendLine(
        context,
        "- Skills: " + PromptTextSupport.joinCommaSeparated(roster.skills(), ROSTER_EMPTY_LABEL));
    PromptTextSupport.appendLine(context, "- Statuses: " + ApplicationStatusWire.formatList());
    return context.toString();
  }

  private static String joinEnumNames(Enum<?>[] values) {
    StringBuilder joined = new StringBuilder();
    for (int index = 0; index < values.length; index++) {
      if (index > 0) {
        joined.append(", ");
      }
      joined.append(values[index].name());
    }
    return joined.toString();
  }
}
