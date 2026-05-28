import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { APP_CONFIG } from '../../../config/app.config';
import { Languages } from '../../../enums/language.enum';
import { PrivacyConsentService } from '../../../services/privacy-consent.service';
import { OpenMeteoGeocodeResponse } from '../models/open-meteo-geocode-response.model';

@Injectable({ providedIn: 'root' })
export class CitySearchService {
  public constructor(
    private readonly _http: HttpClient,
    private readonly _privacy: PrivacyConsentService
  ) {}

  /**
   * Returns distinct "City, Country" labels for autocomplete. Empty when the query is too short or the request fails.
   */
  public searchCityLabels(
    query: string,
    language: Languages
  ): Observable<string[]> {
    const name = query.trim();
    if (name.length < 2) {
      return of([]);
    }
    if (!this._privacy.optionalGeocoding()) {
      return of([]);
    }

    const applicants = APP_CONFIG.APPLICANTS;
    const params = new HttpParams()
      .set('name', name)
      .set('count', applicants.LOCATION_GEOCODE_RESULT_COUNT)
      .set('language', language)
      .set('format', applicants.LOCATION_GEOCODE_FORMAT);

    return this._http
      .get<OpenMeteoGeocodeResponse>(applicants.LOCATION_GEOCODE_SEARCH_URL, {
        params,
      })
      .pipe(
        map((res) => {
          const rows = res.results ?? [];
          const labels: string[] = [];
          for (const r of rows) {
            const country = (r.country ?? r.country_code ?? '').trim();
            const label = country ? `${r.name}, ${country}` : r.name;
            labels.push(label);
          }
          return [...new Set(labels)];
        }),
        catchError(() => of([]))
      );
  }
}
