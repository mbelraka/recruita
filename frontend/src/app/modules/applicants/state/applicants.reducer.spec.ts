import { ApplicationStatus } from '../enums/application-status.enum';
import { createApplicant } from '../utilities/applicant-domain.util';
import { SortDirection } from '../enums/sort-direction.enum';
import { ViewTypes } from '../enums/view-types.enum';
import { ApplicantUiState } from '../models/applicant-state.model';
import { Applicant } from '../models/applicant.model';
import * as ApplicantsActions from './applicants.actions';
import { applicantsReducer } from './applicants.reducer';

describe('Applicants Reducer', () => {
  let initialState: ApplicantUiState;

  const mockApplicant: Applicant = createApplicant({
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    currentJobTitle: 'Developer',
    location: 'NY',
    yearsOfExperience: 5,
    applicationStatus: ApplicationStatus.Received,
  });

  beforeEach(() => {
    void mockApplicant;
    initialState = {
      filter: '',
      sortBy: 'name',
      sortDirection: SortDirection.Asc,
      filterBySkill: null,
      filterByStatus: null,
      filterByCountry: null,
      viewType: ViewTypes.GRID,
      locationSuggestions: [],
    };
  });

  describe('unknown action', () => {
    it('should return the default state', () => {
      const action = { type: 'Unknown' };
      const state = applicantsReducer(initialState, action);

      expect(state).toBe(initialState);
    });
  });

  describe('setGlobalFilter action', () => {
    it('should update the global filter', () => {
      const action = ApplicantsActions.setGlobalFilter({ filter: 'test' });
      const state = applicantsReducer(initialState, action);

      expect(state.filter).toBe('test');
    });
  });

  describe('setSortBy action', () => {
    it('should update sortBy and sortDirection', () => {
      const action = ApplicantsActions.setSortBy({
        sortBy: 'email',
        sortDirection: SortDirection.Desc,
      });
      const state = applicantsReducer(initialState, action);

      expect(state.sortBy).toBe('email');
      expect(state.sortDirection).toBe(SortDirection.Desc);
    });
  });

  describe('setViewType action', () => {
    it('should update viewType', () => {
      const action = ApplicantsActions.setViewType({
        viewType: ViewTypes.LIST,
      });
      const state = applicantsReducer(initialState, action);

      expect(state.viewType).toBe(ViewTypes.LIST);
    });
  });

  describe('location suggestions', () => {
    it('stores suggestions on success', () => {
      const action = ApplicantsActions.searchLocationSuggestionsSuccess({
        suggestions: ['Berlin, Germany'],
      });
      const state = applicantsReducer(initialState, action);

      expect(state.locationSuggestions).toEqual(['Berlin, Germany']);
    });

    it('clears suggestions on failure', () => {
      const withSuggestions = applicantsReducer(
        initialState,
        ApplicantsActions.searchLocationSuggestionsSuccess({
          suggestions: ['Berlin, Germany'],
        })
      );
      const state = applicantsReducer(
        withSuggestions,
        ApplicantsActions.searchLocationSuggestionsFailure()
      );

      expect(state.locationSuggestions).toEqual([]);
    });
  });
});
