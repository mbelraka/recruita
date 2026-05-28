import { createReducer, on } from '@ngrx/store';

import { MainState } from '../models/main-state.model';
import { ProfileState } from '../models/profile-state.model';
import {
  clearProfileState,
  loadProfile,
  loadProfileFailure,
  loadProfileSuccess,
  persistPrivacyConsentOutcome,
  persistPrivacyConsentOutcomeFailure,
  persistPrivacyConsentOutcomeSuccess,
  profileUpdated,
} from './profile.actions';

export const initialProfileState: ProfileState = {
  profile: null,
  loading: false,
  loaded: false,
  error: null,
};

export const initialMainState: MainState = {
  profile: initialProfileState,
};

export const mainReducer = createReducer(
  initialMainState,
  on(
    loadProfile,
    (state): MainState => ({
      ...state,
      profile: {
        ...state.profile,
        loading: true,
        error: null,
      },
    })
  ),
  on(
    loadProfileSuccess,
    (state, { profile }): MainState => ({
      ...state,
      profile: {
        ...state.profile,
        profile,
        loading: false,
        loaded: true,
        error: null,
      },
    })
  ),
  on(
    loadProfileFailure,
    (state, { error }): MainState => ({
      ...state,
      profile: {
        ...state.profile,
        profile: null,
        loading: false,
        loaded: true,
        error,
      },
    })
  ),
  on(
    persistPrivacyConsentOutcome,
    (state): MainState => ({
      ...state,
      profile: {
        ...state.profile,
        loading: true,
        error: null,
      },
    })
  ),
  on(
    persistPrivacyConsentOutcomeSuccess,
    (state, { profile }): MainState => ({
      ...state,
      profile: {
        ...state.profile,
        profile,
        loading: false,
        error: null,
      },
    })
  ),
  on(
    persistPrivacyConsentOutcomeFailure,
    (state, { error }): MainState => ({
      ...state,
      profile: {
        ...state.profile,
        loading: false,
        error,
      },
    })
  ),
  on(
    profileUpdated,
    (state, { profile }): MainState => ({
      ...state,
      profile: {
        ...state.profile,
        profile,
      },
    })
  ),
  on(clearProfileState, (): MainState => initialMainState)
);
