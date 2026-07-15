import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const ROUTES = [
  '/main',
  '/applicants',
  '/match',
  '/export',
  '/smart-action',
  '/privacy',
];

test.describe('Accessibility (WCAG)', () => {
  test.setTimeout(60_000);

  for (const route of ROUTES) {
    test(`has no serious or critical axe violations on ${route}`, async ({
      page,
    }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('#main-content')).toBeVisible({
        timeout: 30_000,
      });

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
