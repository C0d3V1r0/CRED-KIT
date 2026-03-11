import { test, expect } from '@playwright/test';

test('dev server: app loads and HMR websocket has no failed connection errors', async ({ page }) => {
  const wsErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (/failed to connect to websocket|websocket \(failing\)|cannot establish connection to .*ws:\/\//i.test(text)) {
      wsErrors.push(text);
    }
  });

  await page.goto('/');
  await expect(page.getByTestId('nav-character')).toBeVisible();

  await page.waitForTimeout(1500);
  expect(wsErrors).toEqual([]);
});
