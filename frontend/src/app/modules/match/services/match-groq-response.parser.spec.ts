import { MatchGroqResponseParser } from './match-groq-response.parser';
import type { MatchApiResponse } from '../models/match-api-response.model';

describe('MatchGroqResponseParser', () => {
  const parser = new MatchGroqResponseParser();

  it('parses numeric score shapes', () => {
    const payload: MatchApiResponse = {
      scores: [
        { id: 'temp-1', matchScore: 82, recommendation: 'Strong fit' },
        { id: 'temp-2', matchScore: 55, recommendation: 'Moderate fit' },
      ],
    };
    const scores = parser.parseScores(payload);

    expect(scores.length).toBe(2);
    expect(scores[0]?.matchScore).toBe(82);
    expect(scores[1]?.matchScore).toBe(55);
  });

  it('ignores entries without identity', () => {
    const scores = parser.parseScores({
      scores: [{ recommendation: 'Anonymous' }],
    });

    expect(scores).toEqual([]);
  });
});
