import { DOCUMENT } from '@angular/common';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { APP_CONFIG } from '../../config/app.config';
import { readCookieValue } from '../../utilities/cookie.util';

const CSRF_SAFE_METHODS = new Set<string>(APP_CONFIG.HTTP.CSRF_SAFE_METHODS);

/**
 * Attaches the Spring Security CSRF header for mutating API calls.
 * The token is issued as the `XSRF-TOKEN` cookie on safe requests.
 */
@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  private readonly _document = inject(DOCUMENT);

  public intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (CSRF_SAFE_METHODS.has(req.method)) {
      return next.handle(req);
    }

    const csrfToken = readCookieValue(
      this._document.cookie,
      APP_CONFIG.HTTP.XSRF_COOKIE_NAME
    );
    if (!csrfToken) {
      return next.handle(req);
    }

    return next.handle(
      req.clone({
        headers: req.headers.set(APP_CONFIG.HTTP.XSRF_HEADER_NAME, csrfToken),
      })
    );
  }
}
