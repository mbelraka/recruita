import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Languages } from '../../../enums/language.enum';
import { SmartActionService } from '../../../generated/api-client/services/smart-action.service';
import { ParseActionResponse } from '../models/parse-action-response.model';

@Injectable({ providedIn: 'root' })
export class ActionParseApiService {
  public constructor(private readonly _smartActionApi: SmartActionService) {}

  public parseCommand(
    command: string,
    language: Languages
  ): Observable<ParseActionResponse> {
    return this._smartActionApi.parse({ body: { command, language } });
  }
}
