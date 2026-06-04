import { firstValueFrom, of, throwError } from 'rxjs';
import { createApplicant } from '../../applicants/utilities/applicant-domain.util';

import { HttpClient } from '@angular/common/http';

import { Languages } from '../../../enums/language.enum';
import { PrivacyConsentService } from '../../../services/privacy-consent.service';
import { MATCH_ERROR_PRIVACY_AI_DISABLED } from '../constants/match-error-codes';
import { ApplicationStatus } from '../../applicants/enums/application-status.enum';
import { Applicant } from '../../applicants/models/applicant.model';
import { MatchGroqResponseParser } from './match-groq-response.parser';
import { MatchCandidatesService } from './match-candidates.service';

describe('MatchCandidatesService', () => {
  let service: MatchCandidatesService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let privacySpy: jasmine.SpyObj<
    Pick<PrivacyConsentService, 'allowsAiMatching'>
  >;

  const applicants: Applicant[] = [
    createApplicant({ id: 'a1', name: 'Alice', skills: ['Angular'] }),
    createApplicant({ id: 'a2', name: 'Bob', skills: ['React'] }),
  ];

  beforeEach(() => {
    let correlationSeq = 0;
    spyOn(globalThis.crypto, 'randomUUID').and.callFake(() => {
      correlationSeq += 1;
      return `llm-temp-${correlationSeq}` as ReturnType<Crypto['randomUUID']>;
    });

    httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', ['post']);
    privacySpy = jasmine.createSpyObj('PrivacyConsentService', [
      'allowsAiMatching',
    ]);
    privacySpy.allowsAiMatching.and.returnValue(true);
    service = new MatchCandidatesService(
      httpClientSpy,
      privacySpy as unknown as PrivacyConsentService,
      new MatchGroqResponseParser()
    );
  });

  it('should throw when job description is empty', async () => {
    await expectAsync(
      firstValueFrom(service.evaluate('   ', applicants, 3, Languages.English))
    ).toBeRejected();
    expect(httpClientSpy.post).not.toHaveBeenCalled();
  });

  it('should return an error when there are no applicants', async () => {
    await expectAsync(
      firstValueFrom(
        service.evaluate('Angular developer', [], 3, Languages.English)
      )
    ).toBeRejected();
    expect(httpClientSpy.post).not.toHaveBeenCalled();
  });

  it('should reject when AI matching consent is disabled', async () => {
    privacySpy.allowsAiMatching.and.returnValue(false);

    await expectAsync(
      firstValueFrom(service.evaluate('Role', applicants, 1, Languages.English))
    ).toBeRejectedWithError(Error, MATCH_ERROR_PRIVACY_AI_DISABLED);
    expect(httpClientSpy.post).not.toHaveBeenCalled();
  });

  it('sends anonymized candidates without personal fields to the proxy', async () => {
    const rich = [
      createApplicant({
        id: 'a1',
        name: 'Alice Example',
        email: 'alice@example.com',
        phone: '+1-555',
        location: 'Zurich',
        skills: ['Angular'],
        notes: 'Internal HR note',
        applicationStatus: ApplicationStatus.Screening,
        yearsOfExperience: 4,
        currentJobTitle: 'Frontend developer',
      }),
    ];

    httpClientSpy.post.and.returnValue(
      of({
        scores: [
          {
            id: 'llm-temp-1',
            matchScore: 80,
            recommendation: 'ok',
            candidateProfile: {},
          },
        ],
      })
    );

    await firstValueFrom(
      service.evaluate('Senior dev', rich, 1, Languages.English)
    );

    const body = httpClientSpy.post.calls.mostRecent().args[1] as {
      candidates: Array<Record<string, unknown>>;
    };
    expect(body.candidates.length).toBe(1);
    const c = body.candidates[0];
    expect(c).toEqual({
      id: 'llm-temp-1',
      skills: ['Angular'],
      yearsOfExperience: 4,
      currentJobTitle: 'Frontend developer',
    });
    expect(c['id']).not.toBe(rich[0].id);
    expect('name' in c).toBeFalse();
    expect('email' in c).toBeFalse();
    expect('phone' in c).toBeFalse();
    expect('location' in c).toBeFalse();
    expect('notes' in c).toBeFalse();
    expect('applicationStatus' in c).toBeFalse();
  });

  it('should map and rank candidates with top-n flags', async () => {
    httpClientSpy.post.and.returnValue(
      of({
        scores: [
          {
            id: 'llm-temp-2',
            matchScore: 95,
            recommendation: 'Great fit',
            matchingSkills: ['React'],
            missingSkills: ['NgRx'],
            candidateProfile: {
              skills: ['React'],
              yearsExperience: 5,
              topJobTitles: ['Frontend Engineer'],
              education: 'BSc',
            },
          },
          {
            id: 'llm-temp-1',
            matchScore: 80,
            recommendation: 'Good fit',
            matchingSkills: ['Angular'],
            missingSkills: ['Jest'],
            candidateProfile: {
              skills: ['Angular'],
              yearsExperience: 4,
              topJobTitles: ['UI Engineer'],
              education: 'MSc',
            },
          },
        ],
      })
    );

    const result = await firstValueFrom(
      service.evaluate('Senior frontend role', applicants, 1, Languages.English)
    );
    expect(result.length).toBe(2);
    expect(result[0].applicant.id).toBe('a2');
    expect(result[0].isTopCandidate).toBeTrue();
    expect(result[1].isTopCandidate).toBeFalse();
    expect(result[0].reasoning).toBe('Great fit');
  });

  it('should clamp and default invalid model values', async () => {
    httpClientSpy.post.and.returnValue(
      of({
        scores: [
          {
            id: 'llm-temp-1',
            matchScore: 999,
            recommendation: 'x',
            candidateProfile: {},
          },
          {
            id: 'llm-temp-2',
            matchScore: Number.NaN,
            recommendation: 'y',
            candidateProfile: {},
          },
        ],
      })
    );

    const result = await firstValueFrom(
      service.evaluate('Frontend role', applicants, 2, Languages.English)
    );
    expect(result.find((r) => r.applicant.id === 'a1')?.score).toBe(100);
    expect(result.find((r) => r.applicant.id === 'a2')?.score).toBe(0);
  });

  it('should parse string-based and alternate score fields', async () => {
    httpClientSpy.post.and.returnValue(
      of({
        scores: [
          {
            id: 'llm-temp-1',
            score: '85%',
            recommendation: 'Strong fit',
            candidateProfile: {},
          },
          {
            id: 'llm-temp-2',
            overallScore: '72',
            recommendation: 'Moderate fit',
            candidateProfile: {},
          },
        ],
      })
    );

    const result = await firstValueFrom(
      service.evaluate('Frontend role', applicants, 2, Languages.English)
    );
    expect(result.find((r) => r.applicant.id === 'a1')?.score).toBe(85);
    expect(result.find((r) => r.applicant.id === 'a2')?.score).toBe(72);
  });

  it('should parse alternate response collection and candidateId keys', async () => {
    httpClientSpy.post.and.returnValue(
      of({
        results: [
          {
            candidateId: 'llm-temp-1',
            totalScore: '91',
            recommendation: 'Great',
          },
          {
            applicantId: 'llm-temp-2',
            score: '67',
            recommendation: 'Okay',
          },
        ],
      })
    );

    const result = await firstValueFrom(
      service.evaluate('Frontend role', applicants, 2, Languages.English)
    );
    expect(result.find((r) => r.applicant.id === 'a1')?.score).toBe(91);
    expect(result.find((r) => r.applicant.id === 'a2')?.score).toBe(67);
  });

  it('should match scores by response order when model ids are opaque (index fallback)', async () => {
    httpClientSpy.post.and.returnValue(
      of({
        scores: [
          {
            id: 'x-unknown-1',
            name: 'Alice',
            matchScore: 88,
          },
          {
            id: 'x-unknown-2',
            name: 'Bob',
            matchScore: 73,
          },
        ],
      })
    );

    const result = await firstValueFrom(
      service.evaluate('Frontend role', applicants, 2, Languages.English)
    );
    expect(result.find((r) => r.applicant.id === 'a1')?.score).toBe(88);
    expect(result.find((r) => r.applicant.id === 'a2')?.score).toBe(73);
  });

  it('should parse nested score objects and normalize 0..1 scores', async () => {
    httpClientSpy.post.and.returnValue(
      of({
        scores: [
          {
            id: 'llm-temp-1',
            matchScore: { value: 0.91 },
            recommendation: 'Great fit',
          },
          {
            id: 'llm-temp-2',
            matchScore: { score: '0.73' },
            recommendation: 'Good fit',
          },
        ],
      })
    );

    const result = await firstValueFrom(
      service.evaluate('Frontend role', applicants, 2, Languages.English)
    );
    expect(result.find((r) => r.applicant.id === 'a1')?.score).toBe(91);
    expect(result.find((r) => r.applicant.id === 'a2')?.score).toBe(73);
  });

  it('should surface proxy unavailability error', async () => {
    httpClientSpy.post.and.returnValue(
      throwError(() => new Error('connection refused'))
    );
    await expectAsync(
      firstValueFrom(service.evaluate('Role', applicants, 1, Languages.English))
    ).toBeRejected();
  });

  it('falls back to generic proxy error for unknown error shapes', async () => {
    httpClientSpy.post.and.returnValue(throwError(() => ({ status: 500 })));

    await expectAsync(
      firstValueFrom(service.evaluate('Role', applicants, 1, Languages.English))
    ).toBeRejected();
  });

  it('ignores score entries without id and name identity', async () => {
    httpClientSpy.post.and.returnValue(
      of({
        scores: [{ matchScore: 95, recommendation: 'Should be ignored' }],
      })
    );

    const result = await firstValueFrom(
      service.evaluate('Frontend role', applicants, 1, Languages.English)
    );

    expect(result.find((r) => r.applicant.id === 'a1')?.score).toBe(0);
    expect(result.find((r) => r.applicant.id === 'a2')?.score).toBe(0);
  });

  it('defaults to minimum score when nested score payload is unsupported', async () => {
    httpClientSpy.post.and.returnValue(
      of({
        scores: [
          {
            id: 'llm-temp-1',
            matchScore: { unsupported: 'value' },
            recommendation: 'No usable score',
          },
        ],
      })
    );

    const result = await firstValueFrom(
      service.evaluate('Frontend role', applicants, 1, Languages.English)
    );

    expect(result.find((r) => r.applicant.id === 'a1')?.score).toBe(0);
  });
});
