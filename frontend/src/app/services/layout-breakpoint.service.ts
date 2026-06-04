import { BreakpointObserver } from '@angular/cdk/layout';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

/** Viewport width tier for responsive layout (matches shared/_breakpoints.scss). */
export type LayoutWidthTier = 'xs' | 'sm' | 'md' | 'lg';

const BP_XS = '(max-width: 599.98px)';
const BP_SM = '(max-width: 959.98px)';
const BP_MD = '(max-width: 1279.98px)';

@Injectable({ providedIn: 'root' })
export class LayoutBreakpointService {
  private readonly _observer = inject(BreakpointObserver);

  readonly widthTier = toSignal(
    this._observer.observe([BP_XS, BP_SM, BP_MD]).pipe(
      map((state): LayoutWidthTier => {
        if (state.breakpoints[BP_XS]) {
          return 'xs';
        }
        if (state.breakpoints[BP_SM]) {
          return 'sm';
        }
        if (state.breakpoints[BP_MD]) {
          return 'md';
        }
        return 'lg';
      })
    ),
    { initialValue: 'lg' }
  );

  /** True at tablet widths and below (≤959px) — compact header nav. */
  readonly isCompactNav = toSignal(
    this._observer
      .observe([BP_SM])
      .pipe(map((state) => state.breakpoints[BP_SM] ?? false)),
    { initialValue: false }
  );
}
