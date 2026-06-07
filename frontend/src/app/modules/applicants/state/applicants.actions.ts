import { createAction, props } from '@ngrx/store';

import { Languages } from '../../../enums/language.enum';
import { Applicant } from '../models/applicant.model';
import { SortDirection } from '../enums/sort-direction.enum';
import { ViewTypes } from '../enums/view-types.enum';
import { ApplicantListFilters } from '../utilities/applicant-filters.util';

/** Roster CRUD (NgRx Data effects). */
export const loadApplicants = createAction('[Applicants] Load Applicants');
export const loadApplicantsFailure = createAction(
  '[Applicants] Load Applicants Failure',
  props<{ error: string }>()
);
export const applicantsRosterLoaded = createAction(
  '[Applicants] Roster Loaded'
);

export const addApplicant = createAction(
  '[Applicants] Add Applicant',
  props<{ applicant: Applicant }>()
);
export const addApplicantSuccess = createAction(
  '[Applicants] Add Applicant Success',
  props<{ applicant: Applicant }>()
);
export const addApplicantFailure = createAction(
  '[Applicants] Add Applicant Failure',
  props<{ error: string }>()
);

export const updateApplicant = createAction(
  '[Applicants] Update Applicant',
  props<{ applicant: Applicant }>()
);
export const updateApplicantSuccess = createAction(
  '[Applicants] Update Applicant Success',
  props<{ applicant: Applicant }>()
);
export const updateApplicantFailure = createAction(
  '[Applicants] Update Applicant Failure',
  props<{ error: string }>()
);

export const deleteApplicant = createAction(
  '[Applicants] Delete Applicant',
  props<{ id: string }>()
);
export const deleteApplicantSuccess = createAction(
  '[Applicants] Delete Applicant Success',
  props<{ id: string }>()
);
export const deleteApplicantFailure = createAction(
  '[Applicants] Delete Applicant Failure',
  props<{ error: string }>()
);

/** List filters: URL → store (reducer) or UI/smart-action → URL (effect). */
export const syncApplicantFiltersFromUrl = createAction(
  '[Applicants] Sync Filters From URL',
  props<{ filters: ApplicantListFilters }>()
);

export const patchApplicantFilters = createAction(
  '[Applicants] Patch Filters',
  props<{ partial: Partial<ApplicantListFilters> }>()
);

/** List view preferences (store only). */
export const setSortBy = createAction(
  '[Applicants] Set Sort By',
  props<{
    sortBy: keyof Applicant | null;
    sortDirection?: SortDirection;
  }>()
);

export const setViewType = createAction(
  '[Applicants] Set View Type',
  props<{ viewType: ViewTypes }>()
);

/** Applicant form dialog and FAB shell. */
export const openApplicantForm = createAction(
  '[Applicants] Open Applicant Form',
  props<{ applicant?: Applicant | undefined }>()
);

export const applicantFormDialogClosed = createAction(
  '[Applicants] Applicant Form Dialog Closed',
  props<{ suppressPointerExpandUntil: number }>()
);

export const setNewApplicantFabExpanded = createAction(
  '[Applicants] Set New Applicant FAB Expanded',
  props<{ expanded: boolean }>()
);

/** Location autocomplete (geocoding). */
export const searchLocationSuggestions = createAction(
  '[Applicants] Search Location Suggestions',
  props<{ query: string; language: Languages }>()
);
export const searchLocationSuggestionsSuccess = createAction(
  '[Applicants] Search Location Suggestions Success',
  props<{ suggestions: string[] }>()
);
export const searchLocationSuggestionsFailure = createAction(
  '[Applicants] Search Location Suggestions Failure'
);
export const clearLocationSuggestions = createAction(
  '[Applicants] Clear Location Suggestions'
);
