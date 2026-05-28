package com.recruita.api.api.dto.profile;

import com.recruita.api.common.enums.UiLanguage;
import java.time.Instant;

public record ProfileDto(
    String id,
    boolean privacyNoticeAccepted,
    UiLanguage lastLanguage,
    boolean optionalRemoteTranslation,
    boolean optionalGeocoding,
    boolean optionalAiMatching,
    Instant createdAt,
    Instant updatedAt) {}
