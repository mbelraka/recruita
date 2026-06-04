import { createReducer } from '@ngrx/store';

import { MainState } from '../models/main-state.model';

export const initialMainState: MainState = {};

/** Reserved for future cross-route main feature state; profile rows live in NgRx Data. */
export const mainReducer = createReducer(initialMainState);
