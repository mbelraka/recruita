import { convertToParamMap } from '@angular/router';

import { ApplicationStatus } from '../enums/application-status.enum';
import { Applicant } from '../models/applicant.model';
import {
  buildApplicantFilterQueryParams,
  buildApplicantListFiltersFromSmartAction,
  filterApplicantList,
  parseApplicantFiltersFromQueryParams,
} from './applicant-filters.util';

describe('applicant filters util', () => {
  const applicants: Applicant[] = [
    {
      id: '0',
      name: 'Alex Morgan',
      email: 'alex@example.com',
      phone: '+1',
      location: 'San Francisco, CA, USA',
      yearsOfExperience: 8,
      applicationStatus: ApplicationStatus.Screening,
      currentJobTitle: 'Senior Frontend Engineer',
      skills: ['Angular'],
    },
    {
      id: '1',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '+1',
      location: 'Toronto, ON, Canada',
      yearsOfExperience: 4,
      applicationStatus: ApplicationStatus.Shortlisted,
      currentJobTitle: 'Product Designer',
      skills: ['Figma'],
    },
    {
      id: '2',
      name: 'Anna Nielsen',
      email: 'anna@example.com',
      phone: '+45',
      location: 'Copenhagen, Denmark',
      yearsOfExperience: 9,
      applicationStatus: ApplicationStatus.Shortlisted,
      currentJobTitle: 'Site Reliability Engineer',
      skills: ['Go'],
    },
  ];

  describe('query params', () => {
    it('parses filters from the query string', () => {
      const filters = parseApplicantFiltersFromQueryParams(
        convertToParamMap({
          q: 'designer',
          skill: 'Figma',
          status: ApplicationStatus.Shortlisted,
          country: 'Canada',
        })
      );

      expect(filters).toEqual({
        globalFilter: 'designer',
        skill: 'Figma',
        status: ApplicationStatus.Shortlisted,
        country: 'Canada',
      });
    });

    it('omits empty filters from the query string', () => {
      expect(
        buildApplicantFilterQueryParams({
          globalFilter: '',
          skill: null,
          status: null,
          country: 'Canada',
        })
      ).toEqual({
        q: null,
        skill: null,
        status: null,
        country: 'Canada',
      });
    });
  });

  describe('smart action and list filtering', () => {
    it('trusts validated LLM country params without falling back to global search', () => {
      const filters = buildApplicantListFiltersFromSmartAction(
        { country: 'USA' },
        applicants
      );

      expect(filters.country).toBe('USA');
      expect(filters.globalFilter).toBe('');
      const usaApplicant = applicants.find((applicant) =>
        applicant.location?.includes('USA')
      )!;
      expect(filterApplicantList(applicants, filters)).toEqual([usaApplicant]);
    });

    it('does not resolve country aliases locally', () => {
      const filters = buildApplicantListFiltersFromSmartAction(
        { country: 'United States' },
        applicants
      );

      expect(filters.country).toBeNull();
      expect(filters.globalFilter).toBe('');
    });

    it('filters by country without inferring status', () => {
      const filters = buildApplicantListFiltersFromSmartAction(
        { country: 'Canada' },
        applicants
      );

      expect(filters.country).toBe('Canada');
      expect(filters.status).toBeNull();
      const canadaApplicant = applicants.find((applicant) =>
        applicant.location?.includes('Canada')
      )!;
      expect(filterApplicantList(applicants, filters)).toEqual([
        canadaApplicant,
      ]);
    });

    it('uses explicit LLM status and searchTerm only when provided', () => {
      const filters = buildApplicantListFiltersFromSmartAction(
        {
          status: ApplicationStatus.Shortlisted,
          searchTerm: 'product designer',
        },
        applicants
      );

      expect(filters.status).toBe(ApplicationStatus.Shortlisted);
      expect(filters.globalFilter).toBe('product designer');
    });

    it('uses exact roster labels from the validated LLM payload', () => {
      const filters = buildApplicantListFiltersFromSmartAction(
        {
          skills: ['React'],
          status: ApplicationStatus.Shortlisted,
          country: 'USA',
        },
        [
          ...applicants,
          {
            id: '4',
            name: 'Diego Alvarez',
            email: 'diego@example.com',
            phone: '+34',
            location: 'Madrid, Spain',
            yearsOfExperience: 4,
            applicationStatus: ApplicationStatus.Shortlisted,
            currentJobTitle: 'Full-stack Developer',
            skills: ['React'],
          },
        ]
      );

      expect(filters.skill).toBe('React');
      expect(filters.status).toBe(ApplicationStatus.Shortlisted);
      expect(filters.country).toBe('USA');
      expect(filters.globalFilter).toBe('');
    });
  });
});
