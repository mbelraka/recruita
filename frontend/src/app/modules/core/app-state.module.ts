import { NgModule } from '@angular/core';

import {
  DefaultDataServiceConfig,
  EntityDataModule,
  HttpUrlGenerator,
} from '@ngrx/data';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { StateFeatures } from '../../containers/root/enums/state-features.enum';
import { recruitaEntityMetadata } from '../../core/entity-data/entity-metadata';
import { recruitaEntityHttpResourceUrls } from '../../core/entity-data/recruita-entity-http-resource-urls';
import { RecruitaHttpUrlGenerator } from '../../core/entity-data/recruita-http-url-generator.service';
import { ApplicantDataService } from '../applicants/data/applicant-data.service';
import { ApplicantsEffects } from '../applicants/state/applicants.effects';
import { applicantsReducer } from '../applicants/state/applicants.reducer';
import { ProfileDataService } from '../main/data/profile-data.service';
import { MainEffects } from '../main/state/main.effects';
import { mainReducer } from '../main/state/main.reducer';

/** Eager NgRx slices required on every route (profile, applicants). */
@NgModule({
  imports: [
    EntityDataModule.forRoot({ entityMetadata: recruitaEntityMetadata }),
    StoreModule.forFeature(StateFeatures.Main, mainReducer),
    StoreModule.forFeature(StateFeatures.Applicants, applicantsReducer),
    EffectsModule.forFeature([MainEffects, ApplicantsEffects]),
  ],
  providers: [
    ApplicantDataService,
    ProfileDataService,
    {
      provide: DefaultDataServiceConfig,
      useValue: { entityHttpResourceUrls: recruitaEntityHttpResourceUrls },
    },
    { provide: HttpUrlGenerator, useClass: RecruitaHttpUrlGenerator },
  ],
})
export class AppStateModule {}
