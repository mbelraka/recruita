import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { firstValueFrom, of, ReplaySubject, throwError } from 'rxjs';

import { APP_CONFIG } from '../../../config/app.config';
import { StateFeatures } from '../../../containers/root/enums/state-features.enum';
import { PrivacyConsentDialogService } from '../../../containers/root/privacy/privacy-consent-dialog.service';
import { Languages } from '../../../enums/language.enum';
import { setLanguage } from '../../../state/app.actions';
import { initialMainState } from './main.reducer';
import { PrivacyConsentService } from '../../../services/privacy-consent.service';
import { ProfileApiService } from '../../../services/profile-api.service';
import {
  loadProfile,
  loadProfileFailure,
  loadProfileSuccess,
  persistPrivacyConsentOutcome,
  persistPrivacyConsentOutcomeFailure,
  persistPrivacyConsentOutcomeSuccess,
  profileUpdated,
} from './profile.actions';
import { MainEffects } from './main.effects';

describe('MainEffects', () => {
  let actions$: ReplaySubject<unknown>;
  let effects: MainEffects;
  let api: jasmine.SpyObj<ProfileApiService>;
  let privacy: PrivacyConsentService;
  let store: MockStore;

  const profile = {
    id: APP_CONFIG.PROFILE.DEFAULT_ID,
    privacyNoticeAccepted: false,
    lastLanguage: Languages.English,
    optionalRemoteTranslation: false,
    optionalGeocoding: false,
    optionalAiMatching: false,
  };

  const mockAppState = { language: Languages.English, notification: null };

  const mockStoreState = (
    mainState: typeof initialMainState = initialMainState
  ) => ({
    app: mockAppState,
    [StateFeatures.Main]: mainState,
  });

  beforeEach(() => {
    actions$ = new ReplaySubject(1);
    api = jasmine.createSpyObj<ProfileApiService>('ProfileApiService', [
      'getById',
      'save',
    ]);

    TestBed.configureTestingModule({
      providers: [
        MainEffects,
        PrivacyConsentService,
        provideMockActions(() => actions$),
        provideMockStore({
          initialState: mockStoreState(),
        }),
        {
          provide: ProfileApiService,
          useValue: api,
        },
        {
          provide: PrivacyConsentDialogService,
          useValue: jasmine.createSpyObj<PrivacyConsentDialogService>(
            'PrivacyConsentDialogService',
            ['openConsentDialogIfRequired']
          ),
        },
      ],
    });

    effects = TestBed.inject(MainEffects);
    privacy = TestBed.inject(PrivacyConsentService);
    store = TestBed.inject(MockStore);
  });

  it('loads the admin profile and restores language', () => {
    api.getById.and.returnValue(of(profile));
    const emitted: unknown[] = [];
    const subscription = effects.loadProfile$.subscribe((action) =>
      emitted.push(action)
    );

    actions$.next(loadProfile());

    expect(emitted).toEqual([
      loadProfileSuccess({ profile }),
      setLanguage({ language: Languages.English }),
    ]);
    subscription.unsubscribe();
  });

  it('restores the stored language from profile on load', () => {
    const germanProfile = { ...profile, lastLanguage: Languages.German };
    api.getById.and.returnValue(of(germanProfile));
    const emitted: unknown[] = [];
    const subscription = effects.loadProfile$.subscribe((action) =>
      emitted.push(action)
    );

    actions$.next(loadProfile());

    expect(emitted[1]).toEqual(setLanguage({ language: Languages.German }));
    subscription.unsubscribe();
  });

  it('dispatches loadProfileFailure when the API fails', () => {
    api.getById.and.returnValue(throwError(() => new Error('offline')));
    const emitted: unknown[] = [];
    const subscription = effects.loadProfile$.subscribe((action) =>
      emitted.push(action)
    );

    actions$.next(loadProfile());

    expect(emitted[0]).toEqual(
      jasmine.objectContaining({ type: loadProfileFailure.type })
    );
    subscription.unsubscribe();
  });

  it('hydrates privacy choices from an accepted profile', () => {
    const subscription = effects.hydratePrivacyFromProfile$.subscribe();

    actions$.next(
      loadProfileSuccess({
        profile: {
          ...profile,
          privacyNoticeAccepted: true,
          optionalRemoteTranslation: true,
          optionalGeocoding: false,
          optionalAiMatching: true,
        },
      })
    );

    expect(privacy.optionalRemoteTranslation()).toBeTrue();
    expect(privacy.optionalGeocoding()).toBeFalse();
    expect(privacy.optionalAiMatching()).toBeTrue();
    expect(privacy.isConsentCompleteAndCurrent()).toBeTrue();
    subscription.unsubscribe();
  });

  it('does not hydrate privacy when the profile has not accepted the notice', () => {
    const subscription = effects.hydratePrivacyFromProfile$.subscribe();

    actions$.next(loadProfileSuccess({ profile }));

    expect(privacy.isConsentCompleteAndCurrent()).toBeFalse();
    subscription.unsubscribe();
  });

  it('persists privacy consent by creating the admin profile', async () => {
    api.save.and.returnValue(of({ ...profile, privacyNoticeAccepted: true }));
    actions$.next(
      persistPrivacyConsentOutcome({ result: { mode: 'necessary' } })
    );

    const action = await firstValueFrom(effects.persistPrivacyConsentOutcome$);
    expect(api.save).toHaveBeenCalledWith(
      {
        id: APP_CONFIG.PROFILE.DEFAULT_ID,
        privacyNoticeAccepted: true,
        lastLanguage: Languages.English,
        optionalRemoteTranslation: false,
        optionalGeocoding: false,
        optionalAiMatching: false,
      },
      null
    );
    expect(action).toEqual(
      persistPrivacyConsentOutcomeSuccess({
        profile: { ...profile, privacyNoticeAccepted: true },
      })
    );
    expect(privacy.isConsentCompleteAndCurrent()).toBeTrue();
  });

  it('updates the admin profile when it is already in state', async () => {
    store.setState(
      mockStoreState({
        ...initialMainState,
        profile: {
          ...initialMainState.profile,
          profile,
        },
      })
    );
    api.save.and.returnValue(
      of({
        ...profile,
        privacyNoticeAccepted: true,
        optionalRemoteTranslation: true,
        optionalGeocoding: true,
        optionalAiMatching: true,
      })
    );
    actions$.next(persistPrivacyConsentOutcome({ result: { mode: 'all' } }));

    const action = await firstValueFrom(effects.persistPrivacyConsentOutcome$);
    expect(api.save).toHaveBeenCalledWith(
      {
        id: APP_CONFIG.PROFILE.DEFAULT_ID,
        privacyNoticeAccepted: true,
        lastLanguage: Languages.English,
        optionalRemoteTranslation: true,
        optionalGeocoding: true,
        optionalAiMatching: true,
      },
      profile
    );
    expect(action.type).toBe(persistPrivacyConsentOutcomeSuccess.type);
    expect(privacy.optionalAiMatching()).toBeTrue();
  });

  it('still commits consent when the API save fails', async () => {
    api.save.and.returnValue(throwError(() => new Error('offline')));
    actions$.next(
      persistPrivacyConsentOutcome({ result: { mode: 'necessary' } })
    );

    const action = await firstValueFrom(effects.persistPrivacyConsentOutcome$);
    expect(action.type).toBe(persistPrivacyConsentOutcomeFailure.type);
    expect(privacy.isConsentCompleteAndCurrent()).toBeTrue();
  });

  it('persists language changes to the profile', async () => {
    store.setState(
      mockStoreState({
        ...initialMainState,
        profile: {
          ...initialMainState.profile,
          profile,
          loaded: true,
        },
      })
    );
    api.save.and.returnValue(
      of({ ...profile, lastLanguage: Languages.German })
    );
    actions$.next(setLanguage({ language: Languages.German }));

    const action = await firstValueFrom(effects.persistLastLanguage$);
    expect(api.save).toHaveBeenCalledWith(
      {
        id: APP_CONFIG.PROFILE.DEFAULT_ID,
        privacyNoticeAccepted: false,
        lastLanguage: Languages.German,
        optionalRemoteTranslation: false,
        optionalGeocoding: false,
        optionalAiMatching: false,
      },
      profile
    );
    expect(action).toEqual(
      profileUpdated({
        profile: { ...profile, lastLanguage: Languages.German },
      })
    );
  });

  it('skips profile save when language already matches profile', () => {
    store.setState(
      mockStoreState({
        ...initialMainState,
        profile: {
          ...initialMainState.profile,
          profile,
          loaded: true,
        },
      })
    );
    const subscription = effects.persistLastLanguage$.subscribe();

    actions$.next(setLanguage({ language: Languages.English }));

    expect(api.save).not.toHaveBeenCalled();
    subscription.unsubscribe();
  });
});
