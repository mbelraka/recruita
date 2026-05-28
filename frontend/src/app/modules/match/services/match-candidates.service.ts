import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  catchError,
  map,
  Observable,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs';

import { APP_CONFIG } from '../../../config/app.config';
import { Languages } from '../../../enums/language.enum';
import { PrivacyConsentService } from '../../../services/privacy-consent.service';
import { ApiProblemDetailPropertyKey } from '../../../enums/api-problem-detail-property-key.enum';
import { MATCH_SCORE_PREFIX } from '../../../utilities/RegEx';
import { Applicant } from '../../applicants/models/applicant.model';
import { MATCH_ERROR_PRIVACY_AI_DISABLED } from '../constants/match-error-codes';
import { MatchErrorMessage } from '../enums/match-error-message.enum';
import {
  MATCH_API_SCORE_COLLECTION_KEYS,
  MATCH_SCORE_CORRELATION_ID_KEYS,
  MATCH_SCORE_NAME_KEYS,
  MATCH_SCORE_NESTED_NUMERIC_KEYS,
  MATCH_SCORE_PRIMARY_VALUE_KEYS,
  MATCH_SCORE_RECOMMENDATION_TEXT_KEYS,
} from '../constants/match-response-keys.const';
import { MatchApiResponse } from '../models/match-api-response.model';
import { MatchProxyRequestBody } from '../models/match-proxy-request-body.model';
import { MatchCandidateResult } from '../models/match-candidate-result.model';
import { MatchScoreItem } from '../models/match-score-item.model';
import { ParsedMatchScoreItem } from '../models/parsed-match-score-item.model';
import {
  createMatchLlmCorrelationId,
  toPrivacyPreservingCandidatePayload,
} from '../utilities/match-candidate-privacy.util';

@Injectable({ providedIn: 'root' })
export class MatchCandidatesService {
  private get config() {
    return APP_CONFIG.MATCH;
  }

