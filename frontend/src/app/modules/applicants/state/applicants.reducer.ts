import { createReducer, on } from '@ngrx/store';

import { DEFAULT_APPLICANT_UI_STATE } from '../constants/applicants-ui-state.constants';
import { SortDirection } from '../enums/sort-direction.enum';
import { ApplicantUiState } from '../models/applicant-state.model';
import {
  applicantFormDialogClosed,
  setNewApplicantFabExpanded,
  setSortBy,
  setViewType,
  syncApplicantFiltersFromUrl,
  searchLocationSuggestionsSuccess,
  searchLocationSuggestionsFailure,
  clearLocationSuggestions,
  applicantsRosterLoaded,
} from './applicants.actions';

const initialApplicantUiState: ApplicantUiState = DEFAULT_APPLICANT_UI_STATE;

export const applicantsReducer = createReducer(
  initialApplicantUiState,

  on(syncApplicantFiltersFromUrl, (state, { filters }) => ({
    ...state,
    filter: filters.globalFilter,
    filterBySkill: filters.skill,
    filterByStatus: filters.status,
    filterByCountry: filters.country,
  })),

  on(setSortBy, (state, { sortBy, sortDirection = SortDirection.Asc }) => ({
    ...state,
    sortBy,
    sortDirection: sortBy == null ? SortDirection.Asc : sortDirection,
  })),

  on(setViewType, (state, { viewType }) => ({
    ...state,
    viewType,
  })),

  on(searchLocationSuggestionsSuccess, (state, { suggestions }) => ({
    ...state,
    locationSuggestions: suggestions,
  })),
  on(searchLocationSuggestionsFailure, (state) => ({
    ...state,
    locationSuggestions: [] as string[],
  })),
  on(clearLocationSuggestions, (state) => ({
    ...state,
    locationSuggestions: [] as string[],
  })),

  on(applicantFormDialogClosed, (state, { suppressPointerExpandUntil }) => ({
    ...state,
    newApplicantFabExpanded: false,
    suppressNewApplicantFabPointerExpandUntil: suppressPointerExpandUntil,
  })),

  on(setNewApplicantFabExpanded, (state, { expanded }) => ({
    ...state,
    newApplicantFabExpanded: expanded,
  })),

  on(applicantsRosterLoaded, (state, { etag, rosterVersion, notModified }) => ({
    ...state,
    rosterEtag: etag ?? state.rosterEtag,
    rosterVersion: rosterVersion ?? (notModified ? state.rosterVersion : null),
  }))
);
