import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { createApplicant } from '../utilities/applicant-domain.util';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpUrlGenerator } from '@ngrx/data';
import { firstValueFrom } from 'rxjs';

import { APP_CONFIG } from '../../../config/app.config';
import { HttpStatusCode } from '../../../enums/http-status-code.enum';
import { HttpApiInterceptor } from '../../../core/http/http-api.interceptor';
import { ApiConfiguration } from '../../../generated/api-client/api-configuration';
import { ApplicantsService } from '../../../generated/api-client/services/applicants.service';
import { ApplicantApiErrorMessage } from '../enums/applicant-api-error-message.enum';
import { ApplicantDataService } from './applicant-data.service';

const applicantHttpUrlGenerator: HttpUrlGenerator = {
  entityResource: () => `${APP_CONFIG.APPLICANTS.API.BASE_PATH}/`,
  collectionResource: () => APP_CONFIG.APPLICANTS.API.BASE_PATH,
  registerHttpResourceUrls: () => undefined,
};

describe('ApplicantDataService', () => {
  let service: ApplicantDataService;
  let httpMock: HttpTestingController;

  const basePath = APP_CONFIG.APPLICANTS.API.BASE_PATH;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApplicantDataService,
        ApplicantsService,
        { provide: ApiConfiguration, useValue: { rootUrl: '' } },
        { provide: HttpUrlGenerator, useValue: applicantHttpUrlGenerator },
        provideHttpClient(withInterceptorsFromDi()),
        {
          provide: HTTP_INTERCEPTORS,
          useClass: HttpApiInterceptor,
          multi: true,
        },
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ApplicantDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('lists applicants from the API', async () => {
    const promise = firstValueFrom(service.getAll());

    const req = httpMock.expectOne(basePath);
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        id: 'a-1',
        name: 'Alex',
        skills: ['Angular'],
        availableFrom: '2026-06-01',
      },
    ]);

    const applicants = await promise;
    expect(applicants.length).toBe(1);
    expect(applicants[0]!.id).toBe('a-1');
    expect(applicants[0]!.name).toBe('Alex');
    expect(applicants[0]!.availableFrom).toEqual(new Date('2026-06-01'));
    expect(applicants[0]!.notes).toBeUndefined();
  });

  it('returns a not-modified roster result for HTTP 304', async () => {
    const promise = firstValueFrom(service.loadRosterSync('"roster-1"'));

    const req = httpMock.expectOne(basePath);
    expect(req.request.headers.get('If-None-Match')).toBe('"roster-1"');
    req.flush(null, {
      status: HttpStatusCode.NotModified,
      statusText: 'Not Modified',
      headers: {
        ETag: '"roster-1"',
        [APP_CONFIG.APPLICANTS.API.ROSTER_VERSION_RESPONSE_HEADER]: '3',
      },
    });

    const result = await promise;
    expect(result.notModified).toBeTrue();
    expect(result.applicants).toBeNull();
    expect(result.etag).toBe('"roster-1"');
    expect(result.rosterVersion).toBe(3);
  });

  it('lists full applicants with notes for export refresh', async () => {
    const promise = firstValueFrom(service.getAllFull());

    const req = httpMock.expectOne(APP_CONFIG.APPLICANTS.API.FULL_LIST_PATH);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 'a-1', name: 'Alex', skills: [], notes: 'detail' }]);

    const applicants = await promise;
    expect(applicants[0]!.notes).toBe('detail');
  });

  it('loads a single applicant by id', async () => {
    const promise = firstValueFrom(service.getById('a-1'));

    const req = httpMock.expectOne(
      `${APP_CONFIG.APPLICANTS.API.BASE_PATH}/a-1`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'a-1', name: 'Alex', skills: [], notes: 'notes' });

    const applicant = await promise;
    expect(applicant.notes).toBe('notes');
  });

  it('creates an applicant', async () => {
    const applicant = createApplicant({
      id: 'new-1',
      name: 'Sam',
      skills: ['Java'],
      availableFrom: new Date('2026-07-15T12:00:00.000Z'),
    });

    const promise = firstValueFrom(service.add(applicant));
    const req = httpMock.expectOne(basePath);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.availableFrom).toBe('2026-07-15');
    req.flush({ id: 'new-1', name: 'Sam', skills: ['Java'] });

    const created = await promise;
    expect(created.id).toBe('new-1');
  });

  it('maps backend error payloads to Error messages', async () => {
    const promise = firstValueFrom(service.getAll());

    const req = httpMock.expectOne(basePath);
    req.flush(
      { error: 'Applicant not found.' },
      { status: 404, statusText: 'Not Found' }
    );

    await expectAsync(promise).toBeRejectedWithError(
      ApplicantApiErrorMessage.NotAvailable
    );
  });

  it('maps ProblemDetail-style errors on create', async () => {
    const applicant = createApplicant({
      id: 'dup',
      name: 'Dup',
      skills: ['x'],
    });
    const promise = firstValueFrom(service.add(applicant));

    const req = httpMock.expectOne(basePath);
    req.flush(
      { error: 'An applicant with this id already exists.' },
      { status: 409, statusText: 'Conflict' }
    );

    await expectAsync(promise).toBeRejectedWithError(
      'An applicant with this id already exists.'
    );
  });

  it('updates and deletes applicants', async () => {
    const applicant = createApplicant({
      id: 'a-1',
      name: 'Alex',
      skills: ['Go'],
    });

    const updatePromise = firstValueFrom(
      service.update({ id: applicant.id, changes: applicant })
    );
    const updateReq = httpMock.expectOne(
      `${APP_CONFIG.APPLICANTS.API.BASE_PATH}/a-1`
    );
    expect(updateReq.request.method).toBe('PUT');
    updateReq.flush({ id: 'a-1', name: 'Alex', skills: ['Go'] });
    await expectAsync(updatePromise).toBeResolved();

    const deletePromise = firstValueFrom(service.delete('a-1'));
    const deleteReq = httpMock.expectOne(
      `${APP_CONFIG.APPLICANTS.API.BASE_PATH}/a-1`
    );
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);
    await expectAsync(deletePromise).toBeResolved();
  });

  it('falls back to generic errors for non-problem payloads', async () => {
    const promise = firstValueFrom(service.getAll());

    const req = httpMock.expectOne(basePath);
    req.flush('server exploded', {
      status: 500,
      statusText: 'Server Error',
    });

    await expectAsync(promise).toBeRejectedWithError('server exploded');
  });

  it('uses the unreachable message when no backend detail exists', async () => {
    const promise = firstValueFrom(
      service.add(createApplicant({ id: 'x', name: 'X', skills: ['a'] }))
    );

    const req = httpMock.expectOne(basePath);
    req.flush(null, { status: 500, statusText: 'Server Error' });

    await expectAsync(promise).toBeRejectedWithError(
      ApplicantApiErrorMessage.Unreachable
    );
  });

  it('rethrows Error instances from the HTTP client', async () => {
    const promise = firstValueFrom(service.getAll());
    const req = httpMock.expectOne(basePath);
    req.error(new ProgressEvent('error'), {
      status: 0,
      statusText: 'Unknown Error',
    });

    await expectAsync(promise).toBeRejected();
  });
});
