import { ApplicationStatus } from '../enums/application-status.enum';
import { Applicant } from '../models/applicant.model';
import {
  canonicalizeRosterCountry,
  canonicalizeRosterSkill,
  canonicalizeRosterStatus,
  matchRosterLabel,
  normalizeRosterKey,
  rosterLabelsEqual,
} from './roster.util';

describe('roster util', () => {
  const roster = ['USA', 'React', 'TypeScript'];

  describe('normalizeRosterKey and rosterLabelsEqual', () => {
    it('compares labels with locale-insensitive folding', () => {
      expect(normalizeRosterKey(' Germany ')).toBe('germany');
      expect(rosterLabelsEqual('React', 'react')).toBeTrue();
    });
  });

  describe('matchRosterLabel', () => {
    it('matches roster labels case-insensitively', () => {
      expect(matchRosterLabel('usa', roster)).toBe('USA');
      expect(matchRosterLabel('react', roster)).toBe('React');
    });

    it('returns null when the token is not on the roster', () => {
      expect(matchRosterLabel('United States', roster)).toBeNull();
      expect(matchRosterLabel('reactjs', roster)).toBeNull();
      expect(matchRosterLabel(' ', roster)).toBeNull();
    });
  });

  describe('canonicalizeRosterCountry, canonicalizeRosterSkill, canonicalizeRosterStatus', () => {
    const applicants: Applicant[] = [
      {
        id: '1',
        name: 'Alex Morgan',
        email: 'alex@example.com',
        phone: '+1',
        location: 'San Francisco, CA, USA',
        yearsOfExperience: 8,
        applicationStatus: ApplicationStatus.Screening,
        currentJobTitle: 'Senior Frontend Engineer',
        skills: ['Angular', 'TypeScript'],
      },
    ];

    it('aligns exact roster country and skill labels from the LLM', () => {
      expect(canonicalizeRosterCountry('USA', applicants)).toBe('USA');
      expect(canonicalizeRosterCountry('usa', applicants)).toBe('USA');
      expect(canonicalizeRosterSkill('typescript', applicants)).toBe(
        'TypeScript'
      );
    });

    it('does not resolve semantic aliases locally', () => {
      expect(canonicalizeRosterCountry('United States', applicants)).toBeNull();
      expect(canonicalizeRosterSkill('ts', applicants)).toBeNull();
      expect(canonicalizeRosterStatus('short-listed')).toBeNull();
    });

    it('accepts only application status wire values', () => {
      expect(canonicalizeRosterStatus(ApplicationStatus.Shortlisted)).toBe(
        ApplicationStatus.Shortlisted
      );
      expect(canonicalizeRosterStatus(undefined)).toBeNull();
    });
  });
});
