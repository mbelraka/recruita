export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

/** Angular Material `MatSort` direction (empty when inactive). */
export type MaterialSortDirection = '' | SortDirection;

/** Raw direction emitted by Angular Material `MatSort` (enum values or empty). */
export type MaterialSortDirectionInput = `${SortDirection}` | '';

export function sortDirectionFromMaterial(
  direction: MaterialSortDirectionInput
): SortDirection | undefined {
  return direction === '' ? undefined : (direction as SortDirection);
}

export function toMaterialSortDirection(
  direction: SortDirection | undefined
): MaterialSortDirection {
  return direction ?? '';
}
