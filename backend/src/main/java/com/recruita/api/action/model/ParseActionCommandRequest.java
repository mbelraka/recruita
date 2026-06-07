package com.recruita.api.action.model;

import com.recruita.api.common.enums.UiLanguage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ParseActionCommandRequest(
    @NotBlank @Size(max = ActionValidationLimits.MAX_COMMAND_LENGTH) String command,
    UiLanguage language) {}
