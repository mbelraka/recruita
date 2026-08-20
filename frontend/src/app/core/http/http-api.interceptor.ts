import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { catchError, Observable, throwError, timeout } from 'rxjs';

import { APP_CONFIG } from '../../config/app.config';
import { HttpStatusCode } from '../../enums/http-status-code.enum';
import { ApplicantApiErrorMessage } from '../../modules/applicants/enums/applicant-api-error-message.enum';
import { ProfileApiErrorMessage } from '../../modules/main/enums/profile-api-error-message.enum';
import { MatchErrorMessage } from '../../modules/match/enums/match-error-message.enum';
import { SmartActionApiErrorMessage } from '../../modules/smart-action/enums/smart-action-api-error-message.enum';
import type { HttpApiPolicy } from '../../models/http-api-policy.model';
import { toHttpApiServiceError } from '../../utilities/http-api-error.util';

@Injectable()
export class HttpApiInterceptor implements HttpInterceptor {
  public intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const policy = resolveHttpApiPolicy(req.url);
    if (!policy) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      timeout({ first: policy.timeoutMs }),
      catchError((error: unknown) => {
        const notModifiedStatus: number = HttpStatusCode.NotModified;
        if (
          error instanceof HttpErrorResponse &&
          error.status === notModifiedStatus
        ) {
          return throwError(() => error);
        }
        return throwError(() => toHttpApiServiceError(error, policy.messages));
      })
    );
  }
}

function resolveHttpApiPolicy(url: string): HttpApiPolicy | null {
  if (url.startsWith(APP_CONFIG.APPLICANTS.API.BASE_PATH)) {
    return {
      timeoutMs: APP_CONFIG.APPLICANTS.API.REQUEST_TIMEOUT_MS,
      messages: {
        requestTimeout: ApplicantApiErrorMessage.RequestTimeout,
        notAvailable: ApplicantApiErrorMessage.NotAvailable,
        unreachable: ApplicantApiErrorMessage.Unreachable,
      },
    };
  }

  if (url.startsWith(APP_CONFIG.PROFILE.API.BASE_PATH)) {
    return {
      timeoutMs: APP_CONFIG.PROFILE.API.REQUEST_TIMEOUT_MS,
      messages: {
        requestTimeout: ProfileApiErrorMessage.RequestTimeout,
        notAvailable: ProfileApiErrorMessage.NotAvailable,
        unreachable: ProfileApiErrorMessage.Unreachable,
      },
    };
  }

  if (url.startsWith(APP_CONFIG.MATCH.GROQ.MATCH_ENDPOINT)) {
    return {
      timeoutMs: APP_CONFIG.MATCH.REQUEST_TIMEOUT_MS,
      messages: {
        requestTimeout: MatchErrorMessage.GroqRequestTimeout,
        notAvailable: MatchErrorMessage.GroqProxyUnreachable,
        unreachable: MatchErrorMessage.GroqProxyUnreachable,
      },
    };
  }

  if (url.startsWith(APP_CONFIG.SMART_ACTION.API.PARSE_PATH)) {
    return {
      timeoutMs: APP_CONFIG.SMART_ACTION.API.REQUEST_TIMEOUT_MS,
      messages: {
        requestTimeout: SmartActionApiErrorMessage.RequestTimeout,
        notAvailable: SmartActionApiErrorMessage.NotAvailable,
        unreachable: SmartActionApiErrorMessage.Unreachable,
      },
    };
  }

  return null;
}
