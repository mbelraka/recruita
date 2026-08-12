import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

import { A11Y_E2E } from './support/a11y.constants';

async function dismissPrivacyConsentIfPresent(page: Page): Promise<void> {
  const dialog = page.locator('app-privacy-consent-dialog');
  try {
    await dialog.waitFor({
      state: 'visible',
      timeout: A11Y_E2E.PRIVACY_DIALOG_VISIBLE_TIMEOUT_MS,
    });
  } catch {
    return;
  }

  await dialog.locator('mat-dialog-actions button').first().click();
  await expect(dialog).toBeHidden();
}

test.describe('Accessibility (WCAG)', () => {
  test.setTimeout(A11Y_E2E.TEST_TIMEOUT_MS);

  for (const route of A11Y_E2E.ROUTES) {
    test(`has no serious or critical axe violations on ${route}`, async ({
      page,
    }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('#main-content')).toBeVisible({
        timeout: A11Y_E2E.MAIN_CONTENT_VISIBLE_TIMEOUT_MS,
      });
      await dismissPrivacyConsentIfPresent(page);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const blocking = results.violations.filter(
        (violation) =>
          violation.impact === 'serious' || violation.impact === 'critical'
      );

      expect(
        blocking,
        blocking.map((v) => `${v.id}: ${v.help} (${v.impact})`).join('\n')
      ).toEqual([]);
    });
  }
});
