import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  firstValueFrom,
  lastValueFrom,
  of,
  ReplaySubject,
  throwError,
  take,
  toArray,
} from 'rxjs';

import { PrivacyConsentDialogMode } from '../../../enums/privacy-consent-dialog-mode.enum';
import { APP_CONFIG } from '../../../config/app.config';
import { StateFeatures } from '../../../containers/root/enums/state-features.enum';
import { PrivacyConsentDialogService } from '../../../containers/root/privacy/privacy-consent-dialog.service';
import { Languages } from '../../../enums/language.enum';
import { setLanguage } from '../../../state/app.actions';
import { initialMainState } from './main.reducer';
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
  let privacyDialog: jasmine.SpyObj<PrivacyConsentDialogService>;
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
    privacyDialog = TestBed.inject(
      PrivacyConsentDialogService
    ) as jasmine.SpyObj<PrivacyConsentDialogService>;
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

  it('opens the privacy gate after profile load', () => {
    const subscription = effects.openPrivacyGateAfterProfileLoad$.subscribe();

    actions$.next(
      loadProfileSuccess({
        profile: {
          ...profile,
          privacyNoticeAccepted: true,
          optionalAiMatching: true,
        },
      })
    );

    expect(privacyDialog.openConsentDialogIfRequired).toHaveBeenCalled();
    subscription.unsubscribe();
  });

  it('opens the privacy gate after profile load failure', () => {
    const subscription = effects.openPrivacyGateAfterProfileLoad$.subscribe();

    actions$.next(loadProfileFailure({ error: 'offline' }));

    expect(privacyDialog.openConsentDialogIfRequired).toHaveBeenCalled();
    subscription.unsubscribe();
  });

  it('persists privacy consent by creating the admin profile', async () => {
    api.save.and.returnValue(of({ ...profile, privacyNoticeAccepted: true }));
    const emittedPromise = lastValueFrom(
      effects.persistPrivacyConsentOutcome$.pipe(take(2), toArray())
    );

    actions$.next(
      persistPrivacyConsentOutcome({
        result: { mode: PrivacyConsentDialogMode.Necessary },
      })
    );

    const emitted = await emittedPromise;
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
    expect(emitted[0]).toEqual(
      profileUpdated({
        profile: {
          id: APP_CONFIG.PROFILE.DEFAULT_ID,
          privacyNoticeAccepted: true,
          lastLanguage: Languages.English,
          optionalRemoteTranslation: false,
          optionalGeocoding: false,
          optionalAiMatching: false,
        },
      })
    );
    expect(emitted[1]).toEqual(
      persistPrivacyConsentOutcomeSuccess({
        profile: { ...profile, privacyNoticeAccepted: true },
      })
    );
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
    const emittedPromise = lastValueFrom(
      effects.persistPrivacyConsentOutcome$.pipe(take(2), toArray())
    );
    actions$.next(
      persistPrivacyConsentOutcome({
        result: { mode: PrivacyConsentDialogMode.All },
      })
    );

    const emitted = await emittedPromise;
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
    expect(emitted[1].type).toBe(persistPrivacyConsentOutcomeSuccess.type);
  });

  it('reloads profile when the privacy API save fails', async () => {
    api.save.and.returnValue(throwError(() => new Error('offline')));
    const emittedPromise = lastValueFrom(
      effects.persistPrivacyConsentOutcome$.pipe(take(3), toArray())
    );

    actions$.next(
      persistPrivacyConsentOutcome({
        result: { mode: PrivacyConsentDialogMode.Necessary },
      })
    );

    const emitted = await emittedPromise;
    expect(emitted[0].type).toBe(profileUpdated.type);
    expect(emitted[1].type).toBe(loadProfile.type);
    expect(emitted[2].type).toBe(persistPrivacyConsentOutcomeFailure.type);
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

  it('preserves stored privacy choices when persisting language', async () => {
    const acceptedProfile = {
      ...profile,
      privacyNoticeAccepted: true,
      optionalRemoteTranslation: true,
      optionalGeocoding: true,
      optionalAiMatching: true,
    };
    store.setState(
      mockStoreState({
        ...initialMainState,
        profile: {
          ...initialMainState.profile,
          profile: acceptedProfile,
          loaded: true,
        },
      })
    );
    api.save.and.returnValue(
      of({ ...acceptedProfile, lastLanguage: Languages.German })
    );
    actions$.next(setLanguage({ language: Languages.German }));

    const action = await firstValueFrom(effects.persistLastLanguage$);
    expect(api.save).toHaveBeenCalledWith(
      {
        id: APP_CONFIG.PROFILE.DEFAULT_ID,
        privacyNoticeAccepted: true,
        lastLanguage: Languages.German,
        optionalRemoteTranslation: true,
        optionalGeocoding: true,
        optionalAiMatching: true,
      },
      acceptedProfile
    );
    expect(action).toEqual(
      profileUpdated({
        profile: { ...acceptedProfile, lastLanguage: Languages.German },
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
