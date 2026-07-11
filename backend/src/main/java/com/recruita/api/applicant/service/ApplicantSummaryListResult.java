package com.recruita.api.applicant.service;

import com.recruita.api.api.dto.applicant.ApplicantSummaryDto;
import com.recruita.api.applicant.roster.RosterWatermark;
import java.util.List;
import java.util.Optional;

/** Applicant summary list payload paired with the roster watermark used for conditional GET. */
public record ApplicantSummaryListResult(
    RosterWatermark watermark, Optional<List<ApplicantSummaryDto>> summaries) {}
