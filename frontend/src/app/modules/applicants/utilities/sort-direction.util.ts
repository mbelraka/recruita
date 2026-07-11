import { SortDirection } from '../enums/sort-direction.enum';
import { MaterialSortDirection } from '../types/material-sort-direction.type';
import { MaterialSortDirectionInput } from '../types/material-sort-direction-input.type';

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
