import { ActionType } from '../enums/action-type.enum';
import { mapParseActionResponse } from './map-parse-action-response.util';

describe('mapParseActionResponse', () => {
  it('maps valid backend responses', () => {
    const action = mapParseActionResponse({
      valid: true,
      action: {
        type: ActionType.FilterApplicants,
        params: { skills: ['React'] },
      },
      errors: [],
    });

    expect(action?.type).toBe(ActionType.FilterApplicants);
  });

  it('returns null for invalid responses', () => {
    expect(
      mapParseActionResponse({
        valid: false,
        action: {},
        errors: ['bad'],
      })
    ).toBeNull();
  });
});
