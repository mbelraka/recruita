import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { APP_CONFIG } from './config/app.config';

const routes: Routes = [
  {
    path: APP_CONFIG.ROUTER.EMPTY_PATH,
    loadChildren: () =>
      import('./containers/root/root.module').then((m) => m.RootModule),
  },
  {
    path: APP_CONFIG.ROUTER.WILDCARD_PATH,
    redirectTo: APP_CONFIG.ROUTER.EMPTY_PATH,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
