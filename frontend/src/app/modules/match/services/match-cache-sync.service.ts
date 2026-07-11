import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { APP_CONFIG } from '../../../config/app.config';

/** Clears backend match evaluation cache entries after roster mutations. */
@Injectable({ providedIn: 'root' })
export class MatchCacheSyncService {
  public constructor(private readonly _http: HttpClient) {}

  public invalidateBackendMatchCache(): Observable<void> {
    return this._http.post<void>(
      APP_CONFIG.MATCH.API.CACHE_INVALIDATE_PATH,
      null
    );
  }
}
