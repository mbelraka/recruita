import { HttpErrorResponse } from '@angular/common/http';
import { DataServiceError } from '@ngrx/data';
import { TimeoutError } from 'rxjs';

import { ApiProblemDetailPropertyKey } from '../enums/api-problem-detail-property-key.enum';
import { HttpStatusCode } from '../enums/http-status-code.enum';
import type { HttpApiErrorMessages } from '../models/http-api-error-messages.model';
import { HttpApiError } from '../models/http-api-error.model';

export type { HttpApiErrorMessages } from '../models/http-api-error-messages.model';

/** Connection-class failures worth retrying: the backend may simply not be up yet. */
const TRANSIENT_HTTP_STATUSES = new Set<number>([
  HttpApiError.NO_RESPONSE_STATUS,
  HttpStatusCode.BadGateway,
  HttpStatusCode.ServiceUnavailable,
  HttpStatusCode.GatewayTimeout,
]);

export function toHttpApiServiceError(
  error: unknown,
  messages: HttpApiErrorMessages
): HttpApiError {
  if (isRxjsTimeoutError(error)) {
    return new HttpApiError(
      messages.requestTimeout,
      HttpApiError.NO_RESPONSE_STATUS
    );
  }
  const message = extractHttpApiErrorMessage(error, messages.notAvailable);
  const status =
    error instanceof HttpErrorResponse
      ? error.status
      : HttpApiError.NO_RESPONSE_STATUS;
  return new HttpApiError(message ?? messages.unreachable, status);
}

/**
 * Narrows an effect-level error to `HttpApiError`, unwrapping the
 * `DataServiceError` that NgRx Data adds around data-service failures.
 */
export function asHttpApiError(error: unknown): HttpApiError | null {
  if (error instanceof HttpApiError) {
    return error;
  }
  if (
    error instanceof DataServiceError &&
    error.error instanceof HttpApiError
  ) {
    return error.error;
  }
  return null;
}

/** True for connection-class failures (no response, 502/503/504) — safe to retry. */
export function isTransientHttpApiError(error: unknown): boolean {
  const apiError = asHttpApiError(error);
  return apiError !== null && TRANSIENT_HTTP_STATUSES.has(apiError.status);
}

export function hasHttpApiErrorStatus(
  error: unknown,
  status: HttpStatusCode
): boolean {
  const expectedStatus: number = status;
  return asHttpApiError(error)?.status === expectedStatus;
}

export function extractHttpApiErrorMessage(
  error: unknown,
  notAvailableMessage: string
): string | null {
  if (error instanceof HttpErrorResponse) {
    const notFoundStatus: number = HttpStatusCode.NotFound;
    if (error.status === notFoundStatus) {
      return notAvailableMessage;
    }
    const payload: unknown = error.error;
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

function isRxjsTimeoutError(error: unknown): boolean {
  return (
    error instanceof TimeoutError ||
    (error instanceof Error && error.name === 'TimeoutError')
  );
}
