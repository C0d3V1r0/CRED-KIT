import { test, expect } from './fixtures';

async function prepareStableUi(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('credkit-welcome-alert-seen-v1', '1');
    window.localStorage.setItem('credkit-language', 'ru');
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
    `
  });
}

test.describe('Visual Regression', () => {
  test('app shell visual baseline', async ({ page }) => {
    await prepareStableUi(page);

    await expect(page).toHaveScreenshot('app-shell.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.02
    });
  });

  test('cyberware tab visual baseline', async ({ page }) => {
    await prepareStableUi(page);
    await page.getByTestId('nav-cyberware').click();
    await page.waitForTimeout(150);

    await expect(page).toHaveScreenshot('cyberware-tab.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.02
    });
  });
});
