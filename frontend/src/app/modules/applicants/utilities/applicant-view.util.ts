import { Store } from '@ngrx/store';

import { FullState } from '../../../models/full-state.model';
import { patchApplicantFilters } from '../state/applicants.actions';

/** Stagger enter animation delay: `min(index, cap) * stepMs`. */
export function enterStaggerDelayMs(
  index: number,
  cap: number,
  stepMs: number
): number {
  return Math.min(index, cap) * stepMs;
}

/** Toggle skill filter in the applicants list/grid (same param when already active). */
export function dispatchApplicantSkillFilterToggle(
  store: Store<FullState>,
  activeSkillFilter: string | null,
  skill: string
): void {
  store.dispatch(
    patchApplicantFilters({
      partial: { skill: activeSkillFilter === skill ? null : skill },
    })
  );
}
