# Architecture Overview

Current runtime: `Next.js App Router` with localized public routes (`/[lang]`) and toolkit routes (`/[lang]/app`).

## Layers
- `app` — Next.js App Router shell, localized routes, metadata, sitemap, robots.
- `toolkit` — client-heavy toolkit entry mounted inside Next routes.
- `core` — bootstrap, store, typed hooks, app-level providers/bridges.
- `entities` — domain state, selectors, reducers and entity-specific hooks.
- `features` — app features and narrow feature slices (`settings`, feature commands).
- `components` — UI composition and local ephemeral state only.
- `logic` — pure domain logic (stats, netrunning, gear, cyberware).
- `services` — IndexedDB and persistence integration.
- `utils` — cross-cutting utilities (import validation, export, web vitals, telemetry).
- `styles/system` — design-system tokens and primitives.

## Data flow
1. UI reads data through `useAppSelector` or thin entity hooks.
2. UI dispatches domain actions through entity/feature hooks.
3. App bridges synchronize Redux state with browser APIs and IndexedDB.
4. Domain logic computes derived values via pure functions.

## Stability rules
1. All external/imported data must go through sanitizers.
2. IndexedDB import/export must stay backward compatible.
3. New UI variants should be implemented in design-system, not inline.
4. Large state updates should avoid unnecessary write amplification.
5. New state must land in `app/entities/features`, not inside React component trees.

## Layer boundaries
- `logic` and `services` must not import from `components`, `toolkit`, or legacy app-shell entrypoints.
- `entities` must not import from `components`.
- `features` may depend on `entities` and shared utilities, but not on concrete screens.
- `components` must access app state only through hooks from `core`, `entities`, `features`.
- These constraints are enforced via ESLint (`no-restricted-imports`) to prevent hidden reverse dependencies.

## Runtime safety
- `AppErrorBoundary` catches React render tree errors and shows a safe fallback UI.
- `RuntimeGuard` catches global runtime errors and `unhandledrejection`.
- Telemetry is optional and controlled by `APP_CONFIG`.
- The main toolkit is currently mounted as a client-heavy route inside Next (`/[lang]/app`) while public landing pages stay statically generated.

## Current state model
- `appShell` — app-level UI state: active tab, mobile menu, welcome/what's-new modals, offline flag.
- `characterDomain` — core character data, loading/error, derived stats selectors.
- `customContentDomain` — user-defined cyberware, armor, weapons and programs.
- `settings` — language and app-level preferences.
