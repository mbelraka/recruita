import { expect, test } from '@playwright/test';

import { seededApplicantCount } from './support/demo-applicant-count';

test.describe('Match candidates flow', () => {
  test('evaluates seeded applicants and marks top three', async ({ page }) => {
    let candidatesCount = 0;

    await page.route('**/api/match', async (route) => {
      const payload = route.request().postDataJSON() as {
        candidates?: { id: string }[];
      };
      const candidates = payload.candidates ?? [];
      candidatesCount = candidates.length;

      const scores = candidates.map((candidate, index) => ({
        id: candidate.id,
        score: Math.max(0, 100 - index * 7),
        reasoning: `Deterministic match reasoning #${index + 1}`,
      }));

      await new Promise((resolve) => setTimeout(resolve, 350));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ scores }),
      });
    });

    // Applicants feature loads from the Prism mock (OpenAPI examples).
    const applicantsResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/applicants') &&
        response.request().method() === 'GET' &&
        !response.url().includes('/full')
    );
    await page.goto('/applicants');
    await expect(page).toHaveURL(/\/applicants(\/|$)/);
    const response = await applicantsResponse;
    const applicants = await response.json();
    expect(applicants.length).toBe(seededApplicantCount);
    await expect(page.locator('.applicant-grid__card').first()).toBeVisible();

    await page.goto('/match');
    await expect(page).toHaveURL(/\/match(\/|$)/);

    const descriptionField = page.locator(
      'textarea[matinput], textarea[matInput], textarea'
    );
    await descriptionField.fill(
      'Senior Angular engineer with strong NgRx, TypeScript, and scalable UI architecture experience.'
    );

    await page.getByRole('button', { name: /analyze and match/i }).click();

    await expect(
      page.getByText(/evaluating candidates|analyzing/i)
    ).toBeVisible();
    await expect(
      page.getByText(/evaluating candidates|analyzing/i)
    ).toBeHidden();

    await expect(page.locator('.match-candidates__card')).toHaveCount(3);
    expect(candidatesCount).toBe(seededApplicantCount);
    await expect(
      page.getByRole('heading', { name: /top candidates/i })
    ).toBeVisible();
    await expect(
      page.locator('.match-candidates__score-top').first()
    ).toBeVisible();
  });
});
