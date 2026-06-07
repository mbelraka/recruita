import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SmartActionPageComponent } from './components/smart-action-page/smart-action-page.component';

const routes: Routes = [
  { path: '', component: SmartActionPageComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SmartActionRoutingModule {}
