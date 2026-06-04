import { StateFeatures } from '../../../containers/root/enums/state-features.enum';
import { createApplicant } from '../../applicants/utilities/applicant-domain.util';
import { ViewTypes } from '../../applicants/enums/view-types.enum';
import { SortDirection } from '../../applicants/enums/sort-direction.enum';
import { initialAppState } from '../../../state/app.reducer';
import {
  buildApplicantEntityCache,
  withEntityCache,
} from '../../../testing/entity-cache-test.util';
import { MatchFeatureState } from '../models/match-state.model';
import {
  selectEvaluatedCandidatesCount,
  selectMatchError,
  selectMatchJobDescription,
  selectMatchLoading,
  selectMatchResults,
  selectRegisteredApplicantsCount,
  selectTopCandidatesCount,
  selectTopMatchResults,
} from './match.selectors';

describe('match selectors', () => {
  const resultA = {
    applicant: createApplicant({ id: 'a1', name: 'Alice' }),
    score: 90,
    reasoning: 'A',
    matchingSkills: ['Angular'],
    missingSkills: [],
    candidateProfile: {
      skills: ['Angular'],
      yearsExperience: 5,
      topJobTitles: ['Engineer'],
      education: 'BSc',
    },
    recommendation: 'Hire',
    isTopCandidate: true,
  };
  const resultB = {
    applicant: createApplicant({ id: 'a2', name: 'Bob' }),
    score: 60,
    reasoning: 'B',
    matchingSkills: ['React'],
    missingSkills: ['Angular'],
    candidateProfile: {
      skills: ['React'],
      yearsExperience: 3,
      topJobTitles: ['Developer'],
      education: '',
    },
    recommendation: 'Maybe',
    isTopCandidate: false,
  };

  const matchState: MatchFeatureState = {
    loading: true,
    error: 'err',
    jobDescription: 'JD',
    topCandidatesCount: 3,
    results: [resultA, resultB],
  };

  const fullState = {
    app: initialAppState,
    [StateFeatures.Match]: matchState,
    applicants: {
      filter: '',
      sortBy: null,
      sortDirection: SortDirection.Asc,
      filterBySkill: null,
      filterByStatus: null,
      filterByCountry: null,
      viewType: ViewTypes.GRID,
      locationSuggestions: [],
    },
    ...withEntityCache(
      buildApplicantEntityCache([resultA.applicant, resultB.applicant])
    ),
  } as never;

  it('should select primitive match state fields', () => {
    expect(selectMatchLoading(fullState)).toBeTrue();
    expect(selectMatchError(fullState)).toBe('err');
    expect(selectMatchJobDescription(fullState)).toBe('JD');
    expect(selectTopCandidatesCount(fullState)).toBe(3);
  });

  it('should select match results and derived values', () => {
    expect(selectMatchResults(fullState).length).toBe(2);
    expect(selectTopMatchResults(fullState).length).toBe(1);
    expect(selectEvaluatedCandidatesCount(fullState)).toBe(2);
  });

  it('should select registered applicants count', () => {
    expect(selectRegisteredApplicantsCount(fullState)).toBe(2);
  });

  it('falls back to initial state when match feature state is missing', () => {
    const stateWithoutMatch = {
      [StateFeatures.Applicants]: fullState[StateFeatures.Applicants],
    } as never;

    expect(selectMatchLoading(stateWithoutMatch)).toBeFalse();
    expect(selectMatchError(stateWithoutMatch)).toBeNull();
    expect(selectMatchJobDescription(stateWithoutMatch)).toBe('');
    expect(selectTopCandidatesCount(stateWithoutMatch)).toBe(3);
    expect(selectMatchResults(stateWithoutMatch)).toEqual([]);
    expect(selectTopMatchResults(stateWithoutMatch)).toEqual([]);
    expect(selectEvaluatedCandidatesCount(stateWithoutMatch)).toBe(0);
  });
});
