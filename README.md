# CRED KIT

Цифровой набор для Cyberpunk RED на Next.js: персонаж, хром, нетраннинг и снаряжение в одном приложении.

## Что умеет

- Полный лист персонажа: статы, навыки, роль, деньги, HP, урон/лечение.
- Модуль хрома: установка имплантов, схема тела, контроль HL и конфликтов.
- Нетрaннинг: деки, программы, ICE, симуляция взлома.
- Снаряжение: оружие, броня, предметы, инвентарь.
- Улучшенный поиск в «Снаряжении».
- Поиск в «Снаряжении»: чистые инпуты без иконки внутри, чтобы placeholder не перекрывался.
- Репорт проблемы: форма открывается из вкладки «О проекте» в модальном окне, отправка идёт напрямую без открытия почтового клиента.
- Newbie Map: пошаговый путь для первого персонажа.
- Newbie Map: интерактивный чеклист с прогрессом и быстрыми стартовыми маршрутами.
- Адаптивное мобильное меню: вкладки не перекрываются шапкой даже на узких экранах.
- Мобильный UI модулей: внутренние разделы и контент корректно помещаются в экран без page-level горизонтального скролла.
- Вкладка «О проекте»: короткие и практичные причины, почему CRED KIT ускоряет игру.
- Экспорт анкеты в PDF.
- RU/EN интерфейс.
- Публичные RU/EN страницы и toolkit routes на Next App Router.

## Быстрый старт

Требования: `Node.js 20+`, `npm 10+`.

```bash
npm install
npm run dev
```

## Статический конфиг

Проект работает без `.env`. Базовые значения (донат, почта и endpoint для баг-репорта) задаются прямо в:

- `config/appConfig.ts`

## Тесты и качество

```bash
npm run test:clean # очищает .lighthouseci + dist + coverage + test-results
npm run typecheck
npm run lint
npm run test:unit
npm run test:component
npm run test:integration
npm run test:a11y
npm run test:e2e
npm run test:e2e:responsive # mobile/tablet responsive smoke (Pixel 7, iPhone 13, iPad Mini)
npm run test:e2e:cross # Chromium + WebKit, Firefox автоматически проверяется и пропускается только при NS_ERROR_NET_ERROR_RESPONSE
npm run test:lighthouse
npm run test:budget # проверка budget по bundle size и lighthouse метрикам
npm run test:quick # clean + typecheck + lint + coverage(unit) + component + integration + build + budget + a11y
npm run test:full  # полный пайплайн (quick + e2e + lighthouse)
```

## Структура проекта

- Next App Router shell: `app/*`
- Toolkit shell: `toolkit/*`
- Core layer: `core/*` (`store`, typed hooks, providers/bridges)
- Entities: `entities/*` (Redux slices, selectors, domain hooks)
- Features: `features/*`
- UI: `components/*`
- Логика: `logic/*`
- Доступ к состоянию: только через hooks из `core`, `entities`, `features`
- Стили дизайн-системы: `styles/system/*` (модульные CSS-секции, подключаются через `styles/design-system.css`)
- Локальное хранение: `services/indexedDB.ts`
- Отдельный тестовый модуль: `tests/` (unit/component/integration/e2e/a11y/config/scripts/setup)
