import { SortDirection } from '../enums/sort-direction.enum';
import { ViewTypes } from '../enums/view-types.enum';
import { ApplicationStatus } from '../enums/application-status.enum';
import { Applicant } from './applicant.model';

/** UI-only applicant list state; entity rows live in the NgRx Data cache. */
export interface ApplicantUiState {
  /** Global text filter for applicants. */
  filter: string;

  /** Specifies the field to sort applicants by. */
  sortBy: keyof Applicant | null;

  /** Sort direction when `sortBy` is set. */
  sortDirection: SortDirection;

  /** Filters applicants by a specific skill. */
  filterBySkill: string | null;

  /** Filters by `applicationStatus` (matches `ApplicationStatus` enum value). */
  filterByStatus: ApplicationStatus | null;

  /**
   * Filters by country derived from `location` (text after the last comma, trimmed;
   * if there is no comma, the whole `location` is used).
   */
  filterByCountry: string | null;

  /** Determines the current view type (e.g., grid or list). */
  viewType: ViewTypes;

  /** Geocoding autocomplete labels ("City, Country") for the new-applicant location field. */
  locationSuggestions: string[];

  /** Whether the new-applicant FAB label is visible. */
  newApplicantFabExpanded: boolean;

  /**
   * `performance.now()` threshold until pointer-enter is ignored on the FAB shell
   * (avoids spurious expand after the dialog overlay closes).
   */
  suppressNewApplicantFabPointerExpandUntil: number;
}

/** @deprecated Use {@link ApplicantUiState}. Kept for gradual migration of imports. */
export type ApplicantState = ApplicantUiState;
