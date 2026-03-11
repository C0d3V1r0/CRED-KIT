# Performance Guide

## Runtime metrics (RUM)
- Source: `utils/webVitals.ts`
- Enabled in production via `toolkit/App.tsx`
- Config flags in `config/appConfig.ts`:
  - `enableWebVitals`
  - `webVitalsEndpoint`
  - `enableClientTelemetry`
  - `telemetryEndpoint`

If endpoint is empty, metrics/events are logged to console.

## Budgets
- Script: `tests/scripts/check-performance-budget.mjs`
- Lighthouse baseline: desktop (`preset=desktop`, `throttling-method=provided`)
- Current budgets:
  - main JS <= 230 KB
  - main CSS <= 105 KB
  - LCP <= 2500 ms
  - CLS <= 0.25

## Optimization checklist
1. Keep utility CSS centralized in design-system files.
2. Avoid adding large render-blocking resources.
3. Prefer lazy-loading feature modules.
4. Track write amplification in persistence effects.
5. Re-run `test:lighthouse` and `test:budget` after UI-heavy changes.
6. Keep public landing pages and toolkit routes lightweight enough for `sitemap`/SEO pages and the client-heavy app to coexist cleanly.
