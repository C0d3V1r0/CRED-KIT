import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { dismissBlockingOverlays } from '../e2e/utils/overlays';

async function preparePageForA11yScan(page: import('@playwright/test').Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
    `
  });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(100);
}

async function expectNoCriticalOrSeriousViolations(page: import('@playwright/test').Page) {
  await preparePageForA11yScan(page);

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  const criticalViolations = accessibilityScanResults.violations.filter(
    (violation) => violation.impact === 'critical' || violation.impact === 'serious'
  );

  expect(criticalViolations).toEqual([]);
}

test.describe('A11y smoke', () => {
  test('ключевые вкладки без критичных нарушений', async ({ page }) => {
    await page.goto('/ru/app');
    await dismissBlockingOverlays(page);
    await expectNoCriticalOrSeriousViolations(page);

    await page.getByTestId('nav-cyberware').click();
    await expectNoCriticalOrSeriousViolations(page);

    await page.getByTestId('nav-netrunner').click();
    await expectNoCriticalOrSeriousViolations(page);

    await page.getByTestId('nav-equipment').click();
    await expectNoCriticalOrSeriousViolations(page);

    await page.getByTestId('nav-newbieMap').click();
    await expectNoCriticalOrSeriousViolations(page);

    await page.getByTestId('nav-about').click();
    await expectNoCriticalOrSeriousViolations(page);

    await page.getByTestId('about-report-open').click();
    await expectNoCriticalOrSeriousViolations(page);
  });
});
