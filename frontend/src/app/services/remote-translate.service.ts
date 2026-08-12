import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  catchError,
  finalize,
  map,
  Observable,
  of,
  shareReplay,
  tap,
  timeout,
} from 'rxjs';

import { APP_CONFIG } from '../config/app.config';
import { Languages } from '../enums/language.enum';
import { MyMemoryResponse } from '../models/mymemory-translate-response.model';
import {
  buildRemoteTranslationCacheKey,
  buildRemoteTranslationLangPair,
} from '../utilities/remote-translate-cache.util';

/**
 * MyMemory’s public `get` API for short strings. Results are cached in memory;
 * parallel identical requests are deduplicated. Callers must gate on consent.
 */
@Injectable({ providedIn: 'root' })
export class RemoteTranslateService {
  private readonly _cache = new Map<string, string>();
  private readonly _inFlight = new Map<string, Observable<string>>();

  public constructor(private readonly _http: HttpClient) {}

  public lookupKey(
    text: string | null | undefined,
    from: Languages,
    to: Languages
  ): string | null {
    const raw = this._normalizeText(text);
    if (raw === null) {
      return null;
    }
    return buildRemoteTranslationCacheKey(from, to, raw);
  }

  public getCached(
    text: string | null | undefined,
    from: Languages,
    to: Languages
  ): string | undefined {
    const raw = this._normalizeText(text);
    if (raw === null) {
      return undefined;
    }
    if (from === to) {
      return raw;
    }
    return this._cache.get(buildRemoteTranslationCacheKey(from, to, raw));
  }

  public translate(
    text: string | null | undefined,
    from: Languages,
    to: Languages
  ): Observable<string> {
    const raw = this._normalizeText(text);
    if (raw === null) {
      return of('');
    }
    if (from === to) {
      return of(raw);
    }

    const key = buildRemoteTranslationCacheKey(from, to, raw);
    const fromCache = this._cache.get(key);
    if (fromCache !== undefined) {
      return of(fromCache);
    }

    const inFlight = this._inFlight.get(key);
    if (inFlight) {
      return inFlight;
    }

    const request$ = this._requestTranslation$(raw, from, to, key);
    this._inFlight.set(key, request$);
    return request$;
  }

  private _requestTranslation$(
    raw: string,
    from: Languages,
    to: Languages,
    cacheKey: string
  ): Observable<string> {
    const {
      MYMEMORY_URL,
      REQUEST_TIMEOUT_MS,
      QUERY_PARAM_TEXT,
      QUERY_PARAM_LANGPAIR,
      IN_FLIGHT_SHARE_REPLAY_BUFFER_SIZE,
    } = APP_CONFIG.TRANSLATION;
    const params = new HttpParams()
      .set(QUERY_PARAM_TEXT, raw)
      .set(QUERY_PARAM_LANGPAIR, buildRemoteTranslationLangPair(from, to));

    return this._http.get<MyMemoryResponse>(MYMEMORY_URL, { params }).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      map((res) => (res?.responseData?.translatedText?.trim() ?? '') || raw),
      tap((translated) => this._cache.set(cacheKey, translated)),
      catchError(() => of(raw)),
      finalize(() => {
        this._inFlight.delete(cacheKey);
      }),
      shareReplay({
        bufferSize: IN_FLIGHT_SHARE_REPLAY_BUFFER_SIZE,
        refCount: true,
      })
    );
  }

  private _normalizeText(text: string | null | undefined): string | null {
    const trimmed = text?.trim() ?? '';
    return trimmed || null;
  }
}
