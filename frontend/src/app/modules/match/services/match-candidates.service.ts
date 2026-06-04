import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, Observable, throwError } from 'rxjs';

import { APP_CONFIG } from '../../../config/app.config';
import { Languages } from '../../../enums/language.enum';
import { PrivacyConsentService } from '../../../services/privacy-consent.service';
import { Applicant } from '../../applicants/models/applicant.model';
import { MATCH_ERROR_PRIVACY_AI_DISABLED } from '../constants/match-error-codes';
import { MatchErrorMessage } from '../enums/match-error-message.enum';
import { MatchApiResponse } from '../models/match-api-response.model';
import { MatchProxyRequestBody } from '../models/match-proxy-request-body.model';
import { MatchCandidateResult } from '../models/match-candidate-result.model';
import { ParsedMatchScoreItem } from '../models/parsed-match-score-item.model';
import {
  createMatchLlmCorrelationId,
  toPrivacyPreservingCandidatePayload,
} from '../utilities/match-candidate-privacy.util';
import { MatchGroqResponseParser } from './match-groq-response.parser';

@Injectable({ providedIn: 'root' })
export class MatchCandidatesService {
  private get config() {
    return APP_CONFIG.MATCH;
  }

  public constructor(
    private readonly _http: HttpClient,
    private readonly _privacy: PrivacyConsentService,
    private readonly _groqParser: MatchGroqResponseParser
  ) {}

  public evaluate(
    jobDescription: string,
    applicants: Applicant[],
    topCandidatesCount: number,
    language: Languages
  ): Observable<MatchCandidateResult[]> {
    if (!jobDescription.trim()) {
      return throwError(
        () => new Error(MatchErrorMessage.MissingJobDescription)
      );
    }
    if (applicants.length === 0) {
      return throwError(
        () => new Error(MatchErrorMessage.NoApplicantsAvailable)
      );
    }
    if (!this._privacy.allowsAiMatching()) {
      return throwError(() => new Error(MATCH_ERROR_PRIVACY_AI_DISABLED));
    }
    const stableApplicants = this._sortApplicantsForMatching(applicants);
    const { requestBody, llmTempIdToInternalId } =
      this._buildGroqMatchRequestBody(
        jobDescription,
        stableApplicants,
        language
      );

    return this._http
      .post<MatchApiResponse>(this.config.GROQ.MATCH_ENDPOINT, requestBody)
      .pipe(
        map((response) =>
          this._mergeAndRankResults(
            stableApplicants,
            this._remapLlmCorrelationIdsToInternal(
              this._groqParser.parseScores(response),
              llmTempIdToInternalId
            ),
            topCandidatesCount
          )
        )
      );
  }

  private _sortApplicantsForMatching(applicants: Applicant[]): Applicant[] {
    return [...applicants].sort((a, b) => {
      const byId = String(a.id).localeCompare(String(b.id));
      if (byId !== 0) {
        return byId;
      }
      return (a.name ?? '').localeCompare(b.name ?? '');
    });
  }

  private _buildGroqMatchRequestBody(
    jobDescription: string,
    applicants: Applicant[],
    language: Languages
  ): {
    requestBody: MatchProxyRequestBody;
    llmTempIdToInternalId: Map<string, string>;
  } {
    const llmTempIdToInternalId = new Map<string, string>();
    const candidates = applicants.map((applicant) => {
      const tempId = createMatchLlmCorrelationId();
      llmTempIdToInternalId.set(tempId, applicant.id);
      return toPrivacyPreservingCandidatePayload(applicant, tempId);
    });

    return {
      requestBody: {
        model: this.config.GROQ.MODEL,
        temperature: this.config.GROQ.TEMPERATURE,
        deterministic: this.config.GROQ.DETERMINISTIC_SCORING,
        language,
        locale: APP_CONFIG.getLocale(language),
        jobDescription: jobDescription.trim(),
        candidates,
      },
      llmTempIdToInternalId,
    };
  }

  private _remapLlmCorrelationIdsToInternal(
    scores: ParsedMatchScoreItem[],
    llmTempIdToInternalId: Map<string, string>
  ): ParsedMatchScoreItem[] {
    return scores.map((item) => {
      const key = item.id.trim();
      const internal = llmTempIdToInternalId.get(key);
      if (!internal) {
        return item;
      }
      return { ...item, id: internal };
    });
  }

  private _mergeAndRankResults(
    applicants: Applicant[],
    scores: ParsedMatchScoreItem[],
    topCandidatesCount: number
  ): MatchCandidateResult[] {
    const scoreById = new Map(
      scores
        .filter((item) => item.id.trim().length > 0)
        .map((item) => [item.id, item] as const)
    );
    const scoreByIndex = new Map(
      scores.map((item) => [item.sourceIndex, item])
    );
    const consumed = new Set<ParsedMatchScoreItem>();

    const merged = applicants.map((applicant, applicantIndex) => {
      const idCandidate = scoreById.get(applicant.id);
      const indexCandidate =
        applicants.length === scores.length
          ? scoreByIndex.get(applicantIndex)
          : undefined;
      /** Prefer surrogate id — never correlate by LLM-returned names (privacy + wrong-name risk). */
      const scoreItem = [idCandidate, indexCandidate].find(
        (candidate) => candidate && !consumed.has(candidate)
      );
      if (scoreItem) {
        consumed.add(scoreItem);
      }
      const recommendation = scoreItem?.recommendation ?? '';

      return {
        applicant,
        score: scoreItem?.matchScore ?? this.config.SCORE.MIN,
        reasoning: recommendation,
        matchingSkills: scoreItem?.matchingSkills ?? [],
        missingSkills: scoreItem?.missingSkills ?? [],
        candidateProfile: {
          skills: scoreItem?.candidateProfile?.skills ?? [],
          yearsExperience: scoreItem?.candidateProfile?.yearsExperience ?? 0,
          topJobTitles: scoreItem?.candidateProfile?.topJobTitles ?? [],
          education: scoreItem?.candidateProfile?.education ?? '',
        },
        recommendation,
        isTopCandidate: false,
      };
    });

    const ranked = [...merged].sort((a, b) => b.score - a.score);
    const topN = Math.max(0, Math.floor(topCandidatesCount));
    return ranked.map((candidate, index) => ({
      ...candidate,
      isTopCandidate: index < topN,
    }));
  }
}
