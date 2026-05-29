export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

/** Angular Material `MatSort` direction (empty when inactive). */
export type MaterialSortDirection = '' | SortDirection;

/** Raw direction emitted by Angular Material `MatSort`. */
export type MaterialSortDirectionInput = 'asc' | 'desc' | '';

export function sortDirectionFromMaterial(
  direction: MaterialSortDirectionInput
): SortDirection | undefined {
  switch (direction) {
    case SortDirection.Asc:
      return SortDirection.Asc;
    case SortDirection.Desc:
      return SortDirection.Desc;
    default:
      return undefined;
  }
}

export function toMaterialSortDirection(
  direction: SortDirection | undefined
): MaterialSortDirection {
  return direction ?? '';
}
