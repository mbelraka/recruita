import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from 'src/app/modules/main/components/main.component';
import { APP_CONFIG } from 'src/app/config/app.config';

const routes: Routes = [
  {
    path: APP_CONFIG.ROUTER.EMPTY_PATH,
    component: MainComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainRoutingModule {}
