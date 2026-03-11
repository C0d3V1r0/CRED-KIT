# Testing Guide

## Commands
- `npm run test:unit` — pure logic tests.
- `npm run test:component` — React component behavior tests.
- `npm run test:integration` — Redux + persistence integration.
- `npm run test:e2e` — critical browser flows.
- `npm run test:a11y` — accessibility smoke checks.
- `npm run test:lighthouse` — lab performance and accessibility audit.
- `npm run test:budget` — bundle + lighthouse performance budgets.

## Pipelines
- `npm run test:quick`
  - clean -> typecheck -> lint -> coverage -> component -> integration -> build -> budget -> a11y
- `npm run test:full`
  - quick -> e2e -> lighthouse -> budget

## Visual regression
- Spec: `tests/e2e/visual-regression.spec.ts`
- First baseline update:
  - `npx playwright test --config tests/config/playwright.config.ts tests/e2e/visual-regression.spec.ts --update-snapshots`
- Regular validation:
  - `npx playwright test --config tests/config/playwright.config.ts tests/e2e/visual-regression.spec.ts`

## Critical contracts
- Import validation contracts:
  - `tests/unit/importValidation.test.ts`
  - covers invalid JSON, oversized payloads, and legacy field sanitization.
- Character state + persistence contracts:
  - `tests/integration/character-indexeddb.integration.test.tsx`
  - covers autosave, damaged DB payload sanitization, reset behavior, schema import/export, and `importCharacter` error handling.
- React render safety fallback:
  - `tests/component/app-error-boundary.component.test.tsx`
  - verifies that render crashes are isolated by `AppErrorBoundary` and telemetry is emitted.

## Runtime note
- End-to-end, a11y, and Lighthouse checks now run against the Next.js runtime (`next start` / `next dev`), not the legacy Vite preview server.
