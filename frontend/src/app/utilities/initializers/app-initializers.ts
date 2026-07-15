import { inject, provideAppInitializer } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { EntityDataService } from '@ngrx/data';

import { registerRecruitaEntityDataServices } from '../../core/entity-data/register-recruita-entity-data-services.initializer';
import { ApplicantDataService } from '../../modules/applicants/data/applicant-data.service';
import { ProfileDataService } from '../../modules/main/data/profile-data.service';
import { registerMaterialSymbolsOutlinedFont } from './material-symbols-outlined-font.initializer';
import { startLocalization } from './start-localization.initializer';

export const appInitializerProviders = [
  provideAppInitializer(() => startLocalization()),
  provideAppInitializer(() => {
    registerRecruitaEntityDataServices(
      inject(EntityDataService),
      inject(ApplicantDataService),
      inject(ProfileDataService)
    )();
  }),
  provideAppInitializer(() => {
    registerMaterialSymbolsOutlinedFont(inject(MatIconRegistry))();
  }),
];
