import { BreakpointObserver } from '@angular/cdk/layout';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { LAYOUT_WIDTH_TIER_MEDIA_QUERIES } from '../constants/layout-breakpoints.constants';
import { LayoutWidthTier } from '../enums/layout-width-tier.enum';

const BP_XS = LAYOUT_WIDTH_TIER_MEDIA_QUERIES[LayoutWidthTier.Xs];
const BP_SM = LAYOUT_WIDTH_TIER_MEDIA_QUERIES[LayoutWidthTier.Sm];
const BP_MD = LAYOUT_WIDTH_TIER_MEDIA_QUERIES[LayoutWidthTier.Md];

@Injectable({ providedIn: 'root' })
export class LayoutBreakpointService {
  private readonly _observer = inject(BreakpointObserver);

  readonly widthTier = toSignal(
    this._observer.observe([BP_XS, BP_SM, BP_MD]).pipe(
      map((state): LayoutWidthTier => {
        if (state.breakpoints[BP_XS]) {
          return LayoutWidthTier.Xs;
        }
        if (state.breakpoints[BP_SM]) {
          return LayoutWidthTier.Sm;
        }
        if (state.breakpoints[BP_MD]) {
          return LayoutWidthTier.Md;
        }
        return LayoutWidthTier.Lg;
      })
    ),
    { initialValue: LayoutWidthTier.Lg }
  );

  /** True at tablet widths and below (≤959px) — compact header nav. */
  readonly isCompactNav = toSignal(
    this._observer
      .observe([BP_SM])
      .pipe(map((state) => state.breakpoints[BP_SM] ?? false)),
    { initialValue: false }
  );
}
