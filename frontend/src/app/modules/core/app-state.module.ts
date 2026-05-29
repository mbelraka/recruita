import { NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { StateFeatures } from '../../containers/root/enums/state-features.enum';
import { ApplicantsEffects } from '../applicants/state/applicants.effects';
import { applicantsReducer } from '../applicants/state/applicants.reducer';
import { MainEffects } from '../main/state/main.effects';
import { mainReducer } from '../main/state/main.reducer';

/** Eager NgRx slices required on every route (profile, applicants). */
@NgModule({
  imports: [
    StoreModule.forFeature(StateFeatures.Main, mainReducer),
    StoreModule.forFeature(StateFeatures.Applicants, applicantsReducer),
    EffectsModule.forFeature([MainEffects, ApplicantsEffects]),
  ],
})
export class AppStateModule {}
