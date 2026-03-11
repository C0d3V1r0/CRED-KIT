import { test, expect } from './fixtures';
import { dismissBlockingOverlays } from './utils/overlays';

test.describe('Responsive Layout', () => {
  const tabIds = ['character', 'cyberware', 'netrunner', 'equipment', 'patchnotesDev', 'newbieMap', 'about'] as const;

  const openTab = async (page: import('@playwright/test').Page, tabId: typeof tabIds[number]) => {
    const menuToggle = page.getByTestId('mobile-menu-toggle');
    const useMobileMenu = await menuToggle.isVisible().catch(() => false);

    if (useMobileMenu) {
      const expanded = await menuToggle.getAttribute('aria-expanded');
      if (expanded !== 'true') {
        await menuToggle.click();
      }
      await page.getByTestId(`mobile-nav-${tabId}`).click();
      return;
    }

    await page.getByTestId(`nav-${tabId}`).click();
  };

  const expectNoHorizontalOverflow = async (page: import('@playwright/test').Page) => {
    const metrics = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      rootScrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth
    }));

    const effectiveWidth = Math.max(metrics.rootScrollWidth, metrics.bodyScrollWidth);
    expect(effectiveWidth - metrics.viewportWidth).toBeLessThanOrEqual(4);
  };

  test('mobile menu opens below header and keeps first tab visible', async ({ page }) => {
    await page.goto('/');
    await dismissBlockingOverlays(page);

    const menuToggle = page.getByTestId('mobile-menu-toggle');
    const isBurgerVisible = await menuToggle.isVisible();

    if (!isBurgerVisible) {
      await expect(page.getByTestId('nav-character')).toBeVisible();
      return;
    }

    await menuToggle.click();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');

    const header = page.locator('header.app-header');
    const firstMobileTab = page.getByTestId('mobile-nav-character');
    await expect(firstMobileTab).toBeVisible();

    const [headerBox, tabBox] = await Promise.all([header.boundingBox(), firstMobileTab.boundingBox()]);
    expect(headerBox).not.toBeNull();
    expect(tabBox).not.toBeNull();
    expect(tabBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height - 8);
  });

  test('all core tabs fit viewport without page-level horizontal scroll', async ({ page }) => {
    await page.goto('/');
    await dismissBlockingOverlays(page);

    for (const tabId of tabIds) {
      await openTab(page, tabId);
      await page.waitForTimeout(120);
      await expectNoHorizontalOverflow(page);
    }
  });
});
