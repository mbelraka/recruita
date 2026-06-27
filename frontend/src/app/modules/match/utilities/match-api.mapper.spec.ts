import type { MatchRequestDto } from '../../../generated/api/types';
import { Languages } from '../../../enums/language.enum';
import type { MatchProxyRequestBody } from '../models/match-proxy-request-body.model';
import { toMatchRequestDto } from './match-api.mapper';

describe('match-api.mapper', () => {
  it('maps proxy bodies to MatchRequestDto without client-only hints', () => {
    const proxyBody: MatchProxyRequestBody = {
      jobDescription: 'Senior Angular engineer',
      deterministic: true,
      language: Languages.English,
      locale: 'en-US',
      candidates: [
        {
          id: 'temp-1',
          skills: ['Angular'],
          yearsOfExperience: 5,
          currentJobTitle: 'Frontend engineer',
        },
      ],
    };

    const wireBody: MatchRequestDto = toMatchRequestDto(proxyBody);

    expect(wireBody).toEqual({
      jobDescription: 'Senior Angular engineer',
      deterministic: true,
      candidates: [
        {
          id: 'temp-1',
          skills: ['Angular'],
          yearsOfExperience: 5,
          currentJobTitle: 'Frontend engineer',
        },
      ],
    });
    expect('language' in wireBody).toBeFalse();
    expect('locale' in wireBody).toBeFalse();
  });

  it('omits nullable yearsOfExperience when absent on the wire', () => {
    const wireBody = toMatchRequestDto({
      candidates: [
        {
          id: 'temp-2',
          skills: [],
          yearsOfExperience: null,
          currentJobTitle: '',
        },
      ],
    });

    expect(wireBody.candidates[0]?.yearsOfExperience).toBeUndefined();
  });
});
