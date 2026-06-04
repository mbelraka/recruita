import { MatchGroqResponseParser } from './match-groq-response.parser';

describe('MatchGroqResponseParser', () => {
  const parser = new MatchGroqResponseParser();

  it('parses numeric score shapes', () => {
    const scores = parser.parseScores({
      scores: [
        { id: 'temp-1', matchScore: 82, recommendation: 'Strong fit' },
        { id: 'temp-2', score: 55, recommendation: 'Moderate fit' },
      ],
    });

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
