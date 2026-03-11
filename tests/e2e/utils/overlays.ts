import type { Page } from '@playwright/test';

async function clickIfVisible(page: Page, selector: string): Promise<void> {
  const element = page.getByTestId(selector);
  const isVisible = await element.isVisible().catch(() => false);
  if (!isVisible) return;
  await element.click().catch(() => {});
}

export async function dismissBlockingOverlays(page: Page): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await clickIfVisible(page, 'welcome-later');
    await clickIfVisible(page, 'whats-new-close');

    const closeWelcomeBackdrop = page.locator('button[aria-label="Close welcome modal"]').first();
    const backdropVisible = await closeWelcomeBackdrop.isVisible().catch(() => false);
    if (backdropVisible) {
      await closeWelcomeBackdrop.click({ force: true }).catch(() => {});
    }

    await page.waitForTimeout(80);
  }
}
