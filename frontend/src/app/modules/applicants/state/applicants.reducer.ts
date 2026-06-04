import { createReducer, on } from '@ngrx/store';

import { ApplicantUiState } from '../models/applicant-state.model';
import { SortDirection } from '../enums/sort-direction.enum';
import { ViewTypes } from '../enums/view-types.enum';
import {
  setFilterBySkill,
  setFilterByStatus,
  setFilterByCountry,
  setGlobalFilter,
  setSortBy,
  setViewType,
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
};

export const applicantsReducer = createReducer(
  initialApplicantUiState,

  on(setGlobalFilter, (state, { filter }) => ({
    ...state,
    filter,
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

  on(setFilterBySkill, (state, { skill }) => ({
    ...state,
    filterBySkill: skill,
  })),

  on(setFilterByStatus, (state, { status }) => ({
    ...state,
    filterByStatus: status,
  })),

  on(setFilterByCountry, (state, { country }) => ({
    ...state,
    filterByCountry: country,
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
  }))
);
