import { createAction, props } from '@ngrx/store';

import type { Profile } from '../models/profile.model';
import { ProfileActionTypes } from '../enums/profile-action-types.enum';

export const loadProfile = createAction(ProfileActionTypes.LoadProfile);

export const loadProfileSuccess = createAction(
  ProfileActionTypes.LoadProfileSuccess,
  props<{ profile: Profile }>()
);

export const loadProfileFailure = createAction(
  ProfileActionTypes.LoadProfileFailure,
  props<{ error: string }>()
);

export const persistPrivacyConsentOutcome = createAction(
  ProfileActionTypes.PersistPrivacyConsentOutcome,
  props<{ result: unknown }>()
);

export const persistPrivacyConsentOutcomeSuccess = createAction(
  ProfileActionTypes.PersistPrivacyConsentOutcomeSuccess,
  props<{ profile: Profile }>()
);

export const persistPrivacyConsentOutcomeFailure = createAction(
  ProfileActionTypes.PersistPrivacyConsentOutcomeFailure,
  props<{ error: string }>()
);

export const clearProfileState = createAction(
  ProfileActionTypes.ClearProfileState
);

export const profileUpdated = createAction(
  ProfileActionTypes.ProfileUpdated,
  props<{ profile: Profile }>()
);
