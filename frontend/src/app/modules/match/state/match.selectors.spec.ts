import { StateFeatures } from '../../../containers/root/enums/state-features.enum';
import { Applicant } from '../../applicants/models/applicant.model';
import { ViewTypes } from '../../applicants/enums/view-types.enum';
import { SortDirection } from '../../applicants/enums/sort-direction.enum';
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
    applicant: new Applicant({ id: 'a1', name: 'Alice' }),
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
    applicant: new Applicant({ id: 'a2', name: 'Bob' }),
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
    [StateFeatures.Match]: matchState,
    [StateFeatures.Applicants]: {
      ids: ['a1', 'a2'],
      entities: { a1: resultA.applicant, a2: resultB.applicant },
      loading: false,
      error: null,
      filter: '',
      sortBy: null,
      sortDirection: SortDirection.Asc,
      filterBySkill: null,
      filterByStatus: null,
      filterByCountry: null,
      viewType: ViewTypes.GRID,
      locationSuggestions: [],
    },
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
