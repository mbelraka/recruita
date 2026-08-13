import { createReducer, on } from '@ngrx/store';

import { APP_CONFIG } from '../config/app.config';
import { AppState } from '../models/app-state.model';
import {
  buildRemoteTranslationCacheKey,
  putCappedStringRecord,
} from '../utilities/remote-translate-cache.util';
import {
  clearNotification,
  clearRemoteTranslations,
  remoteTranslationSuccess,
  requestRemoteTranslation,
  setLanguage,
  showNotification,
} from './app.actions';

export const initialAppState: AppState = {
  language: APP_CONFIG.LOCALIZATION.DEFAULT_LANGUAGE,
  notification: null,
  remoteTranslations: {},
  remoteTranslationInFlight: {},
};

export const appReducer = createReducer(
  initialAppState,
  on(
    setLanguage,
    (state, { language }): AppState => ({
      ...state,
      language,
    })
  ),
  on(
    showNotification,
    (state, { notification }): AppState => ({
      ...state,
      notification,
    })
  ),
  on(
    clearNotification,
    (state): AppState => ({
      ...state,
      notification: null,
    })
  ),
  on(requestRemoteTranslation, (state, { text, from, to }): AppState => {
    const key = buildRemoteTranslationCacheKey(from, to, text);
    if (state.remoteTranslations[key] || state.remoteTranslationInFlight[key]) {
      return state;
    }
    return {
      ...state,
      remoteTranslationInFlight: {
        ...state.remoteTranslationInFlight,
        [key]: true,
      },
    };
  }),
  on(remoteTranslationSuccess, (state, { key, translated }): AppState => {
    const { [key]: _removed, ...inFlight } = state.remoteTranslationInFlight;
    return {
      ...state,
      remoteTranslations: putCappedStringRecord(
        state.remoteTranslations,
        key,
        translated,
        APP_CONFIG.TRANSLATION.CACHE_MAX_ENTRIES
      ),
      remoteTranslationInFlight: inFlight,
    };
  }),
  on(
    clearRemoteTranslations,
    (state): AppState => ({
      ...state,
      remoteTranslations: {},
      remoteTranslationInFlight: {},
    })
  )
);