  public constructor(
    private readonly _http: HttpClient,
    private readonly _privacy: PrivacyConsentService
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
    if (!this._privacy.optionalAiMatching()) {
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
        timeout({ first: this.config.REQUEST_TIMEOUT_MS }),
        map((response) =>
          this._mergeAndRankResults(
            stableApplicants,
            this._remapLlmCorrelationIdsToInternal(
              this._parseGroqScores(response),
              llmTempIdToInternalId
            ),
            topCandidatesCount
          )
        ),
        catchError((error: unknown) =>
          throwError(() => this._toServiceError(error))
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

  private _extractBackendErrorMessage(error: unknown): string | null {
    if (error instanceof HttpErrorResponse) {
      const payload = error.error;
      if (typeof payload === 'string' && payload.trim()) {
        return payload.trim();
      }
      if (payload && typeof payload === 'object') {
        const errText = (
          payload as Partial<Record<ApiProblemDetailPropertyKey, unknown>>
        )[APP_CONFIG.HTTP.PROBLEM_DETAIL_ERROR_PROPERTY];
        if (typeof errText === 'string' && errText.trim()) {
          return errText.trim();
        }
      }
    }
    if (error instanceof Error && error.message.trim()) {
      return error.message.trim();
    }
    return null;
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

  private _parseGroqScores(response: MatchApiResponse): ParsedMatchScoreItem[] {
    return this._getRawScores(response)
      .map((item, index) => this._toParsedScoreItem(item, index))
      .filter((item): item is ParsedMatchScoreItem => item !== null);
  }

  private _sanitizeRecommendationText(text: string): string {
    return text.replace(MATCH_SCORE_PREFIX, '').trim();
  }

  private _primaryRecommendationPlainText(item: MatchScoreItem): string {
    for (const key of MATCH_SCORE_RECOMMENDATION_TEXT_KEYS) {
      const value = item[key];
      if (value !== undefined && value !== null) {
        return String(value).trim();
      }
    }
    return '';
  }

  private _extractId(item: MatchScoreItem): string | null {
    for (const key of MATCH_SCORE_CORRELATION_ID_KEYS) {
      const raw = item[key];
      if (raw === undefined || raw === null) {
        continue;
      }
      const normalized = String(raw).trim();
      return normalized || null;
    }
    return null;
  }

  private _extractName(item: MatchScoreItem): string | undefined {
    for (const key of MATCH_SCORE_NAME_KEYS) {
      const raw = item[key];
      if (raw === undefined || raw === null) {
        continue;
      }
      const normalized = String(raw).trim();
      return normalized || undefined;
    }
    return undefined;
  }

  private _normalizeName(value: string | undefined): string {
    return (value ?? '').trim().toLowerCase();
  }

  private _parseScore(
    item: Omit<MatchScoreItem, 'id'> & { id?: string | number | null }
  ): number {
    let raw: unknown = this.config.SCORE.MIN;
    for (const key of MATCH_SCORE_PRIMARY_VALUE_KEYS) {
      const v = item[key];
      if (v !== undefined && v !== null) {
        raw = v;
        break;
      }
    }
    return this._parseNumericScore(raw);
  }

  private _parseNumericScore(raw: unknown): number {
    const parsed = this._extractNumber(raw);
    if (!Number.isFinite(parsed)) {
      return this.config.SCORE.MIN;
    }

    const { MIN, MAX, NORMALIZE_TO_PERCENT_MAX_INCLUSIVE } = this.config.SCORE;
    const normalized =
      parsed > MIN && parsed <= NORMALIZE_TO_PERCENT_MAX_INCLUSIVE
        ? parsed * MAX
        : parsed;
    return this._clampScore(normalized);
  }

  private _extractNumber(value: unknown): number {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      const text = value.trim();
      if (!text) {
        return Number.NaN;
      }
      const numeric = text.replace(',', '.').replace(/[^\d.-]/g, '');
      return Number(numeric);
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return Number.NaN;
      }
      return this._extractNumber(value[0]);
    }

    if (value && typeof value === 'object') {
      const candidate = value as Record<string, unknown>;
      for (const key of MATCH_SCORE_NESTED_NUMERIC_KEYS) {
        if (key in candidate) {
          const nested = this._extractNumber(candidate[key]);
          if (Number.isFinite(nested)) {
            return nested;
          }
        }
      }
    }

    return Number.NaN;
  }

  private _clampScore(value: number): number {
    const n = Number(value);
    if (!Number.isFinite(n)) {
      return this.config.SCORE.MIN;
    }
    const clamped = Math.max(
      this.config.SCORE.MIN,
      Math.min(this.config.SCORE.MAX, n)
    );
    return Math.round(clamped);
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

  private _toServiceError(error: unknown): Error {
    const message =
      error instanceof TimeoutError
        ? MatchErrorMessage.GroqRequestTimeout
        : (this._extractBackendErrorMessage(error) ??
          MatchErrorMessage.GroqProxyUnreachable);
    return new Error(message);
  }

  private _getRawScores(response: MatchApiResponse): MatchScoreItem[] {
    for (const key of MATCH_API_SCORE_COLLECTION_KEYS) {
      const list = response[key];
      if (list !== undefined && list !== null) {
        return Array.isArray(list) ? list : [];
      }
    }
    return [];
  }

  private _toParsedScoreItem(
    item: MatchScoreItem,
    sourceIndex: number
  ): ParsedMatchScoreItem | null {
    const id = this._extractId(item) ?? '';
    const name = this._extractName(item);
    const hasIdentity =
      id.trim().length > 0 || this._normalizeName(name).length > 0;
    if (!hasIdentity) {
      return null;
    }

    return {
      ...item,
      id,
      sourceIndex,
      name,
      matchScore: this._parseScore(item),
      matchingSkills: item.matchingSkills ?? [],
      missingSkills: item.missingSkills ?? [],
      candidateProfile: {
        skills: item.candidateProfile?.skills ?? [],
        yearsExperience: Number(item.candidateProfile?.yearsExperience ?? 0),
        topJobTitles: item.candidateProfile?.topJobTitles ?? [],
        education: item.candidateProfile?.education ?? '',
      },
      recommendation: this._sanitizeRecommendationText(
        this._primaryRecommendationPlainText(item)
      ),
    };
  }
}
