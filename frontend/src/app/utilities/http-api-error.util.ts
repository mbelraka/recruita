import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';

import { ApiProblemDetailPropertyKey } from '../enums/api-problem-detail-property-key.enum';
import { HttpStatusCode } from '../enums/http-status-code.enum';
import type { HttpApiErrorMessages } from '../models/http-api-error-messages.model';

export type { HttpApiErrorMessages } from '../models/http-api-error-messages.model';

export function toHttpApiServiceError(
  error: unknown,
  messages: HttpApiErrorMessages
): Error {
  if (error instanceof TimeoutError) {
    return new Error(messages.requestTimeout);
  }
  const message = extractHttpApiErrorMessage(error, messages.notAvailable);
  return new Error(message ?? messages.unreachable);
}

export function extractHttpApiErrorMessage(
  error: unknown,
  notAvailableMessage: string
): string | null {
  if (error instanceof HttpErrorResponse) {
    if (error.status === HttpStatusCode.NotFound) {
      return notAvailableMessage;
    }
    const payload = error.error;
    if (typeof payload === 'string' && payload.trim()) {
      return payload.trim();
    }
    if (payload && typeof payload === 'object') {
      const errText = (
        payload as Partial<Record<ApiProblemDetailPropertyKey, unknown>>
      )[ApiProblemDetailPropertyKey.Error];
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
