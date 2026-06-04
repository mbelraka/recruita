import { TestBed } from '@angular/core/testing';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { firstValueFrom, of } from 'rxjs';

import { createApplicant } from '../utilities/applicant-domain.util';
import { ApplicantDataService } from './applicant-data.service';
import { ApplicantEntityCollectionService } from './applicant-entity-collection.service';

describe('ApplicantEntityCollectionService', () => {
  let service: ApplicantEntityCollectionService;
  let data: jasmine.SpyObj<ApplicantDataService>;

  const roster = [
    createApplicant({ id: 'a-1', name: 'Alex', skills: ['Angular'] }),
  ];

  beforeEach(() => {
    data = jasmine.createSpyObj<ApplicantDataService>('ApplicantDataService', [
      'getAll',
      'getAllFull',
    ]);
    data.getAll.and.returnValue(of(roster));

    TestBed.configureTestingModule({
      providers: [
        ApplicantEntityCollectionService,
        {
          provide: EntityCollectionServiceElementsFactory,
          useValue: {
            create: () => ({
              dispatcher: {},
              selectors: {
                selectEntities: () => [],
                collection$: of({ entities: {}, ids: [] }),
              },
              selectors$: {},
              guard: {},
              selectId: (entity: { id: string }) => entity.id,
              toUpdate: (entity: unknown) => entity,
            }),
          },
        },
        { provide: ApplicantDataService, useValue: data },
      ],
    });

    service = TestBed.inject(ApplicantEntityCollectionService);
  });

  it('loadRoster fetches via ApplicantDataService and replaces the cache', async () => {
    spyOn(service, 'addAllToCache');
    spyOn(service, 'setLoaded');
    spyOn(service, 'setLoading');

    const result = await firstValueFrom(service.loadRoster());

    expect(data.getAll).toHaveBeenCalled();
    expect(service.addAllToCache).toHaveBeenCalledWith(roster);
    expect(service.setLoaded).toHaveBeenCalledWith(true);
    expect(service.setLoading).toHaveBeenCalledWith(false);
    expect(result).toEqual(roster);
  });
});
