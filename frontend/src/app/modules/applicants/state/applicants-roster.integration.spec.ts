import { inject, provideAppInitializer } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  DefaultDataServiceConfig,
  EntityDataModule,
  EntityDataService,
  HttpUrlGenerator,
} from '@ngrx/data';
import { provideEffects } from '@ngrx/effects';
import { provideStore, Store } from '@ngrx/store';
import { filter, firstValueFrom, take } from 'rxjs';

import { APP_CONFIG } from '../../../config/app.config';
import { recruitaEntityMetadata } from '../../../core/entity-data/entity-metadata';
import { recruitaEntityHttpResourceUrls } from '../../../core/entity-data/recruita-entity-http-resource-urls';
import { RecruitaHttpUrlGenerator } from '../../../core/entity-data/recruita-http-url-generator.service';
import { registerRecruitaEntityDataServices } from '../../../core/entity-data/register-recruita-entity-data-services.initializer';
import { appReducer } from '../../../state/app.reducer';
import { ApplicantDataService } from '../data/applicant-data.service';
import { ProfileDataService } from '../../main/data/profile-data.service';
import { loadApplicants } from './applicants.actions';
import { ApplicantsEffects } from './applicants.effects';
import { selectAllApplicants } from './applicants.selectors';

describe('Applicants roster (NgRx Data integration)', () => {
  let store: Store;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EntityDataModule.forRoot({ entityMetadata: recruitaEntityMetadata }),
      ],
      providers: [
        provideStore({ app: appReducer }),
        provideEffects(ApplicantsEffects),
        ApplicantDataService,
        ProfileDataService,
        {
          provide: DefaultDataServiceConfig,
          useValue: { entityHttpResourceUrls: recruitaEntityHttpResourceUrls },
        },
        { provide: HttpUrlGenerator, useClass: RecruitaHttpUrlGenerator },
        provideAppInitializer(() => {
          registerRecruitaEntityDataServices(
            inject(EntityDataService),
            inject(ApplicantDataService),
            inject(ProfileDataService)
          )();
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('populates entityCache so selectAllApplicants returns API rows', async () => {
    store.dispatch(loadApplicants());

    const req = httpMock.expectOne(APP_CONFIG.APPLICANTS.API.BASE_PATH);
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        id: 'a-1',
        name: 'Alex',
        email: 'alex@example.com',
        skills: ['Angular'],
      },
    ]);

    const applicants = await firstValueFrom(
      store.select(selectAllApplicants).pipe(
        filter((rows) => rows.length > 0),
        take(1)
      )
    );

    expect(applicants.length).toBe(1);
    expect(applicants[0]!.id).toBe('a-1');
    expect(applicants[0]!.name).toBe('Alex');
  });
});
