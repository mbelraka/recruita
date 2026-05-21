import { test, expect } from '@playwright/test';

import { installApplicantsApiMock } from './support/applicants-api.mock';

test.describe('Applicant app', () => {
  test('redirects to main route and shows landing shell', async ({ page }) => {
    installApplicantsApiMock(page);
    await page.goto('/');
    await expect(page).toHaveURL(/\/main(\/|$)/);
    await expect(page.locator('.main-container')).toBeVisible();
  });

  test('primary CTA navigates to applicants', async ({ page }) => {
    installApplicantsApiMock(page);
    await page.goto('/main');
    await page.locator('button.main-cta').first().click();
    await expect(page).toHaveURL(/\/applicants(\/|$)/);
  });
});
