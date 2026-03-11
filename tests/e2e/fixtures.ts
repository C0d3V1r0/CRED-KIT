import { expect, test as base } from '@playwright/test';

const IGNORE_CONSOLE_ERROR_PATTERNS = [
  /favicon\.ico/i
];

export const test = base.extend({
  page: async ({ page }, proceedWithPage) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];

    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    page.on('console', (message) => {
      if (message.type() !== 'error') return;
      const text = message.text();
      const shouldIgnore = IGNORE_CONSOLE_ERROR_PATTERNS.some((pattern) => pattern.test(text));
      if (!shouldIgnore) {
        consoleErrors.push(text);
      }
    });

    await proceedWithPage(page);

    if (pageErrors.length > 0) {
      throw new Error(`pageerror detected:\n${pageErrors.join('\n')}`);
    }

    if (consoleErrors.length > 0) {
      throw new Error(`console.error detected:\n${consoleErrors.join('\n')}`);
    }
  }
});

export { expect };
