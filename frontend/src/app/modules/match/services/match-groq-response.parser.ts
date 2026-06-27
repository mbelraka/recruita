import { Injectable } from '@angular/core';

import { APP_CONFIG } from '../../../config/app.config';
import { MATCH_SCORE_PREFIX } from '../../../utilities/reg-ex';
import {
  MATCH_API_SCORE_COLLECTION_KEYS,
  MATCH_SCORE_CORRELATION_ID_KEYS,
  MATCH_SCORE_NAME_KEYS,
  MATCH_SCORE_NESTED_NUMERIC_KEYS,
  MATCH_SCORE_PRIMARY_VALUE_KEYS,
  MATCH_SCORE_RECOMMENDATION_TEXT_KEYS,
} from '../constants/match-response-keys.const';
import { MatchApiResponse } from '../models/match-api-response.model';
import { MatchScoreItem } from '../models/match-score-item.model';
import { ParsedMatchScoreItem } from '../models/parsed-match-score-item.model';
import {
  firstDefinedTrimmedString,
  firstDefinedValue,
} from '../utilities/first-defined-property.util';

@Injectable({ providedIn: 'root' })
export class MatchGroqResponseParser {
  private get config() {
    return APP_CONFIG.MATCH;
  }

  public parseScores(response: MatchApiResponse): ParsedMatchScoreItem[] {
    return this._getRawScores(response)
      .map((item, index) => this._toParsedScoreItem(item, index))
      .filter((item): item is ParsedMatchScoreItem => item !== null);
  }

  private _getRawScores(response: MatchApiResponse): MatchScoreItem[] {
    const list = firstDefinedValue(response, MATCH_API_SCORE_COLLECTION_KEYS);
    if (list === undefined) {
      return [];
    }
    return Array.isArray(list) ? list : [];
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

  private _sanitizeRecommendationText(text: string): string {
    return text.replace(MATCH_SCORE_PREFIX, '').trim();
  }

  private _primaryRecommendationPlainText(item: MatchScoreItem): string {
    return (
      firstDefinedTrimmedString(item, MATCH_SCORE_RECOMMENDATION_TEXT_KEYS) ??
      ''
    );
  }

  private _extractId(item: MatchScoreItem): string | null {
    return (
      firstDefinedTrimmedString(item, MATCH_SCORE_CORRELATION_ID_KEYS) ?? null
    );
  }

  private _extractName(item: MatchScoreItem): string | undefined {
    return firstDefinedTrimmedString(item, MATCH_SCORE_NAME_KEYS);
  }

  private _normalizeName(value: string | undefined): string {
    return (value ?? '').trim().toLowerCase();
  }

  private _parseScore(
    item: Omit<MatchScoreItem, 'id'> & { id?: string | number | null }
  ): number {
    const raw =
      firstDefinedValue(item, MATCH_SCORE_PRIMARY_VALUE_KEYS) ??
      this.config.SCORE.MIN;
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
      const numeric = text.replace(',', '.').replaceAll(/[^\d.-]/g, '');
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
}
