import { createFeatureSelector, createSelector } from '@ngrx/store';

import { StateFeatures } from '../../../containers/root/enums/state-features.enum';
import type { PrivacyConsentFormState } from '../../../models/privacy-consent-form-state.model';
import {
  DEFAULT_DISABLED_PRIVACY_CHOICES,
  profilePrivacyChoicesFrom,
} from '../../../utilities/build-save-profile-request.util';
import { MainState } from '../models/main-state.model';

export const selectMainState = createFeatureSelector<MainState>(
  StateFeatures.Main
);

export const selectMainProfileState = createSelector(
  selectMainState,
  (state) => state.profile
);

export const selectProfile = createSelector(
  selectMainProfileState,
  (state) => state.profile
);

export const selectProfileLoaded = createSelector(
  selectMainProfileState,
  (state) => state.loaded
);

export const selectPrivacyNoticeAccepted = createSelector(
  selectProfile,
  (profile) => profile?.privacyNoticeAccepted === true
);

export const selectProfilePrivacyChoices = createSelector(
  selectProfile,
  (profile): PrivacyConsentFormState =>
    profile
      ? profilePrivacyChoicesFrom(profile)
      : DEFAULT_DISABLED_PRIVACY_CHOICES
);

export const selectOptionalRemoteTranslation = createSelector(
  selectProfile,
  (profile) => profile?.optionalRemoteTranslation === true
);

export const selectOptionalGeocoding = createSelector(
  selectProfile,
  (profile) => profile?.optionalGeocoding === true
);

export const selectOptionalAiMatching = createSelector(
  selectProfile,
  (profile) => profile?.optionalAiMatching === true
);

export const selectPrivacyConsentComplete = createSelector(
  selectProfileLoaded,
  selectPrivacyNoticeAccepted,
  (loaded, accepted) => loaded && accepted
);

export const selectAllowsAiMatching = createSelector(
  selectPrivacyConsentComplete,
  selectOptionalAiMatching,
  (consentComplete, aiMatching) => consentComplete && aiMatching
);
