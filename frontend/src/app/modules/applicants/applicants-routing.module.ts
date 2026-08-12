import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ApplicantsComponent } from 'src/app/modules/applicants/components/applicants/applicants.component';
import { APP_CONFIG } from 'src/app/config/app.config';

const routes: Routes = [
  {
    path: APP_CONFIG.ROUTER.EMPTY_PATH,
    component: ApplicantsComponent,
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
export class ApplicantsRoutingModule {}
