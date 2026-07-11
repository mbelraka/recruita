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
  const rosterResult = {
    applicants: roster,
    notModified: false,
    etag: '"roster-1"',
    rosterVersion: 1,
  };

  beforeEach(() => {
    data = jasmine.createSpyObj<ApplicantDataService>('ApplicantDataService', [
      'loadRosterSync',
      'getAllFull',
    ]);
    data.loadRosterSync.and.returnValue(of(rosterResult));

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
              selectors$: {
                entityMap$: of({}),
              },
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
    Object.defineProperty(service, 'entities$', { value: of([]) });
    spyOn(service, 'addAllToCache');
    spyOn(service, 'setLoaded');
    spyOn(service, 'setLoading');

    const result = await firstValueFrom(service.loadRoster());

    expect(data.loadRosterSync).toHaveBeenCalledWith(null);
    expect(service.addAllToCache).toHaveBeenCalledWith(roster);
    expect(service.setLoaded).toHaveBeenCalledWith(true);
    expect(service.setLoading).toHaveBeenCalledWith(false);
    expect(result).toEqual(rosterResult);
  });

  it('areNotesLoadedForRoster returns true when the roster is empty', async () => {
    Object.defineProperty(service, 'entities$', { value: of([]) });

    const notesLoaded = await firstValueFrom(service.areNotesLoadedForRoster());

    expect(notesLoaded).toBe(true);
  });

  it('areNotesLoadedForRoster returns false when summary rows omit notes', async () => {
    Object.defineProperty(service, 'entities$', {
      value: of([createApplicant({ id: 'a-1', name: 'Alex', skills: [] })]),
    });

    const notesLoaded = await firstValueFrom(service.areNotesLoadedForRoster());

    expect(notesLoaded).toBe(false);
  });
});
