import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';

import { APP_CONFIG } from '../../../config/app.config';
import { Languages } from '../../../enums/language.enum';
import { LruMapCache } from '../../../utilities/lru-map-cache.util';
import { OpenMeteoGeocodeResponse } from '../models/open-meteo-geocode-response.model';

@Injectable({ providedIn: 'root' })
export class CitySearchService {
  private readonly _cache = new LruMapCache<readonly string[]>(
    APP_CONFIG.APPLICANTS.LOCATION_GEOCODE_CACHE_MAX_ENTRIES
  );

  public constructor(private readonly _http: HttpClient) {}

  /**
   * Returns distinct "City, Country" labels for autocomplete. Empty when the query is too short or the request fails.
   * Callers must gate on geocoding consent.
   */
  public searchCityLabels(
    query: string,
    language: Languages
  ): Observable<string[]> {
    const name = query.trim();
    if (name.length < APP_CONFIG.APPLICANTS.LOCATION_GEOCODE_MIN_QUERY_LENGTH) {
      return of([]);
    }

    const cacheKey = this._cacheKey(name, language);
    const cached = this._cache.get(cacheKey);
    if (cached) {
      return of([...cached]);
    }

    const applicants = APP_CONFIG.APPLICANTS;
    const queryKeys = applicants.LOCATION_GEOCODE_QUERY;
    const params = new HttpParams()
      .set(queryKeys.NAME, name)
      .set(queryKeys.COUNT, String(applicants.LOCATION_GEOCODE_RESULT_COUNT))
      .set(queryKeys.LANGUAGE, language)
      .set(queryKeys.FORMAT, applicants.LOCATION_GEOCODE_FORMAT);

    return this._http
      .get<OpenMeteoGeocodeResponse>(applicants.LOCATION_GEOCODE_SEARCH_URL, {
        params,
      })
      .pipe(
        map((res) => this._labelsFromResponse(res)),
        tap((labels) => this._cache.set(cacheKey, labels)),
        catchError(() => of([]))
      );
  }

  private _labelsFromResponse(res: OpenMeteoGeocodeResponse): string[] {
    const rows = res.results ?? [];
    const labels: string[] = [];
    for (const row of rows) {
      const country = (row.country ?? row.country_code ?? '').trim();
      const label = country ? `${row.name}, ${country}` : row.name;
      labels.push(label);
    }
    return [...new Set(labels)];
  }

  private _cacheKey(name: string, language: Languages): string {
    return `${language}:${name.toLowerCase()}`;
  }
}
