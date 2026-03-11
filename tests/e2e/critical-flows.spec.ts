import { test, expect } from './fixtures';
import { dismissBlockingOverlays } from './utils/overlays';

type PdfSpyWindow = Window & {
  __openCalls?: unknown[][];
};

type BugSpyWindow = Window & {
  __bugPayload?: Record<string, unknown> | null;
};

type MinimalPrintWindow = Pick<Window, 'document' | 'focus' | 'print'>;

const RE = {
  skills: /Навыки|Skills/i,
  generator: /Генератор|Generator/i,
  add: /Добавить|Add/i,
  create: /Создать|Create/i,
  remove: /Удалить|Remove/i,
  newbieTitle: /Карта новичка|Newbie Map/i,
  aboutHero: /Твой Cyberpunk RED в одном месте|Your Cyberpunk RED in one place/i,
  requiredFields: /Заполните обязательные поля|Fill required fields/i,
  bugSent: /Репорт успешно отправлен|Report sent successfully/i
};

test.describe('Critical Flows', () => {
  test('app shell and localization persist after reload', async ({ page }) => {
    await page.goto('/');
    await dismissBlockingOverlays(page);

    await page.getByTestId('lang-en').click();

    await expect(page.getByTestId('nav-character')).toContainText('Character');
    await expect(page.getByTestId('nav-cyberware')).toContainText('Cyberware');
    await expect(page.getByTestId('nav-equipment')).toContainText('Gear');

    await page.getByTestId('nav-about').click();
    await expect(page.getByText('Your Cyberpunk RED in one place: character, cyberware, and netrunning.')).toBeVisible();

    await page.reload();
    await dismissBlockingOverlays(page);
    await expect(page.getByTestId('nav-character')).toContainText('Character');
  });

  test('character flow: basic profile + hp + stat growth + skills + quick generator', async ({ page }) => {
    await page.goto('/');
    await dismissBlockingOverlays(page);
    await page.getByTestId('lang-ru').click();

    await page.getByLabel('Имя персонажа').fill('Ви');
    await page.getByLabel('Роль').selectOption('Solo');
    await page.getByLabel('Эдди (eb)').fill('1200');

    await expect(page.getByLabel('Имя персонажа')).toHaveValue('Ви');
    await expect(page.getByLabel('Роль')).toHaveValue('Solo');
    await expect(page.getByLabel('Эдди (eb)')).toHaveValue('1200');

    const intInput = page.getByLabel('INT');
    await intInput.fill('15');
    await intInput.blur();
    await expect(intInput).toHaveValue('15');

    await page.getByRole('button', { name: 'Критическое состояние' }).click();
    await expect(page.getByText('1 /')).toBeVisible();
    await page.getByRole('button', { name: 'Полное восстановление' }).click();
    await expect(page.getByText(/50 \/ 50/)).toBeVisible();

    await page.getByTestId('character-subtab-skills').click();
    await expect(page.getByRole('heading', { name: RE.skills })).toBeVisible();

    await page.getByPlaceholder('Поиск навыка...').fill('Вождение');
    await expect(page.locator('tbody').getByText(/Вождение|Drive Land Vehicle/i).first()).toBeVisible();

    await page.getByTestId('character-subtab-quick').click();
    await expect(page.getByRole('heading', { name: /Быстрый генератор|Quick generator/i })).toBeVisible();

    await page.getByRole('button', { name: 'Соло Наёмный убийца' }).click();
    await page.getByRole('button', { name: 'Дальше' }).click();
    await page.getByRole('button', { name: 'Бросить кубики' }).click();
    await page.getByRole('button', { name: /Применить|Apply/i }).click();

    await expect(page.getByRole('heading', { name: /Персонаж создан|Character created/i })).toBeVisible();
  });

  test('character data persists after page reload', async ({ page }) => {
    await page.goto('/');
    await dismissBlockingOverlays(page);
    await page.getByTestId('lang-ru').click();

    await page.getByLabel('Имя персонажа').fill('Ви');
    await page.getByLabel('Роль').selectOption('Solo');
    await page.getByLabel('Эдди (eb)').fill('1200');

    await page.waitForTimeout(800);
    await page.reload();
    await dismissBlockingOverlays(page);

    await expect(page.getByLabel('Имя персонажа')).toHaveValue('Ви');
    await expect(page.getByLabel('Роль')).toHaveValue('Solo');
    await expect(page.getByLabel('Эдди (eb)')).toHaveValue('1200');
  });

  test('character flow: create new character by confirmation dialog', async ({ page }) => {
    await page.goto('/');
    await dismissBlockingOverlays(page);
    await page.getByTestId('lang-ru').click();

    await page.getByLabel('Имя персонажа').fill('Ривет');
    await expect(page.getByLabel('Имя персонажа')).toHaveValue('Ривет');

    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Новый персонаж' }).click();

    await expect(page.getByLabel('Имя персонажа')).toHaveValue('Безымянный');
  });

  test('character flow: new character resets installed cyberware to zero', async ({ page }) => {
    await page.goto('/');
    await dismissBlockingOverlays(page);
    await page.getByTestId('lang-ru').click();

    await page.getByTestId('nav-cyberware').click();
    await page.getByTestId('cyberware-search').fill('кибер');
    await page.locator('[data-testid^="implant-open-"]').first().click();
    await page.getByTestId('implant-install').click();
    await expect(page.getByText(/1 (установлено|installed)/i).first()).toBeVisible();

    await page.getByTestId('nav-character').click();
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Новый персонаж' }).click();

    await expect(page.getByLabel('Имя персонажа')).toHaveValue('Безымянный');
    await expect(page.getByText(/0 (имплантов|implants)/i).first()).toBeVisible();
  });

  test('character flow: new character clears custom implants in black chrome lab', async ({ page }) => {
    await page.goto('/');
    await dismissBlockingOverlays(page);
    await page.getByTestId('lang-ru').click();

    await page.getByTestId('nav-cyberware').click();
    await page.getByTestId('cyberware-view-lab').click();
    await page.getByTestId('cyber-lab-mode-scratch').click();

    await page.getByTestId('cyber-lab-name').fill('E2E Reset Custom Implant');
    await page.getByTestId('cyber-lab-slot').selectOption('head_brain');
    await page.getByTestId('cyber-lab-base-cost').fill('250');
    await page.getByTestId('cyber-lab-base-hl').fill('4');
    await page.getByTestId('cyber-lab-save').click();

    await expect(page.getByText(/Мои импланты|My implants/i)).toBeVisible();

    await page.getByTestId('nav-character').click();
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Новый персонаж' }).click();

    await page.getByTestId('nav-cyberware').click();
    await page.getByTestId('cyberware-view-lab').click();
    await expect(page.getByText(/Мои импланты|My implants/i)).toHaveCount(0);
  });

  test('character flow: pdf export opens printable sheet window', async ({ page }) => {
    await page.addInitScript(() => {
      const openCalls: unknown[][] = [];
      const pdfSpyWindow = window as PdfSpyWindow;
      pdfSpyWindow.__openCalls = openCalls;

      window.open = ((...args: unknown[]) => {
        openCalls.push(args);
        const printWindow: MinimalPrintWindow = {
          document: {
            open: () => undefined,
            write: () => undefined,
            close: () => undefined
          },
          focus: () => undefined,
          print: () => undefined
        };

        return printWindow as Window;
      }) as typeof window.open;
    });

    await page.goto('/');
    await dismissBlockingOverlays(page);
    await page.getByTestId('lang-ru').click();

    await page.getByRole('button', { name: /Скачать PDF|Download PDF/i }).click();

    const openCallsCount = await page.evaluate(() => {
      const pdfSpyWindow = window as PdfSpyWindow;
      return pdfSpyWindow.__openCalls?.length ?? 0;
    });
    expect(openCallsCount).toBe(1);
  });

  test('cyberware flow: search + install and remove implant via modal', async ({ page }) => {
    await page.goto('/');
    await dismissBlockingOverlays(page);
    await page.getByTestId('lang-ru').click();

    await page.getByTestId('nav-cyberware').click();
    await page.getByTestId('cyberware-search').fill('кибер');
    await page.locator('[data-testid^="implant-open-"]').first().click();

    await expect(page.getByTestId('implant-install')).toBeVisible();
    await page.getByTestId('implant-install').click();
    await expect(page.getByText('Установлен').first()).toBeVisible();

    await page.locator('[data-testid^="implant-card-"]').filter({ hasText: 'Установлен' }).first().click();
    await expect(page.getByTestId('implant-remove')).toBeVisible();
    await page.getByTestId('implant-remove').click();

    await expect(page.getByText(/0 (установлено|installed)/i).first()).toBeVisible();
  });

  test('cyberware lab: create custom implant from scratch and install it', async ({ page }) => {
    await page.goto('/');
    await dismissBlockingOverlays(page);
    await page.getByTestId('lang-ru').click();

    await page.getByTestId('nav-cyberware').click();
    await page.getByTestId('cyberware-view-lab').click();
    await page.getByTestId('cyber-lab-mode-scratch').click();

    await page.getByTestId('cyber-lab-name').fill('E2E Neural Booster');
    await page.getByTestId('cyber-lab-slot').selectOption('head_brain');
    await page.getByTestId('cyber-lab-base-cost').fill('450');
    await page.getByTestId('cyber-lab-base-hl').fill('8');
    await page.getByTestId('cyber-lab-effect-key').fill('REF');
    await page.getByTestId('cyber-lab-effect-value').fill('+1');
    await page.getByTestId('cyber-lab-effect-add').click();
    await page.getByTestId('cyber-lab-save').click();

    await page.getByTestId('cyberware-view-browser').click();
    await page.getByTestId('cyberware-search').fill('E2E Neural Booster');
    await expect(page.getByText('E2E Neural Booster')).toBeVisible();

    await page.locator('[data-testid^="implant-open-"]').first().click();
    await page.getByTestId('implant-install').click();
    await expect(page.getByText('Установлен').first()).toBeVisible();
  });

  test('gear flow: add weapon/armor/gear and remove items in inventory', async ({ page }) => {
    await page.goto('/');
    await dismissBlockingOverlays(page);
    await page.getByTestId('lang-ru').click();

    await page.getByTestId('nav-equipment').click();
    await page.getByTestId('gear-tab-weapons').click();
    await page.getByRole('button', { name: RE.add }).first().click();

    await page.getByTestId('gear-tab-armor').click();
    await page.getByRole('button', { name: RE.add }).first().click();

    await page.getByTestId('gear-tab-gear').click();
    await page.getByRole('button', { name: RE.add }).first().click();

    await page.getByTestId('gear-tab-inventory').click();
    const removeButtons = page.getByTitle(RE.remove);
    await expect(removeButtons.first()).toBeVisible();

    await removeButtons.first().click();
    await removeButtons.first().click();
    await removeButtons.first().click();

    await expect(page.getByText(/Инвентарь пуст|Inventory empty/i)).toBeVisible();
  });

  test('gear constructor: create custom item and see it in inventory', async ({ page }) => {
    const itemName = `E2E Gear ${Date.now()}`;

    await page.goto('/');
    await dismissBlockingOverlays(page);
    await page.getByTestId('lang-ru').click();
    await page.getByTestId('nav-equipment').click();
    await page.getByTestId('gear-tab-create').click();

    await page.getByRole('button', { name: RE.create }).last().click();
    const form = page.locator('div').filter({ has: page.getByRole('button', { name: /Отмена|Cancel/i }) }).first();
    await form.locator('input[type="text"]').first().fill(itemName);
    await page.getByRole('button', { name: RE.create }).nth(1).click();

    await page.getByTestId('gear-tab-inventory').click();
    await expect(page.getByText(itemName, { exact: true })).toBeVisible();
  });

  test('netrunning flow: deck + program + hack simulation + reset/unequip', async ({ page }) => {
    await page.goto('/');
    await dismissBlockingOverlays(page);
    await page.getByTestId('lang-ru').click();

    await page.getByTestId('nav-netrunner').click();

    await page.getByTestId('net-tab-deck').click();
    await page.locator('[data-testid^="deck-card-"]').first().click();
    await expect(page.getByText('Выбран').first()).toBeVisible();
    await page.getByRole('button', { name: /Снять нейролинк|Unequip cyberdeck/i }).click();
    await expect(page.getByText(/Нейролинк не выбран|No cyberdeck selected/i)).toBeVisible();

    await page.locator('[data-testid^="deck-card-"]').first().click();

    await page.getByTestId('net-tab-programs').click();
    const installButtons = page.locator('[data-testid^="net-program-add-"]');
    await installButtons.first().click();
    await expect(page.locator('p').filter({ hasText: /1 (установлено|installed)/i }).first()).toBeVisible();

    await page.getByTestId('net-tab-hack').click();
    await page.getByTestId('hack-start').click();
    await expect(page.getByTestId('hack-breach')).toBeVisible();
    await expect(page.getByTestId('hack-quick-roll')).toBeVisible();
  });

  test('netrunning constructor: create custom program', async ({ page }) => {
    const programName = `E2E Program ${Date.now()}`;

    await page.goto('/');
    await dismissBlockingOverlays(page);
    await page.getByTestId('lang-ru').click();
    await page.getByTestId('nav-netrunner').click();
    await page.getByTestId('net-tab-constructor').click();

    await page.getByRole('button', { name: RE.create }).last().click();
    const form = page.locator('div').filter({ has: page.getByRole('button', { name: /Отмена|Cancel/i }) }).first();
    await form.locator('input[type="text"]').first().fill(programName);
    await page.getByRole('button', { name: RE.create }).nth(1).click();

    await expect(page.getByText(programName, { exact: true })).toBeVisible();
  });

  test('newbie map tab is accessible and readable', async ({ page }) => {
    await page.goto('/');
    await dismissBlockingOverlays(page);

    await page.getByTestId('nav-newbieMap').click();
    await expect(page.getByRole('heading', { name: RE.newbieTitle })).toBeVisible();
    await expect(page.getByText(/Шаг 1|Step 1/i)).toBeVisible();
    await expect(page.getByText(/Готово к первой сессии|Ready for first session/i)).toBeVisible();
  });

  test('about tab shows project value and support/donate section', async ({ page }) => {
    await page.goto('/');
    await dismissBlockingOverlays(page);

    await page.getByTestId('nav-about').click();
    await expect(page.getByText(RE.aboutHero)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Поддержать проект|Support the project/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Ссылка доната не настроена|Donation link is not configured/i })).toBeDisabled();
  });

  test('bug report flow in about modal: required fields and reset', async ({ page }) => {
    await page.goto('/');
    await dismissBlockingOverlays(page);

    await page.getByTestId('nav-about').click();
    await page.getByTestId('about-report-open').click();

    await page.getByTestId('bug-submit').click();
    await expect(page.getByRole('alert').filter({ hasText: RE.requiredFields })).toBeVisible();

    await page.getByTestId('bug-title').fill('E2E: bug title');
    await page.getByTestId('bug-category').selectOption('logic');
    await page.getByTestId('bug-severity').selectOption('high');
    await page.getByTestId('bug-steps').fill('1. Open app\n2. Click button');
    await page.getByTestId('bug-expected').fill('Expected behavior');
    await page.getByTestId('bug-actual').fill('Actual behavior');
    await page.getByTestId('bug-contact').fill('tester@example.com');

    await page.getByTestId('bug-reset').click();
    await expect(page.getByTestId('bug-title')).toHaveValue('');
    await expect(page.getByTestId('bug-steps')).toHaveValue('');
    await expect(page.getByTestId('bug-actual')).toHaveValue('');
  });

  test('bug report flow: successful submit to endpoint', async ({ page }) => {
    await page.addInitScript(() => {
      const bugSpyWindow = window as BugSpyWindow;

      bugSpyWindow.__bugPayload = null;

      const originalFetch = window.fetch.bind(window);
      window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

        if (url.includes('formsubmit.co/ajax/')) {
          const bodyText = typeof init?.body === 'string' ? init.body : '';
          try {
            bugSpyWindow.__bugPayload = bodyText ? JSON.parse(bodyText) as Record<string, unknown> : {};
          } catch {
            bugSpyWindow.__bugPayload = {};
          }

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }

        return originalFetch(input, init);
      }) as typeof window.fetch;
    });

    await page.goto('/');
    await dismissBlockingOverlays(page);
    await page.getByTestId('nav-about').click();
    await page.getByTestId('about-report-open').click();

    await page.getByTestId('bug-title').fill('E2E: send bug');
    await page.getByTestId('bug-steps').fill('Step 1');
    await page.getByTestId('bug-actual').fill('Broken');
    await page.getByTestId('bug-contact').fill('qa@credkit.local');
    await page.getByTestId('bug-submit').click();

    await expect(page.getByRole('alert').filter({ hasText: RE.bugSent })).toBeVisible();
    await expect(page.getByTestId('bug-title')).toHaveValue('');
    const payload = await page.evaluate(() => {
      const bugSpyWindow = window as BugSpyWindow;
      return bugSpyWindow.__bugPayload ?? null;
    });
    expect(payload).not.toBeNull();
    expect(payload?.title).toBe('E2E: send bug');
  });
});
