import { HttpErrorResponse } from '@angular/common/http';
import { DataServiceError } from '@ngrx/data';
import { TimeoutError } from 'rxjs';

import { APP_CONFIG } from '../config/app.config';
import { ApiProblemDetailPropertyKey } from '../enums/api-problem-detail-property-key.enum';
import { ApiErrorCode } from '../enums/api-error-code.enum';
import { HttpStatusCode } from '../enums/http-status-code.enum';
import type { HttpApiErrorMessages } from '../models/http-api-error-messages.model';
import { HttpApiError } from '../models/http-api-error.model';

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
      const problem = payload as Partial<
        Record<ApiProblemDetailPropertyKey, unknown>
      >;
      const errText = problem[ApiProblemDetailPropertyKey.Error];
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

export function extractHttpApiErrorCode(error: unknown): ApiErrorCode | null {
  if (!(error instanceof HttpErrorResponse)) {
    return null;
  }
  const payload: unknown = error.error;
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const code = (
    payload as Partial<Record<ApiProblemDetailPropertyKey, unknown>>
  )[ApiProblemDetailPropertyKey.Code];
  if (typeof code !== 'string') {
    return null;
  }
  return (Object.values(ApiErrorCode) as string[]).includes(code)
    ? (code as ApiErrorCode)
    : null;
}

function isRxjsTimeoutError(error: unknown): boolean {
  return (
    error instanceof TimeoutError ||
    (error instanceof Error &&
      error.name === APP_CONFIG.HTTP.RXJS_TIMEOUT_ERROR_NAME)
  );
}
