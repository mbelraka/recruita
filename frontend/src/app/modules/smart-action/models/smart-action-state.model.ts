import { ActionResult } from './action-result.interface';
import { ParsedAction } from './parsed-action.type';

export interface SmartActionFeatureState {
  readonly processing: boolean;
  readonly parseErrors: readonly string[] | null;
  readonly lastAction: ParsedAction | null;
  readonly result: ActionResult | null;
}
