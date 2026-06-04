import { ApplicationStatus } from '../enums/application-status.enum';
import { createApplicant } from '../utilities/applicant-domain.util';
import { SortDirection } from '../enums/sort-direction.enum';
import { ViewTypes } from '../enums/view-types.enum';
import { ApplicantUiState } from '../models/applicant-state.model';
import { Applicant } from '../models/applicant.model';
import {
  buildApplicantEntityCache,
  withEntityCache,
} from '../../../testing/entity-cache-test.util';
import { initialAppState } from '../../../state/app.reducer';
import * as fromSelectors from './applicants.selectors';

describe('Applicants Selectors', () => {
  const mockApplicants: Applicant[] = [
    createApplicant({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      currentJobTitle: 'Developer',
      location: 'New York, USA',
      yearsOfExperience: 5,
      applicationStatus: ApplicationStatus.Received,
      skills: ['Angular', 'TypeScript'],
      availableFrom: new Date('2024-01-01'),
      notes: 'Good candidate',
    }),
    createApplicant({
      id: '2',
      name: 'Jane Doe',
      email: 'jane@test.com',
      currentJobTitle: 'Designer',
      location: 'London, UK',
      yearsOfExperience: undefined,
      applicationStatus: ApplicationStatus.InterviewScheduled,
      skills: ['Figma'],
      availableFrom: new Date('2024-02-01'),
    }),
    createApplicant({
      id: '3',
      name: 'Alice Smith',
      email: 'alice@domain.com',
      currentJobTitle: 'Manager',
      location: 'Paris, France',
      yearsOfExperience: 8,
      applicationStatus: ApplicationStatus.Received,
      skills: ['Leadership', 'Angular'],
      availableFrom: new Date('Full invalid!'), // Should map to NaN
    }),
    createApplicant({
      id: '4',
      name: 'Bob',
      email: 'bob@example.com',
      currentJobTitle: 'QA',
      location: '',
      yearsOfExperience: null as any,
      applicationStatus: undefined,
      skills: undefined,
      availableFrom: null as any,
    }),
  ];

  const uiState: ApplicantUiState = {
    filter: '',
    sortBy: 'name',
    sortDirection: SortDirection.Asc,
    filterBySkill: null,
    filterByStatus: null,
    filterByCountry: null,
    viewType: ViewTypes.GRID,
    locationSuggestions: ['USA', 'UK', 'France'],
  };

  const appState = {
    app: initialAppState,
    applicants: uiState,
    ...withEntityCache(buildApplicantEntityCache(mockApplicants)),
  };

  describe('Feature Selectors', () => {
    it('should select loading state', () => {
      expect(fromSelectors.selectLoading(appState)).toBeFalse();
    });

    it('should select applicants ready only after a successful load', () => {
      expect(fromSelectors.selectApplicantsReady(appState)).toBeTrue();
      expect(
        fromSelectors.selectApplicantsReady({
          app: initialAppState,
          applicants: uiState,
          ...withEntityCache(
            buildApplicantEntityCache(mockApplicants, {
              loaded: false,
              loading: false,
            })
          ),
        })
      ).toBeFalse();
      expect(
        fromSelectors.selectApplicantsReady({
          app: initialAppState,
          applicants: uiState,
          ...withEntityCache(
            buildApplicantEntityCache(mockApplicants, {
              loaded: true,
              loading: true,
            })
          ),
        })
      ).toBeFalse();
    });

    it('should select view type', () => {
      expect(fromSelectors.selectViewType(appState)).toBe(ViewTypes.GRID);
    });

    it('should select global filter', () => {
      expect(fromSelectors.selectGlobalFilter(appState)).toBe('');
    });

    it('should select filter by skill', () => {
      expect(fromSelectors.selectFilterBySkill(appState)).toBeNull();
    });

    it('should select filter by status', () => {
      expect(fromSelectors.selectFilterByStatus(appState)).toBeNull();
    });

    it('should select filter by country', () => {
      expect(fromSelectors.selectFilterByCountry(appState)).toBeNull();
    });

    it('should select location suggestions', () => {
      expect(fromSelectors.selectLocationSuggestions(appState)).toEqual([
        'USA',
        'UK',
        'France',
      ]);
    });

    it('should handle undefined location suggestions', () => {
      const stateWithoutLoc = {
        applicants: { ...uiState, locationSuggestions: undefined },
      } as any;
      expect(fromSelectors.selectLocationSuggestions(stateWithoutLoc)).toEqual(
        []
      );
    });

    it('should select sort by', () => {
      expect(fromSelectors.selectSortBy(appState)).toBe('name');
    });

    it('should select sort direction', () => {
      expect(fromSelectors.selectSortDirection(appState)).toBe(
        SortDirection.Asc
      );
    });
  });

  describe('Computed Selectors', () => {
    it('should select unique application statuses in order', () => {
      const statuses =
        fromSelectors.selectUniqueApplicationStatuses.projector(mockApplicants);
      expect(statuses).toEqual([
        ApplicationStatus.Received,
        ApplicationStatus.InterviewScheduled,
      ]);
    });

    it('should select unique countries', () => {
      const countries =
        fromSelectors.selectUniqueCountries.projector(mockApplicants);
      expect(countries).toEqual(['France', 'UK', 'USA']);
    });
  });

  describe('selectSortedApplicants', () => {
    it('should sort by name asc', () => {
      const sorted = fromSelectors.selectSortedApplicants.projector(
        mockApplicants,
        'name',
        SortDirection.Asc
      );
      expect(sorted[0].name).toBe('Alice Smith');
    });

    it('should sort by name desc', () => {
      const sorted = fromSelectors.selectSortedApplicants.projector(
        mockApplicants,
        'name',
        SortDirection.Desc
      );
      expect(sorted[0].name).toBe('John Doe');
    });

    it('should sort by yearsOfExperience with nulls first', () => {
      const sorted = fromSelectors.selectSortedApplicants.projector(
        mockApplicants,
        'yearsOfExperience',
        SortDirection.Asc
      );
      expect(sorted[0].name).toBe('Jane Doe'); // undefined
      expect(sorted[1].name).toBe('Bob'); // null
      expect(sorted[2].name).toBe('John Doe'); // 5
      expect(sorted[3].name).toBe('Alice Smith'); // 8
    });

    it('should sort by availableFrom (dates, nulls and NaNs first)', () => {
      const sorted = fromSelectors.selectSortedApplicants.projector(
        mockApplicants,
        'availableFrom',
        SortDirection.Asc
      );
      expect(sorted[0].name).toBe('Alice Smith'); // NaN (mapped to undefined in model)
      expect(sorted[1].name).toBe('Bob'); // null (mapped to undefined in model)
      expect(sorted[2].name).toBe('John Doe'); // Jan 1
      expect(sorted[3].name).toBe('Jane Doe'); // Feb 1
    });

    it('should sort by skills (arrays)', () => {
      const sorted = fromSelectors.selectSortedApplicants.projector(
        mockApplicants,
        'skills',
        SortDirection.Asc
      );
      expect(sorted.length).toBe(4);
    });

    it('should just return without sorting if sortBy is null', () => {
      const sorted = fromSelectors.selectSortedApplicants.projector(
        mockApplicants,
        null,
        SortDirection.Asc
      );
      expect(sorted).toEqual(mockApplicants);
    });
  });

  describe('applyFilters logic implicitly accessed', () => {
    it('should filter by global filter text', () => {
      const state = {
        app: initialAppState,
        applicants: { ...uiState, filter: 'John' },
        ...withEntityCache(buildApplicantEntityCache(mockApplicants)),
      };
      const result = fromSelectors.selectSortedApplicants(state);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('John Doe');
    });

    it('should filter by skill filter', () => {
      const state = {
        app: initialAppState,
        applicants: { ...uiState, filterBySkill: 'Angular' },
        ...withEntityCache(buildApplicantEntityCache(mockApplicants)),
      };
      const result = fromSelectors.selectSortedApplicants(state);
      expect(result.length).toBe(2);
    });

    it('should filter by status filter', () => {
      const state = {
        app: initialAppState,
        applicants: {
          ...uiState,
          filterByStatus: ApplicationStatus.InterviewScheduled,
        },
        ...withEntityCache(buildApplicantEntityCache(mockApplicants)),
      };
      const result = fromSelectors.selectSortedApplicants(state);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Jane Doe');
    });

    it('should filter by country filter', () => {
      const state = {
        app: initialAppState,
        applicants: { ...uiState, filterByCountry: 'France' },
        ...withEntityCache(buildApplicantEntityCache(mockApplicants)),
      };
      const result = fromSelectors.selectSortedApplicants(state);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Alice Smith');
    });

    it('should extract country from location', () => {
      expect(fromSelectors.countryFromLocation('Paris, France')).toBe('France');
      expect(fromSelectors.countryFromLocation('Germany')).toBe('Germany');
      expect(fromSelectors.countryFromLocation('')).toBeNull();
      expect(fromSelectors.countryFromLocation(undefined)).toBeNull();
      expect(fromSelectors.countryFromLocation('   ,, ,')).toBeNull();
    });
  });
});
