import { ClarifyAction } from './clarify-action.type';
import { ExecutableAction } from './executable-action.type';

export type ParsedAction = ExecutableAction | ClarifyAction;
