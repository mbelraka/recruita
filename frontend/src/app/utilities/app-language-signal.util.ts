import { ChangeDetectorRef, effect, Signal } from '@angular/core';
import { Store } from '@ngrx/store';

import { Languages } from '../enums/language.enum';
import { FullState } from '../models/full-state.model';
import { selectAppLanguage } from '../state/app.selectors';

/**
 * Language signal that marks the host for check when the store language changes.
 * Call from an injection context (component/pipe constructor or field initializer).
 */
export function bindAppLanguageSignal(
  store: Store<FullState>,
  changeDetector: ChangeDetectorRef
): Signal<Languages> {
  const language = store.selectSignal(selectAppLanguage);
  effect(() => {
    language();
    changeDetector.markForCheck();
  });
  return language;
}
