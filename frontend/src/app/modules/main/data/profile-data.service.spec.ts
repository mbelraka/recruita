import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpUrlGenerator } from '@ngrx/data';

import { APP_CONFIG } from '../../../config/app.config';
import { HttpApiInterceptor } from '../../../core/http/http-api.interceptor';
import { Languages } from '../../../enums/language.enum';
import { ProfileDataService } from './profile-data.service';
import type { Profile } from '../models/profile.model';

const profileHttpUrlGenerator: HttpUrlGenerator = {
  entityResource: () => `${APP_CONFIG.PROFILE.API.BASE_PATH}/`,
  collectionResource: () => APP_CONFIG.PROFILE.API.BASE_PATH,
  registerHttpResourceUrls: () => undefined,
};

describe('ProfileDataService', () => {
  let service: ProfileDataService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProfileDataService,
        { provide: HttpUrlGenerator, useValue: profileHttpUrlGenerator },
        provideHttpClient(withInterceptorsFromDi()),
        {
          provide: HTTP_INTERCEPTORS,
          useClass: HttpApiInterceptor,
          multi: true,
        },
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ProfileDataService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('getById maps profile payload', (done) => {
    service.getById('p-1').subscribe((profile: Profile) => {
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

  it('createProfile posts privacy acceptance, language, and consent options', (done) => {
    service
      .createProfile({
        id: 'p-1',
        privacyNoticeAccepted: true,
        lastLanguage: Languages.German,
        optionalRemoteTranslation: true,
        optionalGeocoding: true,
        optionalAiMatching: false,
      })
      .subscribe((profile: Profile) => {
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

  it('updateProfile updates an existing profile row', (done) => {
    const request = {
      id: APP_CONFIG.PROFILE.DEFAULT_ID,
      privacyNoticeAccepted: false,
      lastLanguage: Languages.French,
      optionalRemoteTranslation: false,
      optionalGeocoding: false,
      optionalAiMatching: false,
    };

    service
      .updateProfile(APP_CONFIG.PROFILE.DEFAULT_ID, request)
      .subscribe((profile: Profile) => {
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
