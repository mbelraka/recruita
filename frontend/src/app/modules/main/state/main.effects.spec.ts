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
import { ProfileEntityCollectionService } from '../data/profile-entity-collection.service';
import {
  buildApplicantEntityCache,
  buildProfileEntityCache,
  mergeEntityCaches,
  withEntityCache,
} from '../../../testing/entity-cache-test.util';
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
  let profiles: jasmine.SpyObj<ProfileEntityCollectionService>;
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

  const mockStoreState = (profileInCache: typeof profile | null = null) => ({
    app: mockAppState,
    [StateFeatures.Main]: initialMainState,
    ...withEntityCache(
      mergeEntityCaches(
        buildProfileEntityCache(profileInCache, {
          loaded: profileInCache != null,
        }),
        buildApplicantEntityCache([])
      )
    ),
  });

  beforeEach(() => {
    actions$ = new ReplaySubject(1);
    profiles = jasmine.createSpyObj<ProfileEntityCollectionService>(
      'ProfileEntityCollectionService',
      [
        'getByKey',
        'save',
        'upsertOptimisticFromRequest',
        'setLoaded',
        'setLoading',
      ]
    );

    TestBed.configureTestingModule({
      providers: [
        MainEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          initialState: mockStoreState(),
        }),
        { provide: ProfileEntityCollectionService, useValue: profiles },
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
    profiles.getByKey.and.returnValue(of(profile));
    const emitted: unknown[] = [];
    const subscription = effects.loadProfile$.subscribe((action) =>
      emitted.push(action)
    );

    actions$.next(loadProfile());

    expect(profiles.setLoaded).toHaveBeenCalledWith(true);
    expect(profiles.setLoading).toHaveBeenCalledWith(false);
    expect(emitted).toEqual([
      loadProfileSuccess({ profile }),
      setLanguage({ language: Languages.English }),
    ]);
    subscription.unsubscribe();
  });

  it('restores the stored language from profile on load', () => {
    const germanProfile = { ...profile, lastLanguage: Languages.German };
    profiles.getByKey.and.returnValue(of(germanProfile));
    const emitted: unknown[] = [];
    const subscription = effects.loadProfile$.subscribe((action) =>
      emitted.push(action)
    );

    actions$.next(loadProfile());

    expect(emitted[1]).toEqual(setLanguage({ language: Languages.German }));
    subscription.unsubscribe();
  });

  it('dispatches loadProfileFailure when the API fails', () => {
    profiles.getByKey.and.returnValue(throwError(() => new Error('offline')));
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

  it('persists privacy consent by creating the admin profile', async () => {
    profiles.save.and.returnValue(
      of({ ...profile, privacyNoticeAccepted: true })
    );
    const emittedPromise = lastValueFrom(
      effects.persistPrivacyConsentOutcome$.pipe(take(1), toArray())
    );

    actions$.next(
      persistPrivacyConsentOutcome({
        result: { mode: PrivacyConsentDialogMode.Necessary },
      })
    );

    const emitted = await emittedPromise;
    expect(profiles.upsertOptimisticFromRequest).toHaveBeenCalled();
    expect(profiles.save).toHaveBeenCalledWith(
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
      persistPrivacyConsentOutcomeSuccess({
        profile: { ...profile, privacyNoticeAccepted: true },
      })
    );
  });

  it('updates the admin profile when it is already in state', async () => {
    store.setState(mockStoreState(profile));
    profiles.save.and.returnValue(
      of({
        ...profile,
        privacyNoticeAccepted: true,
        optionalRemoteTranslation: true,
        optionalGeocoding: true,
        optionalAiMatching: true,
      })
    );
    const emittedPromise = lastValueFrom(
      effects.persistPrivacyConsentOutcome$.pipe(take(1), toArray())
    );
    actions$.next(
      persistPrivacyConsentOutcome({
        result: { mode: PrivacyConsentDialogMode.All },
      })
    );

    const emitted = await emittedPromise;
    expect(profiles.save).toHaveBeenCalledWith(
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
    expect(emitted[0].type).toBe(persistPrivacyConsentOutcomeSuccess.type);
  });

  it('reloads profile when the privacy API save fails', async () => {
    profiles.save.and.returnValue(throwError(() => new Error('offline')));
    const emittedPromise = lastValueFrom(
      effects.persistPrivacyConsentOutcome$.pipe(take(2), toArray())
    );

    actions$.next(
      persistPrivacyConsentOutcome({
        result: { mode: PrivacyConsentDialogMode.Necessary },
      })
    );

    const emitted = await emittedPromise;
    expect(emitted[0].type).toBe(loadProfile.type);
    expect(emitted[1].type).toBe(persistPrivacyConsentOutcomeFailure.type);
  });

  it('persists language changes to the profile', async () => {
    store.setState(mockStoreState(profile));
    profiles.save.and.returnValue(
      of({ ...profile, lastLanguage: Languages.German })
    );
    actions$.next(setLanguage({ language: Languages.German }));

    const action = await firstValueFrom(effects.persistLastLanguage$);
    expect(profiles.save).toHaveBeenCalledWith(
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
    store.setState(mockStoreState(profile));
    const subscription = effects.persistLastLanguage$.subscribe();

    actions$.next(setLanguage({ language: Languages.English }));

    expect(profiles.save).not.toHaveBeenCalled();
    subscription.unsubscribe();
  });
});
