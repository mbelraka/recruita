import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { APP_CONFIG } from '../config/app.config';
import { Languages } from '../enums/language.enum';
import { MyMemoryResponse } from '../models/mymemory-translate-response.model';
import { RemoteTranslateService } from './remote-translate.service';

describe('RemoteTranslateService', () => {
  const myMemoryUrl = APP_CONFIG.TRANSLATION.MYMEMORY_URL;
  const query = 'Software engineer';
  const from = Languages.English;
  const to = Languages.German;
  let service: RemoteTranslateService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RemoteTranslateService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should return empty for blank input', (done) => {
    service.translate('   ', from, to).subscribe((value) => {
      expect(value).toBe('');
      done();
    });
    http.expectNone((req) => req.url === myMemoryUrl);
  });

  it('should not call the network when from === to', (done) => {
    expect(service.lookupKey(query, from, from)).toBe(`en|en|${query}`);
    expect(service.getCached(query, from, from)).toBe(query);

    service.translate(query, from, from).subscribe((value) => {
      expect(value).toBe(query);
      done();
    });
    http.expectNone((req) => req.url === myMemoryUrl);
  });

  it('should fetch once, then read from cache with no second HTTP call', () => {
    expect(service.getCached(query, from, to)).toBeUndefined();

    let first: string | undefined;
    service.translate(query, from, to).subscribe((value) => {
      first = value;
    });

    const req = http.expectOne((r) => r.url === myMemoryUrl);
    expect(
      req.request.params.get(APP_CONFIG.TRANSLATION.QUERY_PARAM_TEXT)
    ).toBe(query);
    expect(
      req.request.params.get(APP_CONFIG.TRANSLATION.QUERY_PARAM_LANGPAIR)
    ).toBe('en|de');
    req.flush({
      responseData: { translatedText: ' Ingenieur ' },
    } as MyMemoryResponse);

    expect(first).toBe('Ingenieur');
    expect(service.getCached(query, from, to)).toBe('Ingenieur');

    let second: string | undefined;
    service.translate(query, from, to).subscribe((value) => {
      second = value;
    });
    expect(second).toBe('Ingenieur');
    http.expectNone((r) => r.url === myMemoryUrl);
  });

  it('should drop cached translations on clearCache', () => {
    service.translate(query, from, to).subscribe();
    http
      .expectOne((r) => r.url === myMemoryUrl)
      .flush({
        responseData: { translatedText: 'Ingenieur' },
      } as MyMemoryResponse);

    service.clearCache();
    expect(service.getCached(query, from, to)).toBeUndefined();
  });
});
