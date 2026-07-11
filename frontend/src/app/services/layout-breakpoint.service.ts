import { BreakpointObserver } from '@angular/cdk/layout';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { LAYOUT_WIDTH_TIER_MEDIA_QUERIES } from '../constants/layout-breakpoints.constants';
import { LayoutWidthTier } from '../models/layout-width-tier.type';

const { xs: BP_XS, sm: BP_SM, md: BP_MD } = LAYOUT_WIDTH_TIER_MEDIA_QUERIES;

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
