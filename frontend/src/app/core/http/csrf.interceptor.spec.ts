import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { APP_CONFIG } from '../../config/app.config';
import { CsrfInterceptor } from './csrf.interceptor';

function clearCookie(documentRef: Document, name: string): void {
  documentRef.cookie = `${name}=; Max-Age=0; path=/`;
}

describe('CsrfInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let documentRef: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        {
          provide: HTTP_INTERCEPTORS,
          useClass: CsrfInterceptor,
          multi: true,
        },
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    documentRef = TestBed.inject(DOCUMENT);
    clearCookie(documentRef, APP_CONFIG.HTTP.XSRF_COOKIE_NAME);
  });

  afterEach(() => {
    httpMock.verify();
    clearCookie(documentRef, APP_CONFIG.HTTP.XSRF_COOKIE_NAME);
  });

  it('does not add a CSRF header for GET requests', () => {
    documentRef.cookie = `${APP_CONFIG.HTTP.XSRF_COOKIE_NAME}=token-value`;

    http.get('/api/health').subscribe();

    const req = httpMock.expectOne('/api/health');
    expect(req.request.headers.has(APP_CONFIG.HTTP.XSRF_HEADER_NAME)).toBe(
      false
    );
    req.flush({});
  });

  it('adds the CSRF header for mutating requests when the cookie exists', () => {
    documentRef.cookie = `${APP_CONFIG.HTTP.XSRF_COOKIE_NAME}=token-value`;

    http.post('/api/match', {}).subscribe();

    const req = httpMock.expectOne('/api/match');
    expect(req.request.headers.get(APP_CONFIG.HTTP.XSRF_HEADER_NAME)).toBe(
      'token-value'
    );
    req.flush({});
  });

  it('leaves mutating requests unchanged when the cookie is missing', () => {
    clearCookie(documentRef, APP_CONFIG.HTTP.XSRF_COOKIE_NAME);

    http.delete('/api/applicants/a-1').subscribe();

    const req = httpMock.expectOne('/api/applicants/a-1');
    expect(req.request.headers.has(APP_CONFIG.HTTP.XSRF_HEADER_NAME)).toBe(
      false
    );
    req.flush({});
  });
});
