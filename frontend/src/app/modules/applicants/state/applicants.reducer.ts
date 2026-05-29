import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { ApplicantState } from '../models/applicant-state.model';
import { Applicant } from '../models/applicant.model';
import { SortDirection } from '../enums/sort-direction.enum';
import { ViewTypes } from '../enums/view-types.enum';
import {
  addApplicant,
  addApplicantFailure,
  addApplicantSuccess,
  updateApplicant,
  updateApplicantFailure,
  updateApplicantSuccess,
  deleteApplicant,
  deleteApplicantFailure,
  deleteApplicantSuccess,
  loadApplicants,
  loadApplicantsFailure,
  loadApplicantsSuccess,
  setFilterBySkill,
  setFilterByStatus,
  setFilterByCountry,
  setGlobalFilter,
  setSortBy,
  setViewType,
  searchLocationSuggestionsSuccess,
  searchLocationSuggestionsFailure,
  clearLocationSuggestions,
  loadApplicantDetailSuccess,
} from './applicants.actions';

// Create an Entity Adapter
export const adapter: EntityAdapter<Applicant> = createEntityAdapter<Applicant>(
  {
    selectId: (applicant: Applicant) => applicant.id, // Selector for entity ID
  }
);

// Initial State
const initialApplicantState: ApplicantState = adapter.getInitialState({
  loading: false,
  loaded: false,
  error: null,
  filter: '',
  sortBy: 'name',
  sortDirection: SortDirection.Asc,
  filterBySkill: null,
  filterByStatus: null,
  filterByCountry: null,
  viewType: ViewTypes.GRID,
  locationSuggestions: [],
});

// Reducer Definition
export const applicantsReducer = createReducer(
  initialApplicantState,

  // **Load Applicants**
  on(loadApplicants, (state) => ({
    ...state,
    loading: true,
    error: null as ApplicantState['error'],
  })),
  on(loadApplicantsSuccess, (state, { applicants }) =>
    adapter.setAll(applicants, {
      ...state,
      loading: false,
      loaded: true,
      error: null,
    })
  ),
  on(loadApplicantsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    loaded: false,
    error,
  })),

  // **Add Applicant**
  on(addApplicant, (state) => ({
    ...state,
    loading: true,
  })),
  on(addApplicantSuccess, (state, { applicant }) =>
    adapter.addOne(applicant, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(addApplicantFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // **Update Applicant**
  on(updateApplicant, (state) => ({
    ...state,
    loading: true,
  })),
  on(updateApplicantSuccess, (state, { applicant }) =>
    adapter.upsertOne(applicant, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(updateApplicantFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // **Delete Applicant**
  on(deleteApplicant, (state) => ({
    ...state,
    loading: true,
  })),
  on(deleteApplicantSuccess, (state, { id }) =>
    adapter.removeOne(id, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(deleteApplicantFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // **Set Global Filter**
  on(setGlobalFilter, (state, { filter }) => ({
    ...state,
    filter,
  })),

  // **Set Sort By**
  on(setSortBy, (state, { sortBy, sortDirection = SortDirection.Asc }) => ({
    ...state,
    sortBy,
    sortDirection: sortBy == null ? SortDirection.Asc : sortDirection,
  })),

  // **Set View Type**
  on(setViewType, (state, { viewType }) => ({
    ...state,
    viewType,
  })),

  // **Set Filter By Skill**
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
  })),

  on(loadApplicantDetailSuccess, (state, { applicant }) =>
    adapter.upsertOne(applicant, state)
  )
);
