import { initialMainState, mainReducer } from './main.reducer';

describe('mainReducer', () => {
  it('returns the initial state', () => {
    expect(mainReducer(undefined, { type: 'unknown' })).toEqual(
      initialMainState
    );
  });
});
