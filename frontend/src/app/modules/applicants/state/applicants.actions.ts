import { createAction, props } from '@ngrx/store';

import { Languages } from '../../../enums/language.enum';
import { Applicant } from '../models/applicant.model';
import { ApplicantActionTypes } from '../enums/applicant-action-types.enum';
import { SortDirection } from '../enums/sort-direction.enum';
import { ViewTypes } from '../enums/view-types.enum';
import { ApplicantListFilters } from '../models/applicant-list-filters.model';

/** Roster CRUD (NgRx Data effects). */
export const loadApplicants = createAction(ApplicantActionTypes.LoadApplicants);
export const loadApplicantsFailure = createAction(
  ApplicantActionTypes.LoadApplicantsFailure,
  props<{ error: string }>()
);
export const applicantsRosterLoaded = createAction(
  ApplicantActionTypes.RosterLoaded,
  props<{
    etag: string | null;
    rosterVersion: number | null;
    notModified: boolean;
  }>()
);

export const addApplicant = createAction(
  ApplicantActionTypes.AddApplicant,
  props<{ applicant: Applicant }>()
);
export const addApplicantSuccess = createAction(
  ApplicantActionTypes.AddApplicantSuccess,
  props<{ applicant: Applicant }>()
);
export const addApplicantFailure = createAction(
  ApplicantActionTypes.AddApplicantFailure,
  props<{ error: string }>()
);

export const updateApplicant = createAction(
  ApplicantActionTypes.UpdateApplicant,
  props<{ applicant: Applicant }>()
);
export const updateApplicantSuccess = createAction(
  ApplicantActionTypes.UpdateApplicantSuccess,
  props<{ applicant: Applicant }>()
);
export const updateApplicantFailure = createAction(
  ApplicantActionTypes.UpdateApplicantFailure,
  props<{ error: string }>()
);

export const deleteApplicant = createAction(
  ApplicantActionTypes.DeleteApplicant,
  props<{ id: string }>()
);
export const deleteApplicantSuccess = createAction(
  ApplicantActionTypes.DeleteApplicantSuccess,
  props<{ id: string }>()
);
export const deleteApplicantFailure = createAction(
  ApplicantActionTypes.DeleteApplicantFailure,
  props<{ error: string }>()
);

/** List filters: URL → store (reducer) or UI/smart-action → URL (effect). */
export const syncApplicantFiltersFromUrl = createAction(
  ApplicantActionTypes.SyncFiltersFromUrl,
  props<{ filters: ApplicantListFilters }>()
);

export const patchApplicantFilters = createAction(
  ApplicantActionTypes.PatchFilters,
  props<{ partial: Partial<ApplicantListFilters> }>()
);

/** List view preferences (store only). */
export const setSortBy = createAction(
  ApplicantActionTypes.SetSortBy,
  props<{
    sortBy: keyof Applicant | null;
    sortDirection?: SortDirection;
  }>()
);

export const setViewType = createAction(
  ApplicantActionTypes.SetViewType,
  props<{ viewType: ViewTypes }>()
);

/** Applicant form dialog and FAB shell. */
export const openApplicantForm = createAction(
  ApplicantActionTypes.OpenApplicantForm,
  props<{ applicant?: Applicant | undefined }>()
);

export const openConfirmDeleteApplicant = createAction(
  ApplicantActionTypes.OpenConfirmDeleteApplicant,
  props<{ applicant: Applicant }>()
);

export const applicantFormDialogClosed = createAction(
  ApplicantActionTypes.ApplicantFormDialogClosed,
  props<{ suppressPointerExpandUntil: number }>()
);

export const setNewApplicantFabExpanded = createAction(
  ApplicantActionTypes.SetNewApplicantFabExpanded,
  props<{ expanded: boolean }>()
);

/** Location autocomplete (geocoding). */
export const searchLocationSuggestions = createAction(
  ApplicantActionTypes.SearchLocationSuggestions,
  props<{ query: string; language: Languages }>()
);
export const searchLocationSuggestionsSuccess = createAction(
  ApplicantActionTypes.SearchLocationSuggestionsSuccess,
  props<{ suggestions: string[] }>()
);
export const searchLocationSuggestionsFailure = createAction(
  ApplicantActionTypes.SearchLocationSuggestionsFailure
);
export const clearLocationSuggestions = createAction(
  ApplicantActionTypes.ClearLocationSuggestions
);
