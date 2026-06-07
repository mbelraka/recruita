import { ActionType } from '../enums/action-type.enum';
import {
  executeSmartActionSuccess,
  parseSmartActionFailure,
  submitSmartActionCommand,
} from './smart-action.actions';
import {
  initialSmartActionState,
  smartActionReducer,
} from './smart-action.reducer';

describe('smartActionReducer', () => {
  it('sets processing on submit', () => {
    const state = smartActionReducer(
      initialSmartActionState,
      submitSmartActionCommand({ command: 'find react devs' })
    );
    expect(state.processing).toBeTrue();
  });

  it('stores parse failures', () => {
    const state = smartActionReducer(
      initialSmartActionState,
      parseSmartActionFailure({ errors: ['bad command'] })
    );
    expect(state.processing).toBeFalse();
    expect(state.result?.success).toBeFalse();
  });

  it('stores execution success', () => {
    const state = smartActionReducer(
      { ...initialSmartActionState, processing: true },
      executeSmartActionSuccess({
        action: {
          type: ActionType.FilterApplicants,
          params: { skills: ['React'] },
        },
        result: { success: true, message: 'ok' },
        durationMs: 10,
      })
    );
    expect(state.processing).toBeFalse();
    expect(state.result?.success).toBeTrue();
  });
});
