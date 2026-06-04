import { expect, test } from '@playwright/test';

import {
  installApplicantsApiMock,
  seededApplicantCount,
} from './support/applicants-api.mock';

test.describe('Match candidates flow', () => {
  test('evaluates seeded applicants and marks top three', async ({ page }) => {
    installApplicantsApiMock(page);

    let candidatesCount = 0;

    await page.route('**/api/match', async (route) => {
      const payload = route.request().postDataJSON() as {
        candidates?: Array<{ id: string }>;
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

    // Applicants feature loads from the mocked API (preloaded demo rows).
    await page.goto('/applicants');
    await expect(page).toHaveURL(/\/applicants(\/|$)/);
    await expect(page.locator('.applicant-grid__card')).toHaveCount(
      seededApplicantCount
    );

    await page.goto('/match');
    await expect(page).toHaveURL(/\/match(\/|$)/);

    const descriptionField = page.locator(
      'textarea[matinput], textarea[matInput], textarea'
    );
    await descriptionField.fill(
      'Senior Angular engineer with strong NgRx, TypeScript, and scalable UI architecture experience.'
    );

    await page.getByRole('button', { name: /evaluate candidates/i }).click();

    await expect(page.getByText(/evaluating candidates/i)).toBeVisible();
    await expect(page.getByText(/evaluating candidates/i)).toBeHidden();

    await expect(page.locator('.match-candidates__card')).toHaveCount(
      candidatesCount
    );
    await expect(page.locator('.match-candidates__card--top')).toHaveCount(3);
    await expect(page.getByText(/Evaluated .* Top 3/i)).toBeVisible();
  });
});
