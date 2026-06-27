import { HttpErrorResponse } from '@angular/common/http';
import { DataServiceError } from '@ngrx/data';

import { ApiProblemDetailPropertyKey } from '../enums/api-problem-detail-property-key.enum';
import { HttpStatusCode } from '../enums/http-status-code.enum';
import { HttpApiError } from '../models/http-api-error.model';
import {
  asHttpApiError,
  extractHttpApiErrorMessage,
  hasHttpApiErrorStatus,
  isTransientHttpApiError,
  toHttpApiServiceError,
} from './http-api-error.util';

const messages = {
  requestTimeout: 'Timed out',
  notAvailable: 'Not available',
  unreachable: 'Unreachable',
} as const;

describe('http-api-error.util', () => {
  it('maps timeout errors to a no-response HttpApiError', () => {
    const error = toHttpApiServiceError(
      Object.assign(new Error('Timed out'), { name: 'TimeoutError' }),
      messages
    );
    expect(error).toBeInstanceOf(HttpApiError);
    expect(error.message).toBe('Timed out');
    expect(error.status).toBe(HttpApiError.NO_RESPONSE_STATUS);
  });

  it('preserves the HTTP status of failed responses', () => {
    const error = toHttpApiServiceError(
      new HttpErrorResponse({
        status: HttpStatusCode.ServiceUnavailable,
        error: { [ApiProblemDetailPropertyKey.Error]: 'Booting' },
      }),
      messages
    );
    expect(error.status).toBe(HttpStatusCode.ServiceUnavailable);
    expect(error.message).toBe('Booting');
  });

  it('maps 404 responses to the not-available message', () => {
    const message = extractHttpApiErrorMessage(
      new HttpErrorResponse({
        status: HttpStatusCode.NotFound,
        error: { [ApiProblemDetailPropertyKey.Error]: 'Missing' },
      }),
      messages.notAvailable
    );
    expect(message).toBe('Not available');
  });

  it('maps string and object error payloads', () => {
    expect(
      extractHttpApiErrorMessage(
        new HttpErrorResponse({
          status: HttpStatusCode.InternalServerError,
          error: 'plain failure',
        }),
        messages.notAvailable
      )
    ).toBe('plain failure');
    expect(
      extractHttpApiErrorMessage(
        new HttpErrorResponse({
          status: HttpStatusCode.InternalServerError,
          error: { [ApiProblemDetailPropertyKey.Error]: 'Problem detail' },
        }),
        messages.notAvailable
      )
    ).toBe('Problem detail');
  });

  it('falls back to unreachable when no detail exists', () => {
    const error = toHttpApiServiceError(
      new HttpErrorResponse({
        status: HttpStatusCode.InternalServerError,
        error: null,
      }),
      messages
    );
    expect(error.message).toBe('Unreachable');
    expect(error.status).toBe(HttpStatusCode.InternalServerError);
  });

  it('reuses Error messages when present', () => {
    expect(
      extractHttpApiErrorMessage(new Error('native'), messages.notAvailable)
    ).toBe('native');
  });

  it('ignores blank structured error payloads', () => {
    expect(
      extractHttpApiErrorMessage(
        new HttpErrorResponse({
          status: HttpStatusCode.InternalServerError,
          error: { [ApiProblemDetailPropertyKey.Error]: '   ' },
        }),
        messages.notAvailable
      )
    ).toBeNull();
    expect(
      extractHttpApiErrorMessage(
        new HttpErrorResponse({
          status: HttpStatusCode.InternalServerError,
          error: { detail: 'ignored' },
        }),
        messages.notAvailable
      )
    ).toBeNull();
  });

  describe('asHttpApiError', () => {
    it('unwraps the DataServiceError added by NgRx Data', () => {
      const apiError = new HttpApiError('down', HttpStatusCode.BadGateway);
      expect(asHttpApiError(new DataServiceError(apiError, null))).toBe(
        apiError
      );
    });

    it('returns null for unrelated errors', () => {
      expect(asHttpApiError(new Error('plain'))).toBeNull();
      expect(
        asHttpApiError(new DataServiceError(new Error('x'), null))
      ).toBeNull();
    });
  });

  describe('isTransientHttpApiError', () => {
    it('treats no-response and gateway statuses as transient', () => {
      expect(
        isTransientHttpApiError(
          new HttpApiError('offline', HttpApiError.NO_RESPONSE_STATUS)
        )
      ).toBeTrue();
      expect(
        isTransientHttpApiError(
          new DataServiceError(
            new HttpApiError('booting', HttpStatusCode.ServiceUnavailable),
            null
          )
        )
      ).toBeTrue();
    });

    it('treats definitive responses and plain errors as non-transient', () => {
      expect(
        isTransientHttpApiError(
          new HttpApiError('missing', HttpStatusCode.NotFound)
        )
      ).toBeFalse();
      expect(isTransientHttpApiError(new Error('offline'))).toBeFalse();
    });
  });

  describe('hasHttpApiErrorStatus', () => {
    it('matches the status through the DataServiceError wrapper', () => {
      const wrapped = new DataServiceError(
        new HttpApiError('missing', HttpStatusCode.NotFound),
        null
      );
      expect(
        hasHttpApiErrorStatus(wrapped, HttpStatusCode.NotFound)
      ).toBeTrue();
      expect(
        hasHttpApiErrorStatus(wrapped, HttpStatusCode.Conflict)
      ).toBeFalse();
      expect(
        hasHttpApiErrorStatus(new Error('missing'), HttpStatusCode.NotFound)
      ).toBeFalse();
    });
  });
});
