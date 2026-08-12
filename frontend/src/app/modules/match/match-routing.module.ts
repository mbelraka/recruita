import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MatchCandidatesComponent } from './components/match-candidates/match-candidates.component';
import { APP_CONFIG } from 'src/app/config/app.config';

const routes: Routes = [
  {
    path: APP_CONFIG.ROUTER.EMPTY_PATH,
    component: MatchCandidatesComponent,
  },
  {
    path: APP_CONFIG.ROUTER.WILDCARD_PATH,
    redirectTo: APP_CONFIG.ROUTER.EMPTY_PATH,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MatchRoutingModule {}
