package com.recruita.api.action.validation;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruita.api.action.model.ActionParamKey;
import com.recruita.api.action.model.ApplicationStatusWire;
import com.recruita.api.action.model.FilterRosterContext;
import com.recruita.api.action.model.ParamsValidationResult;
import com.recruita.api.action.model.RosterLocaleSupport;
import com.recruita.api.action.prompt.ActionFilterRosterContextProvider;
import com.recruita.api.config.properties.ActionMessageProperties;
import com.recruita.api.config.properties.ActionProperties;
import com.recruita.api.config.properties.RecruitaProperties;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class FilterParamsValidator {

  private final ActionProperties.ValidationLimitsProperties limits;
  private final ActionMessageProperties messages;
  private final ActionFilterRosterContextProvider rosterContextProvider;

  public FilterParamsValidator(
      RecruitaProperties properties, ActionFilterRosterContextProvider rosterContextProvider) {
    this.limits = properties.getAction().getValidation();
    this.messages = properties.getAction().getMessages();
    this.rosterContextProvider = rosterContextProvider;
  }

  public ParamsValidationResult validate(JsonNode params) {
    List<String> errors = new ArrayList<>();
    if (!ActionJsonSupport.isObject(params)) {
      return ParamsValidationResult.invalid(List.of(messages.getFilterParamsMustBeObject()));
    }

    validateSkillsStructure(params, errors);
    if (!errors.isEmpty()) {
      return ParamsValidationResult.invalid(errors);
    }

    FilterRosterContext roster = rosterContextProvider.snapshot();
    Map<String, Object> normalized =
        FilterParamsRosterNormalizer.normalize(ActionJsonSupport.toStringObjectMap(params), roster);

    validateSkills(normalized, roster.skills(), errors);
    validateCountry(normalized, roster.countries(), errors);
    validateExperience(normalized, errors);
    validateStatus(normalized, errors);
    validateOptionalTextField(
        errors, normalized, ActionParamKey.SEARCH_TERM, limits.getMaxSearchTermLength());
    validateOptionalTextField(
        errors, normalized, ActionParamKey.COUNTRY, limits.getMaxSearchTermLength());
    validateOptionalTextField(
        errors, normalized, ActionParamKey.LOCATION, limits.getMaxSearchTermLength());

    if (!errors.isEmpty()) {
      return ParamsValidationResult.invalid(errors);
    }

    return ParamsValidationResult.valid(normalized);
  }

  private void validateSkillsStructure(JsonNode params, List<String> errors) {
    JsonNode skills = params.get(ActionParamKey.SKILLS);
    if (skills == null || skills.isMissingNode()) {
      return;
    }
    if (!skills.isArray()) {
      errors.add(messages.getSkillsMustBeArray());
      return;
    }
    for (JsonNode item : skills) {
      if (!item.isTextual()) {
        errors.add(messages.getSkillsMustBeArray());
        return;
      }
    }
  }

  private void validateSkills(
      Map<String, Object> params, List<String> rosterSkills, List<String> errors) {
    Object skills = params.get(ActionParamKey.SKILLS);
    if (skills == null) {
      return;
    }
    if (!(skills instanceof List<?> skillList)) {
      errors.add(messages.getSkillsMustBeArray());
      return;
    }
    if (skillList.size() > limits.getMaxSkills()) {
      errors.add(messages.formatTooManySkills(limits.getMaxSkills()));
    }
    for (Object value : skillList) {
      if (!(value instanceof String skill)) {
        errors.add(messages.getSkillsMustBeArray());
        return;
      }
      if (!isRosterLabel(skill, rosterSkills)) {
        errors.add(messages.getInvalidSkill());
        return;
      }
    }
  }

  private void validateCountry(
      Map<String, Object> params, List<String> rosterCountries, List<String> errors) {
    Object country = params.get(ActionParamKey.COUNTRY);
    if (country == null) {
      return;
    }
    if (!(country instanceof String countryText) || countryText.isBlank()) {
      return;
    }
    if (!isRosterLabel(countryText, rosterCountries)) {
      errors.add(messages.getInvalidCountry());
    }
  }

  private static boolean isRosterLabel(String label, List<String> rosterLabels) {
    return rosterLabels.stream()
        .anyMatch(rosterLabel -> RosterLocaleSupport.labelsEqual(rosterLabel, label));
  }

  private void validateExperience(Map<String, Object> params, List<String> errors) {
    Object minExperience = params.get(ActionParamKey.MIN_EXPERIENCE);
    if (minExperience instanceof Number minValue
        && minValue.intValue() < limits.getMinExperience()) {
      errors.add(messages.formatMinExperienceTooLow(limits.getMinExperience()));
    }

    Object maxExperience = params.get(ActionParamKey.MAX_EXPERIENCE);
    if (maxExperience instanceof Number maxValue
        && maxValue.intValue() > limits.getMaxExperience()) {
      errors.add(messages.formatMaxExperienceTooHigh(limits.getMaxExperience()));
    }
  }

  private void validateStatus(Map<String, Object> params, List<String> errors) {
    Object status = params.get(ActionParamKey.STATUS);
    if (status == null) {
      return;
    }
    if (!(status instanceof String statusText) || !ApplicationStatusWire.isWireValue(statusText)) {
      errors.add(messages.formatInvalidStatus(ApplicationStatusWire.formatList()));
    }
  }

  private void validateOptionalTextField(
      List<String> errors, Map<String, Object> params, String fieldKey, int maxLength) {
    Object value = params.get(fieldKey);
    if (value == null) {
      return;
    }
    if (!(value instanceof String text) || text.length() > maxLength) {
      errors.add(messages.formatOptionalTextFieldInvalid(fieldKey, maxLength));
    }
  }
}
