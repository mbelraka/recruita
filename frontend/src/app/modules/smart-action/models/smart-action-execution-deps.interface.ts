import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { FullState } from '../../../models/full-state.model';

export interface SmartActionExecutionDeps {
  readonly store: Store<FullState>;
  readonly router: Router;
}
