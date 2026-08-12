import { ViewTypes } from '../enums/view-types.enum';

const VIEW_TYPE_VALUES = new Set<ViewTypes>(Object.values(ViewTypes));

/** Narrows unknown input (e.g. `MatButtonToggleChange.value`) to {@link ViewTypes}. */
export function isViewType(value: unknown): value is ViewTypes {
  return typeof value === 'string' && VIEW_TYPE_VALUES.has(value as ViewTypes);
}
