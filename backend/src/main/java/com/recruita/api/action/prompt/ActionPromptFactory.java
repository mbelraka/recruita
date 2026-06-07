package com.recruita.api.action.prompt;

import com.recruita.api.action.model.ActionType;
import com.recruita.api.action.model.ApplicationStatusWire;
import com.recruita.api.action.model.ExportFormatWire;
import com.recruita.api.action.model.ReportType;
import com.recruita.api.config.properties.ActionProperties;
import com.recruita.api.config.properties.RecruitaProperties;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/** Builds LLM prompts for natural-language action parsing (single source of catalog text). */
@Component
public class ActionPromptFactory {

  private final ActionProperties.PromptCatalogProperties catalog;
  private final ActionProperties.ValidationLimitsProperties limits;

  public ActionPromptFactory(RecruitaProperties properties) {
    this.catalog = properties.getAction().getPromptCatalog();
    this.limits = properties.getAction().getValidation();
  }

  public String systemPrompt() {
    return catalog.getAssistantRole()
        + "\n\n"
        + catalog.getResponseRule()
        + "\n\n"
        + buildActionCatalog();
  }

  public String userPrompt(String command) {
    String sanitized = command.trim().replace("\"", "'");
    return "User command: \"" + sanitized + "\"";
  }

  private String buildActionCatalog() {
    String validActions =
        Arrays.stream(ActionType.values()).map(Enum::name).collect(Collectors.joining(", "));
    String validStatuses = ApplicationStatusWire.joinedPipe();
    String validFormats = ExportFormatWire.joinedPipe();
    String validReportTypes = ReportType.joinedPipe();

    List<String> lines = new ArrayList<>();
    lines.add("Your ONLY job is to convert user commands into JSON actions for Recruita.");
    lines.add("");
    lines.add("AVAILABLE ACTIONS: " + validActions);
    lines.add("");
    lines.add(
        "1. FILTER_APPLICANTS — skills, minExperience, maxExperience, status ("
            + validStatuses
            + "), location, searchTerm");
    lines.add("2. UPDATE_STATUS — applicantIdentifier, newStatus (" + validStatuses + ")");
    lines.add("3. EXPORT_DATA — format (" + validFormats + "), optional filters");
    lines.add(
        "4. CREATE_APPLICANT — name, email, phone?, skills, yearsOfExperience, currentJobTitle");
    lines.add("5. DELETE_APPLICANT — applicantIdentifier");
    lines.add("6. GENERATE_REPORT — reportType (" + validReportTypes + "), optional filters");
    lines.add(
        "7. MATCH_JOB — jobDescription, optional limit (default "
            + limits.getMatchLimitDefault()
            + ")");
    lines.add("8. BULK_UPDATE — filters, updates (applicationStatus or notes)");
    lines.add("9. CLARIFY — questions (string[]) when the command is ambiguous");
    lines.add("");
    lines.add("RULES:");
    lines.add("- Return ONLY valid JSON (no markdown fences, no prose)");
    lines.add("- Use exact action names and enum values (case-sensitive)");
    lines.add("- If ambiguous, return {\"type\":\"CLARIFY\",\"params\":{\"questions\":[\"...\"]}}");
    return String.join("\n", lines);
  }
}
