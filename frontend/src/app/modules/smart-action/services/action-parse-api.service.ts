import { Injectable } from '@angular/core';
import { Observable, timeout } from 'rxjs';

import { APP_CONFIG } from '../../../config/app.config';
import { Languages } from '../../../enums/language.enum';
import { SmartActionService } from '../../../generated/api-client/services/smart-action.service';
import { ParseActionResponse } from '../models/parse-action-response.model';

@Injectable({ providedIn: 'root' })
export class ActionParseApiService {
  private readonly _api = APP_CONFIG.SMART_ACTION.API;

  public constructor(private readonly _smartActionApi: SmartActionService) {}

  public parseCommand(
    command: string,
    language: Languages
  ): Observable<ParseActionResponse> {
    return this._smartActionApi
      .parse({ body: { command, language } })
      .pipe(timeout({ first: this._api.REQUEST_TIMEOUT_MS }));
  }
}
