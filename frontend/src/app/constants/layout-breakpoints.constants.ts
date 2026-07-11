import { LayoutWidthTier } from '../models/layout-width-tier.type';

/**
 * Max viewport widths per {@link LayoutWidthTier} (exclusive upper bound for xs/sm/md).
 * Keep in sync with `styles/shared/_breakpoints.scss` and `tailwind.config.js`.
 */
export const LAYOUT_WIDTH_TIER_MAX_PX: Readonly<
  Record<Exclude<LayoutWidthTier, 'lg'>, number>
> = {
  xs: 599.98,
  sm: 959.98,
  md: 1279.98,
};

/** CDK `BreakpointObserver` media queries for each non-lg width tier. */
export const LAYOUT_WIDTH_TIER_MEDIA_QUERIES: Readonly<
  Record<Exclude<LayoutWidthTier, 'lg'>, string>
> = {
  xs: `(max-width: ${LAYOUT_WIDTH_TIER_MAX_PX.xs}px)`,
  sm: `(max-width: ${LAYOUT_WIDTH_TIER_MAX_PX.sm}px)`,
  md: `(max-width: ${LAYOUT_WIDTH_TIER_MAX_PX.md}px)`,
};
