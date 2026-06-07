import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { StateFeatures } from '../../containers/root/enums/state-features.enum';
import { SharedModule } from '../../shared/shared.module';
import { SmartActionPageComponent } from './components/smart-action-page/smart-action-page.component';
import { SmartInputComponent } from './components/smart-input/smart-input.component';
import { SmartActionRoutingModule } from './smart-action-routing.module';
import { SmartActionEffects } from './state/smart-action.effects';
import { smartActionReducer } from './state/smart-action.reducer';

@NgModule({
  declarations: [SmartActionPageComponent, SmartInputComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    SmartActionRoutingModule,
    StoreModule.forFeature(StateFeatures.SmartAction, smartActionReducer),
    EffectsModule.forFeature([SmartActionEffects]),
  ],
})
export class SmartActionModule {}
