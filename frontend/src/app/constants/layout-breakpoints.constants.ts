import { LayoutWidthTier } from '../enums/layout-width-tier.enum';

/**
 * Max viewport widths per {@link LayoutWidthTier} (exclusive upper bound for xs/sm/md).
 * Keep in sync with `styles/shared/_breakpoints.scss` and `tailwind.config.js`.
 */
export const LAYOUT_WIDTH_TIER_MAX_PX: Readonly<
  Record<Exclude<LayoutWidthTier, LayoutWidthTier.Lg>, number>
> = {
  [LayoutWidthTier.Xs]: 599.98,
  [LayoutWidthTier.Sm]: 959.98,
  [LayoutWidthTier.Md]: 1279.98,
};

/** CDK `BreakpointObserver` media queries for each non-lg width tier. */
export const LAYOUT_WIDTH_TIER_MEDIA_QUERIES: Readonly<
  Record<Exclude<LayoutWidthTier, LayoutWidthTier.Lg>, string>
> = {
  [LayoutWidthTier.Xs]: `(max-width: ${LAYOUT_WIDTH_TIER_MAX_PX[LayoutWidthTier.Xs]}px)`,
  [LayoutWidthTier.Sm]: `(max-width: ${LAYOUT_WIDTH_TIER_MAX_PX[LayoutWidthTier.Sm]}px)`,
  [LayoutWidthTier.Md]: `(max-width: ${LAYOUT_WIDTH_TIER_MAX_PX[LayoutWidthTier.Md]}px)`,
};
