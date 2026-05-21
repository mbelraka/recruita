import { buildDemoApplicants } from '../src/app/utilities/seed/demo-applicants';
import { applicantToApiWrite } from '../src/app/modules/applicants/utilities/applicant-api.mapper';

const initialRecords = buildDemoApplicants().map(applicantToApiWrite);

/** In-memory mock for `/api/applicants` when Playwright runs without Docker. */
export function installApplicantsApiMock(
  page: import('@playwright/test').Page
): void {
  const records = new Map(
    initialRecords.map((record) => [record.id, { ...record }] as const)
  );

  page.route('**/api/applicants**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const suffix = url.pathname.replace(/\/api\/applicants\/?/, '');
    const id = suffix ? decodeURIComponent(suffix) : '';

    if (request.method() === 'GET' && !id) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([...records.values()]),
      });
      return;
    }

    if (request.method() === 'POST' && !id) {
      const body = request.postDataJSON() as (typeof initialRecords)[number];
      records.set(body.id, { ...body });
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
      return;
    }

    if (request.method() === 'PUT' && id) {
      const body = request.postDataJSON() as (typeof initialRecords)[number];
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
