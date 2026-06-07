package com.recruita.api.action.validation;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruita.api.action.model.ActionParamKey;
import com.recruita.api.action.model.ActionValidationLimits;
import com.recruita.api.action.model.ParamsValidationResult;
import com.recruita.api.config.properties.ActionProperties;
import com.recruita.api.config.properties.RecruitaProperties;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class CreateApplicantParamsValidator {

  private static final Pattern VALID_NAME_CHARS = Pattern.compile("^[a-zA-Z\\s\\-']+$");

  private final ActionProperties.ValidationLimitsProperties limits;

  public CreateApplicantParamsValidator(RecruitaProperties properties) {
    this.limits = properties.getAction().getValidation();
  }

  public ParamsValidationResult validate(JsonNode params) {
    List<String> errors = new ArrayList<>();
    if (!ActionJsonSupport.isObject(params)) {
      return ParamsValidationResult.invalid(List.of("Create applicant params must be an object"));
    }

    JsonNode name = params.get(ActionParamKey.NAME);
    if (name == null || !name.isTextual() || !isValidName(name.asText())) {
      errors.add(
          "name must be a valid name ("
              + limits.getMinNameLength()
              + "-"
              + limits.getMaxNameLength()
              + " characters)");
    }

    JsonNode email = params.get(ActionParamKey.EMAIL);
    if (email == null
        || !email.isTextual()
        || !ActionValidationLimits.isValidEmail(email.asText())) {
      errors.add("email must be a valid email address");
    }

    JsonNode skills = params.get(ActionParamKey.SKILLS);
    if (!ActionJsonSupport.isStringArray(skills) || skills.isEmpty()) {
      errors.add("skills must be a non-empty array of strings");
    }

    JsonNode yearsOfExperience = params.get(ActionParamKey.YEARS_OF_EXPERIENCE);
    if (yearsOfExperience == null
        || !yearsOfExperience.isNumber()
        || yearsOfExperience.asInt() < limits.getMinExperience()
        || yearsOfExperience.asInt() > limits.getMaxExperience()) {
      errors.add(
          "yearsOfExperience must be between "
              + limits.getMinExperience()
              + " and "
              + limits.getMaxExperience());
    }

    JsonNode currentJobTitle = params.get(ActionParamKey.CURRENT_JOB_TITLE);
    if (currentJobTitle == null
        || !currentJobTitle.isTextual()
        || currentJobTitle.asText().trim().isEmpty()) {
      errors.add("currentJobTitle is required");
    }

    if (!errors.isEmpty()) {
      return ParamsValidationResult.invalid(errors);
    }

    Map<String, Object> actionParams = new LinkedHashMap<>();
    actionParams.put(ActionParamKey.NAME, name.asText());
    actionParams.put(ActionParamKey.EMAIL, email.asText());
    JsonNode phone = params.get(ActionParamKey.PHONE);
    if (phone != null && phone.isTextual()) {
      actionParams.put(ActionParamKey.PHONE, phone.asText());
    }
    actionParams.put(ActionParamKey.SKILLS, ActionJsonSupport.toStringList(skills));
    actionParams.put(ActionParamKey.YEARS_OF_EXPERIENCE, yearsOfExperience.numberValue());
    actionParams.put(ActionParamKey.CURRENT_JOB_TITLE, currentJobTitle.asText());

    return ParamsValidationResult.valid(actionParams);
  }

  private boolean isValidName(String name) {
    int length = name.length();
    return length >= limits.getMinNameLength()
        && length <= limits.getMaxNameLength()
        && VALID_NAME_CHARS.matcher(name).matches();
  }
}
