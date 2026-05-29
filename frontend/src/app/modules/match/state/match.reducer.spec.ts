import { APP_CONFIG } from '../../../config/app.config';
import { Applicant } from '../../applicants/models/applicant.model';
import { MatchCandidateResult } from '../models/match-candidate-result.model';
import {
  evaluateCandidates,
  evaluateCandidatesFailure,
  evaluateCandidatesSuccess,
  invalidateMatchResults,
  setJobDescription,
} from './match.actions';
import { matchReducer } from './match.reducer';

function makeResult(id: string): MatchCandidateResult {
  return {
    applicant: new Applicant({ id, name: id }),
    score: 80,
    reasoning: 'reason',
    matchingSkills: [],
    missingSkills: [],
    candidateProfile: {
      skills: [],
      yearsExperience: 0,
      topJobTitles: [],
      education: '',
    },
    recommendation: 'rec',
    isTopCandidate: false,
  };
}

describe('matchReducer', () => {
  it('should return initial state', () => {
    const state = matchReducer(undefined, { type: 'unknown' } as never);
    expect(state.loading).toBeFalse();
    expect(state.error).toBeNull();
    expect(state.jobDescription).toBe('');
    expect(state.topCandidatesCount).toBe(
      APP_CONFIG.MATCH.TOP_CANDIDATES_COUNT
    );
  });

  it('should set job description', () => {
    const state = matchReducer(
      undefined,
      setJobDescription({ jobDescription: 'Senior Angular dev' })
    );
    expect(state.jobDescription).toBe('Senior Angular dev');
  });

  it('should set loading on evaluate', () => {
    const prev = {
      ...matchReducer(undefined, { type: 'unknown' } as never),
      error: 'x',
      results: [makeResult('a1')],
    };
    const state = matchReducer(prev, evaluateCandidates());
    expect(state.loading).toBeTrue();
    expect(state.error).toBeNull();
    expect(state.results).toEqual([]);
  });

  it('should store success results', () => {
    const results = [makeResult('a1'), makeResult('a2')];
    const state = matchReducer(
      {
        ...matchReducer(undefined, { type: 'unknown' } as never),
        loading: true,
      },
      evaluateCandidatesSuccess({ results })
    );
    expect(state.loading).toBeFalse();
    expect(state.error).toBeNull();
    expect(state.results.length).toBe(2);
  });

  it('should store failure error and clear results', () => {
    const state = matchReducer(
      {
        ...matchReducer(undefined, { type: 'unknown' } as never),
        loading: true,
        results: [makeResult('a1')],
      },
      evaluateCandidatesFailure({ error: 'boom' })
    );
    expect(state.loading).toBeFalse();
    expect(state.error).toBe('boom');
    expect(state.results).toEqual([]);
  });

  it('should clear results on invalidateMatchResults but keep the job description', () => {
    const prev = {
      ...matchReducer(undefined, { type: 'unknown' } as never),
      jobDescription: 'Backend engineer',
      loading: true,
      error: 'stale',
      results: [makeResult('a1')],
    };
    const state = matchReducer(prev, invalidateMatchResults());
    expect(state.jobDescription).toBe('Backend engineer');
    expect(state.loading).toBeFalse();
    expect(state.error).toBeNull();
    expect(state.results).toEqual([]);
  });
});
