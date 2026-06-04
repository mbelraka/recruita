import { createSelector } from '@ngrx/store';

import { APP_CONFIG } from '../../../config/app.config';
import {
  selectEntityCollection,
  selectEntityCollectionLoaded,
} from '../../../core/entity-data/entity-cache.selectors';
import { RecruitaEntityNames } from '../../../core/entity-data/recruita-entity-names';
import type { PrivacyConsentFormState } from '../../../models/privacy-consent-form-state.model';
import {
  DEFAULT_DISABLED_PRIVACY_CHOICES,
  profilePrivacyChoicesFrom,
} from '../../../utilities/build-save-profile-request.util';
import type { Profile } from '../models/profile.model';

const selectProfileCollection = selectEntityCollection<Profile>(
  RecruitaEntityNames.Profile
);

export const selectProfile = createSelector(
  selectProfileCollection,
  (collection) => collection?.entities?.[APP_CONFIG.PROFILE.DEFAULT_ID] ?? null
);

/** True after a successful fetch or when the admin profile row is already in the cache. */
export const selectProfileLoaded = createSelector(
  selectProfileCollection,
  selectEntityCollectionLoaded(RecruitaEntityNames.Profile),
  (collection, loadedFlag) => {
    if (loadedFlag) {
      return true;
    }
    return !!collection?.entities?.[APP_CONFIG.PROFILE.DEFAULT_ID];
  }
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
