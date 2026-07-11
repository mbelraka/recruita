package com.recruita.api.applicant.roster;

import java.time.Instant;

public record RosterWatermark(
    long version, String etag, Instant lastModified, long applicantCount) {}
