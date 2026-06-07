import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, timeout } from 'rxjs';

import { APP_CONFIG } from '../../../config/app.config';
import { ParseActionResponse } from '../models/parse-action-response.model';

@Injectable({ providedIn: 'root' })
export class ActionParseApiService {
  private readonly _api = APP_CONFIG.SMART_ACTION.API;

  public constructor(private readonly _http: HttpClient) {}

  public parseCommand(command: string): Observable<ParseActionResponse> {
    return this._http
      .post<ParseActionResponse>(
        this._api.PARSE_PATH,
        { command },
        { withCredentials: true }
      )
      .pipe(timeout({ first: this._api.REQUEST_TIMEOUT_MS }));
  }
}
