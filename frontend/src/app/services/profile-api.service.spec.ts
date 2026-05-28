import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { APP_CONFIG } from '../config/app.config';
import { Languages } from '../enums/language.enum';
import { ProfileApiService } from './profile-api.service';

describe('ProfileApiService', () => {
  let service: ProfileApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProfileApiService],
    });
    service = TestBed.inject(ProfileApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('getById maps profile payload', (done) => {
    service.getById('p-1').subscribe((profile) => {
      expect(profile.id).toBe('p-1');
      expect(profile.privacyNoticeAccepted).toBeTrue();
      done();
    });

    const req = http.expectOne(`${APP_CONFIG.PROFILE.API.BASE_PATH}/p-1`);
    req.flush({
      id: 'p-1',
      privacyNoticeAccepted: true,
      lastLanguage: 'en',
      optionalRemoteTranslation: true,
      optionalGeocoding: false,
      optionalAiMatching: true,
    });
  });

  it('create posts privacy acceptance, language, and consent options', (done) => {
    service
      .create({
        id: 'p-1',
        privacyNoticeAccepted: true,
        lastLanguage: Languages.German,
        optionalRemoteTranslation: true,
        optionalGeocoding: true,
        optionalAiMatching: false,
      })
      .subscribe((profile) => {
        expect(profile.privacyNoticeAccepted).toBeTrue();
        expect(profile.lastLanguage).toBe(Languages.German);
        expect(profile.optionalRemoteTranslation).toBeTrue();
        expect(profile.optionalGeocoding).toBeTrue();
        expect(profile.optionalAiMatching).toBeFalse();
        done();
      });

    const req = http.expectOne(APP_CONFIG.PROFILE.API.BASE_PATH);
    expect(req.request.method).toBe('POST');
    req.flush({
      id: 'p-1',
      privacyNoticeAccepted: true,
      lastLanguage: 'de',
      optionalRemoteTranslation: true,
      optionalGeocoding: true,
      optionalAiMatching: false,
    });
  });

  it('save creates when no profile exists', (done) => {
    const request = {
      id: APP_CONFIG.PROFILE.DEFAULT_ID,
      privacyNoticeAccepted: true,
      lastLanguage: Languages.German,
      optionalRemoteTranslation: false,
      optionalGeocoding: false,
      optionalAiMatching: false,
    };

    service.save(request, null).subscribe((profile) => {
      expect(profile.id).toBe(APP_CONFIG.PROFILE.DEFAULT_ID);
      done();
    });

    const req = http.expectOne(APP_CONFIG.PROFILE.API.BASE_PATH);
    expect(req.request.method).toBe('POST');
    req.flush({ ...request, lastLanguage: 'de' });
  });

  it('save updates when the admin profile exists', (done) => {
    const existing = {
      id: APP_CONFIG.PROFILE.DEFAULT_ID,
      privacyNoticeAccepted: false,
      lastLanguage: Languages.English,
      optionalRemoteTranslation: false,
      optionalGeocoding: false,
      optionalAiMatching: false,
    };
    const request = {
      ...existing,
      lastLanguage: Languages.French,
    };

    service.save(request, existing).subscribe((profile) => {
      expect(profile.lastLanguage).toBe(Languages.French);
      done();
    });

    const req = http.expectOne(
      `${APP_CONFIG.PROFILE.API.BASE_PATH}/${APP_CONFIG.PROFILE.DEFAULT_ID}`
    );
    expect(req.request.method).toBe('PUT');
    req.flush({ ...request, lastLanguage: 'fr' });
  });
});
