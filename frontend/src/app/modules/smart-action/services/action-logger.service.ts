import { Injectable } from '@angular/core';

import { APP_CONFIG } from '../../../config/app.config';
import { environment } from '../../../../environments/environment';
import { ActionLogEntry } from '../models/action-log-entry.model';
import { ActionResult } from '../models/action-result.interface';
import { ParsedAction } from '../models/parsed-action.type';

@Injectable({ providedIn: 'root' })
export class ActionLoggerService {
  private readonly _entries: ActionLogEntry[] = [];
  private readonly _maxEntries =
    APP_CONFIG.SMART_ACTION.VALIDATION.MAX_LOG_ENTRIES;
  private readonly _sessionStorageKey =
    APP_CONFIG.SMART_ACTION.LOGGING.SESSION_ID_STORAGE_KEY;

  public logAction(
    action: ParsedAction,
    result: ActionResult,
    durationMs: number
  ): void {
    const entry: ActionLogEntry = {
      timestamp: new Date(),
      actionType: action.type,
      success: result.success,
      durationMs,
      sessionId: this._sessionId(),
    };
    this._entries.unshift(entry);
    if (this._entries.length > this._maxEntries) {
      this._entries.pop();
    }
    if (!environment.production) {
      console.debug('[ActionLogger]', entry);
    }
  }

  public getRecentLogs(
    limit = APP_CONFIG.SMART_ACTION.LOGGING.RECENT_LOGS_DEFAULT_LIMIT
  ): readonly ActionLogEntry[] {
    return this._entries.slice(0, limit);
  }

  private _sessionId(): string {
    const existing = localStorage.getItem(this._sessionStorageKey);
    if (existing) {
      return existing;
    }
    const created = crypto.randomUUID();
    localStorage.setItem(this._sessionStorageKey, created);
    return created;
  }
}
