import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SmartActionPageComponent } from './components/smart-action-page/smart-action-page.component';
import { APP_CONFIG } from 'src/app/config/app.config';

const routes: Routes = [
  {
    path: APP_CONFIG.ROUTER.EMPTY_PATH,
    component: SmartActionPageComponent,
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
export class SmartActionRoutingModule {}
