import { APP_CONFIG } from '../config/app.config';
import { remoteTranslationSuccess } from './app.actions';
import { appReducer, initialAppState } from './app.reducer';

describe('appReducer', () => {
  it('caps remoteTranslations at CACHE_MAX_ENTRIES', () => {
    const max = APP_CONFIG.TRANSLATION.CACHE_MAX_ENTRIES;
    let state = initialAppState;
    for (let index = 0; index < max + 2; index += 1) {
      state = appReducer(
        state,
        remoteTranslationSuccess({
          key: `k${index}`,
          translated: `t${index}`,
        })
      );
    }

    expect(Object.keys(state.remoteTranslations)).toHaveSize(max);
    expect(state.remoteTranslations['k0']).toBeUndefined();
    expect(state.remoteTranslations[`k${max + 1}`]).toBe(`t${max + 1}`);
  });
});
