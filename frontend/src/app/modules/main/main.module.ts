import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from 'src/app/shared/shared.module';
import { StateFeatures } from 'src/app/containers/root/enums/state-features.enum';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from 'src/app/modules/main/components/main.component';
import { MainLangRefreshHostDirective } from 'src/app/modules/main/directives/main-lang-refresh-host.directive';
import { MainEffects } from './state/main.effects';
import { mainReducer } from './state/main.reducer';

@NgModule({
  declarations: [MainComponent, MainLangRefreshHostDirective],
  imports: [
    CommonModule,
    MainRoutingModule,
    SharedModule,
    StoreModule.forFeature(StateFeatures.Main, mainReducer),
    EffectsModule.forFeature([MainEffects]),
  ],
})
export class MainModule {}
