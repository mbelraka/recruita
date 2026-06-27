import { ApplicantApiWriteRecord } from '../../src/app/modules/applicants/models/applicant-api-write-record.model';
import { applicantToApiWrite } from '../../src/app/modules/applicants/utilities/applicant-api.mapper';
import { buildDemoApplicants } from '../../src/app/utilities/seed/demo-applicants';

const initialRecords: ApplicantApiWriteRecord[] =
  buildDemoApplicants().map(applicantToApiWrite);

function toSummary(record: ApplicantApiWriteRecord) {
  const { notes, ...summary } = record;
  void notes;
  return summary;
}

/** In-memory mock for `/api/applicants` when Playwright runs without Docker. */
export function installApplicantsApiMock(
  page: import('@playwright/test').Page
): void {
  const records = new Map<string, ApplicantApiWriteRecord>(
    initialRecords.map((record) => [record.id, { ...record }])
  );

  page.route('**/api/applicants**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname.replace(/\/$/, '');
    const isFullList = pathname.endsWith('/full');
    const id = isFullList
      ? ''
      : decodeURIComponent(pathname.replace(/.*\/api\/applicants\/?/, ''));

    if (request.method() === 'GET' && isFullList) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([...records.values()]),
      });
      return;
    }

    if (request.method() === 'GET' && !id) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([...records.values()].map(toSummary)),
      });
      return;
    }

    if (request.method() === 'GET' && id) {
      const record = records.get(id);
      if (!record) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Not found.' }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(record),
      });
      return;
    }

    if (request.method() === 'POST' && !id && !isFullList) {
      const body = request.postDataJSON() as ApplicantApiWriteRecord;
      records.set(body.id, { ...body });
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
      return;
    }

    if (request.method() === 'PUT' && id) {
      const body = request.postDataJSON() as ApplicantApiWriteRecord;
      records.set(id, { ...body, id });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(records.get(id)),
      });
      return;
    }

    if (request.method() === 'DELETE' && id) {
      records.delete(id);
      await route.fulfill({ status: 204, body: '' });
      return;
    }

    await route.fulfill({
      status: 404,
      body: JSON.stringify({ error: 'Not found.' }),
    });
  });
}

export const seededApplicantCount = initialRecords.length;
