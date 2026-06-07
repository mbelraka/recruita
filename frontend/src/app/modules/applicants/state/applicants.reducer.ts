import { createReducer, on } from '@ngrx/store';

import { ApplicantUiState } from '../models/applicant-state.model';
import { SortDirection } from '../enums/sort-direction.enum';
import { ViewTypes } from '../enums/view-types.enum';
import {
  applicantFormDialogClosed,
  setNewApplicantFabExpanded,
  setSortBy,
  setViewType,
  syncApplicantFiltersFromUrl,
  searchLocationSuggestionsSuccess,
  searchLocationSuggestionsFailure,
  clearLocationSuggestions,
} from './applicants.actions';

const initialApplicantUiState: ApplicantUiState = {
  filter: '',
  sortBy: 'name',
  sortDirection: SortDirection.Asc,
  filterBySkill: null,
  filterByStatus: null,
  filterByCountry: null,
  viewType: ViewTypes.GRID,
  locationSuggestions: [],
  newApplicantFabExpanded: false,
  suppressNewApplicantFabPointerExpandUntil: 0,
};

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
  }))
);
