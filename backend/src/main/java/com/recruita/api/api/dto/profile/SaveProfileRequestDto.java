package com.recruita.api.api.dto.profile;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.recruita.api.common.enums.UiLanguage;
import com.recruita.api.config.validation.ProfileValidationMessageKey;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SaveProfileRequestDto(
    @NotBlank(message = "{" + ProfileValidationMessageKey.Codes.ID_REQUIRED + "}") String id,
    @NotNull Boolean privacyNoticeAccepted,
    @NotNull(message = "{" + ProfileValidationMessageKey.Codes.LAST_LANGUAGE_REQUIRED + "}")
        UiLanguage lastLanguage,
    @NotNull Boolean optionalRemoteTranslation,
    @NotNull Boolean optionalGeocoding,
    @NotNull Boolean optionalAiMatching) {}
