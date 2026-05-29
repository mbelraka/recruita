import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import {
  ReplaySubject,
  firstValueFrom,
  of,
  take,
  throwError,
  toArray,
} from 'rxjs';

import { Applicant } from '../../applicants/models/applicant.model';
import { ApplicantApiService } from '../../applicants/services/applicant-api.service';
import { loadApplicantsSuccess } from '../../applicants/state/applicants.actions';
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
  let applicantApi: jasmine.SpyObj<ApplicantApiService>;

  const fullApplicants = [
    new Applicant({
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
    applicantApi = jasmine.createSpyObj<ApplicantApiService>(
      'ApplicantApiService',
      ['listFull']
    );

    exportService.exportAsCSV.and.resolveTo();
    exportService.exportAsJSON.and.resolveTo();
    exportService.exportAsExcel.and.resolveTo();
    exportService.exportAsPDF.and.resolveTo();
    applicantApi.listFull.and.returnValue(of(fullApplicants));

    TestBed.configureTestingModule({
      providers: [
        ExportEffects,
        provideMockActions(() => actions$),
        { provide: ExportService, useValue: exportService },
        { provide: ApplicantApiService, useValue: applicantApi },
      ],
    });

    effects = TestBed.inject(ExportEffects);
  });

  it('refreshes full applicants then dispatches exportSuccess for CSV export', async () => {
    actions$.next(exportApplicants({ format: ExportFormats.CSV }));

    const emitted = await firstValueFrom(
      effects.exportApplicants$.pipe(take(2), toArray())
    );

    expect(emitted[0]).toEqual(
      loadApplicantsSuccess({ applicants: fullApplicants })
    );
    expect(emitted[1]).toEqual(exportSuccess());
    expect(applicantApi.listFull).toHaveBeenCalled();
    expect(exportService.exportAsCSV).toHaveBeenCalled();
  });

  it('dispatches exportFailure when the refresh fails', async () => {
    applicantApi.listFull.and.returnValue(
      throwError(() => new Error('refresh failed'))
    );
    actions$.next(exportApplicants({ format: ExportFormats.PDF }));

    const action = await firstValueFrom(effects.exportApplicants$);

    expect(applicantApi.listFull).toHaveBeenCalled();
    expect(exportService.exportAsPDF).not.toHaveBeenCalled();
    expect(action).toEqual(exportFailure({ error: 'refresh failed' }));
  });

  it('dispatches exportFailure when export throws after refresh', async () => {
    exportService.exportAsPDF.and.rejectWith(new Error('PDF failure'));
    actions$.next(exportApplicants({ format: ExportFormats.PDF }));

    const emitted = await firstValueFrom(
      effects.exportApplicants$.pipe(take(2), toArray())
    );

    expect(emitted[0]).toEqual(
      loadApplicantsSuccess({ applicants: fullApplicants })
    );
    expect(emitted[1]).toEqual(exportFailure({ error: 'PDF failure' }));
    expect(exportService.exportAsPDF).toHaveBeenCalled();
  });
});
