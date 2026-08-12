import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { APP_CONFIG, APP_ROUTE_PATHS } from 'src/app/config/app.config';
import { RootComponent } from 'src/app/containers/root/root/root.component';

const routes: Routes = [
  {
    path: APP_CONFIG.ROUTER.EMPTY_PATH,
    component: RootComponent,
    children: [
      {
        path: APP_ROUTE_PATHS.MAIN,
        loadChildren: () =>
          import('../../modules/main/main.module').then((m) => m.MainModule),
      },
      {
        path: APP_ROUTE_PATHS.APPLICANTS,
        loadChildren: () =>
          import('../../modules/applicants/applicants.module').then(
            (m) => m.ApplicantsModule
          ),
      },
      {
        path: APP_ROUTE_PATHS.MATCH,
        loadChildren: () =>
          import('../../modules/match/match.module').then((m) => m.MatchModule),
      },
      {
        path: APP_ROUTE_PATHS.EXPORT,
        loadChildren: () =>
          import('../../modules/export/export.module').then(
            (m) => m.ExportModule
          ),
      },
      {
        path: APP_ROUTE_PATHS.SMART_ACTION,
        loadChildren: () =>
          import('../../modules/smart-action/smart-action.module').then(
            (m) => m.SmartActionModule
          ),
      },
      {
        path: APP_ROUTE_PATHS.PRIVACY,
        loadComponent: () =>
          import('./privacy/privacy-page.component').then(
            (m) => m.PrivacyPageComponent
          ),
      },
      {
        path: APP_CONFIG.ROUTER.EMPTY_PATH,
        redirectTo: APP_ROUTE_PATHS.MAIN,
        pathMatch: APP_CONFIG.ROUTER.PATH_MATCH_FULL,
      },
      {
        path: APP_CONFIG.ROUTER.WILDCARD_PATH,
        redirectTo: APP_ROUTE_PATHS.MAIN,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RootRoutingModule {}
