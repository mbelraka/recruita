import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';

import { ApiProblemDetailPropertyKey } from '../enums/api-problem-detail-property-key.enum';
import { HttpStatusCode } from '../enums/http-status-code.enum';
import {
  extractHttpApiErrorMessage,
  toHttpApiServiceError,
} from './http-api-error.util';

const messages = {
  requestTimeout: 'Timed out',
  notAvailable: 'Not available',
  unreachable: 'Unreachable',
} as const;

describe('http-api-error.util', () => {
  it('maps timeout errors', () => {
    const error = toHttpApiServiceError(new TimeoutError(), messages);
    expect(error.message).toBe('Timed out');
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
});
