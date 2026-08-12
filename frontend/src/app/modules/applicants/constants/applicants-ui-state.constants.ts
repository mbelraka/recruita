import { APPLICANT_FIELD } from './applicant-field.constants';
import { SortDirection } from '../enums/sort-direction.enum';
import { ViewTypes } from '../enums/view-types.enum';
import { ApplicantUiState } from '../models/applicant-state.model';

/** Default NgRx applicants UI slice (reducer initial state + selector fallback). */
export const DEFAULT_APPLICANT_UI_STATE: ApplicantUiState = {
  filter: '',
  sortBy: APPLICANT_FIELD.NAME,
  sortDirection: SortDirection.Asc,
  filterBySkill: null,
  filterByStatus: null,
  filterByCountry: null,
  viewType: ViewTypes.GRID,
  locationSuggestions: [],
  newApplicantFabExpanded: false,
  rosterEtag: null,
  rosterVersion: null,
  suppressNewApplicantFabPointerExpandUntil: 0,
};
