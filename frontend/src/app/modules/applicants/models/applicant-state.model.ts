import { EntityState } from '@ngrx/entity';

import { SortDirection } from '../enums/sort-direction.enum';
import { ViewTypes } from '../enums/view-types.enum';
import { Applicant } from './applicant.model';

/**
 * Represents the state for managing applicants.
 */
export interface ApplicantState extends EntityState<Applicant> {
  /** Indicates if a loading operation is in progress. */
  loading: boolean;

  /** True after the roster has loaded successfully at least once. */
  loaded: boolean;

  /** Stores error messages, if any. */
  error: string | null;

  /** Global text filter for applicants. */
  filter: string;

  /** Specifies the field to sort applicants by. */
  sortBy: keyof Applicant | null;

  /** Sort direction when `sortBy` is set. */
  sortDirection: SortDirection;

  /** Filters applicants by a specific skill. */
  filterBySkill: string | null;

  /** Filters by `applicationStatus` key (matches `ApplicationStatus` enum value). */
  filterByStatus: string | null;

  /**
   * Filters by country derived from `location` (text after the last comma, trimmed;
   * if there is no comma, the whole `location` is used).
   */
  filterByCountry: string | null;

  /** Determines the current view type (e.g., grid or list). */
  viewType: ViewTypes;

  /** Geocoding autocomplete labels ("City, Country") for the new-applicant location field. */
  locationSuggestions: string[];
}
