import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { APP_CONFIG } from '../../../config/app.config';
import { ApplicantApiErrorMessage } from '../enums/applicant-api-error-message.enum';
import { Applicant } from '../models/applicant.model';
import { ApplicantApiService } from './applicant-api.service';

describe('ApplicantApiService', () => {
  let service: ApplicantApiService;
  let httpMock: HttpTestingController;

  const basePath = APP_CONFIG.APPLICANTS.API.BASE_PATH;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApplicantApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ApplicantApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('lists applicants from the API', async () => {
    const promise = firstValueFrom(service.list());

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
    expect(applicants[0].id).toBe('a-1');
    expect(applicants[0].name).toBe('Alex');
    expect(applicants[0].availableFrom).toEqual(new Date('2026-06-01'));
  });

  it('creates an applicant', async () => {
    const applicant = new Applicant({
      id: 'new-1',
      name: 'Sam',
      skills: ['Java'],
      availableFrom: new Date('2026-07-15T12:00:00.000Z'),
    });

    const promise = firstValueFrom(service.create(applicant));
    const req = httpMock.expectOne(basePath);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.availableFrom).toBe('2026-07-15');
    req.flush({ id: 'new-1', name: 'Sam', skills: ['Java'] });

    const created = await promise;
    expect(created.id).toBe('new-1');
  });

  it('maps backend error payloads to Error messages', async () => {
    const promise = firstValueFrom(service.list());

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
    const applicant = new Applicant({ id: 'dup', name: 'Dup', skills: ['x'] });
    const promise = firstValueFrom(service.create(applicant));

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
    const applicant = new Applicant({
      id: 'a-1',
      name: 'Alex',
      skills: ['Go'],
    });

    const updatePromise = firstValueFrom(service.update(applicant));
    const updateReq = httpMock.expectOne(`${basePath}/a-1`);
    expect(updateReq.request.method).toBe('PUT');
    updateReq.flush({ id: 'a-1', name: 'Alex', skills: ['Go'] });
    await expectAsync(updatePromise).toBeResolved();

    const deletePromise = firstValueFrom(service.delete('a-1'));
    const deleteReq = httpMock.expectOne(`${basePath}/a-1`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);
    await expectAsync(deletePromise).toBeResolved();
  });

  it('falls back to generic errors for non-problem payloads', async () => {
    const promise = firstValueFrom(service.list());

    const req = httpMock.expectOne(basePath);
    req.flush('server exploded', {
      status: 500,
      statusText: 'Server Error',
    });

    await expectAsync(promise).toBeRejectedWithError('server exploded');
  });

  it('uses the unreachable message when no backend detail exists', async () => {
    const promise = firstValueFrom(
      service.create(new Applicant({ id: 'x', name: 'X', skills: ['a'] }))
    );

    const req = httpMock.expectOne(basePath);
    req.flush(null, { status: 500, statusText: 'Server Error' });

    await expectAsync(promise).toBeRejectedWithError(
      ApplicantApiErrorMessage.Unreachable
    );
  });

  it('rethrows Error instances from the HTTP client', async () => {
    const promise = firstValueFrom(service.list());
    const req = httpMock.expectOne(basePath);
    req.error(new ProgressEvent('error'), {
      status: 0,
      statusText: 'Unknown Error',
    });

    await expectAsync(promise).toBeRejected();
  });
});
