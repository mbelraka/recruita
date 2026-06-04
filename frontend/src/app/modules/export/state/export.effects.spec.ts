import { TestBed } from '@angular/core/testing';
import { createApplicant } from '../../applicants/utilities/applicant-domain.util';
import { provideMockActions } from '@ngrx/effects/testing';
import { ReplaySubject, firstValueFrom, of, throwError } from 'rxjs';

import { ApplicantEntityCollectionService } from '../../applicants/data/applicant-entity-collection.service';
import { ExportService } from '../services/export.service';
import { ExportFormats } from '../enums/export-formats.enum';
import {
  exportApplicants,
  exportFailure,
  exportSuccess,
} from './export.actions';
import { ExportEffects } from './export.effects';

describe('ExportEffects', () => {
  let actions$: ReplaySubject<ReturnType<typeof exportApplicants>>;
  let effects: ExportEffects;
  let exportService: jasmine.SpyObj<ExportService>;
  let applicants: jasmine.SpyObj<ApplicantEntityCollectionService>;

  const fullApplicants = [
    createApplicant({
      id: 'a-1',
      name: 'Alex',
      skills: ['Angular'],
      notes: 'detail',
    }),
  ];

  beforeEach(() => {
    actions$ = new ReplaySubject(1);
    exportService = jasmine.createSpyObj<ExportService>('ExportService', [
      'exportAsCSV',
      'exportAsJSON',
      'exportAsExcel',
      'exportAsPDF',
    ]);
    applicants = jasmine.createSpyObj<ApplicantEntityCollectionService>(
      'ApplicantEntityCollectionService',
      ['loadFull']
    );

    exportService.exportAsCSV.and.resolveTo();
    exportService.exportAsJSON.and.resolveTo();
    exportService.exportAsExcel.and.resolveTo();
    exportService.exportAsPDF.and.resolveTo();
    applicants.loadFull.and.returnValue(of(fullApplicants));

    TestBed.configureTestingModule({
      providers: [
        ExportEffects,
        provideMockActions(() => actions$),
        { provide: ExportService, useValue: exportService },
        { provide: ApplicantEntityCollectionService, useValue: applicants },
      ],
    });

    effects = TestBed.inject(ExportEffects);
  });

  it('refreshes full applicants then dispatches exportSuccess for CSV export', async () => {
    actions$.next(exportApplicants({ format: ExportFormats.CSV }));

    const action = await firstValueFrom(effects.exportApplicants$);

    expect(action).toEqual(exportSuccess());
    expect(applicants.loadFull).toHaveBeenCalled();
    expect(exportService.exportAsCSV).toHaveBeenCalled();
  });

  it('dispatches exportFailure when the refresh fails', async () => {
    applicants.loadFull.and.returnValue(
      throwError(() => new Error('refresh failed'))
    );
    actions$.next(exportApplicants({ format: ExportFormats.PDF }));

    const action = await firstValueFrom(effects.exportApplicants$);

    expect(applicants.loadFull).toHaveBeenCalled();
    expect(exportService.exportAsPDF).not.toHaveBeenCalled();
    expect(action).toEqual(exportFailure({ error: 'refresh failed' }));
  });

  it('dispatches exportFailure when export throws after refresh', async () => {
    exportService.exportAsPDF.and.rejectWith(new Error('PDF failure'));
    actions$.next(exportApplicants({ format: ExportFormats.PDF }));

    const action = await firstValueFrom(effects.exportApplicants$);

    expect(applicants.loadFull).toHaveBeenCalled();
    expect(action).toEqual(exportFailure({ error: 'PDF failure' }));
  });
});
