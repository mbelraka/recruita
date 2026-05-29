import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from 'src/app/modules/main/components/main.component';
import { MainLangRefreshHostDirective } from 'src/app/modules/main/directives/main-lang-refresh-host.directive';

@NgModule({
  declarations: [MainComponent, MainLangRefreshHostDirective],
  imports: [CommonModule, MainRoutingModule, SharedModule],
})
export class MainModule {}
