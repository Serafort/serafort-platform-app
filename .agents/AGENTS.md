# AGENTS.md —Serafort Developer & AI Agent Context

This document provides complete architectural context, coding standards, theme strategies, framework principles, and development workflows for AI coding agents and engineering contributors working on the **Serafort Multi-Tenant SaaS Framework**.

> **Before making changes**, also check `/analysis/architecture-report.md`, `/analysis/technical-debt-report.md`, and `/analysis/improvement-roadmap.md` — a full principal-level review (August 2026) with file-level findings. This file gives you the stable mental model; those three give you the current, dated punch list. If you're about to touch routing, layout, or `LayoutRouteWrapper`, read "Known Gaps" below first — it will save you from re-deriving a bug that's already diagnosed.

---

## 1. Framework Identity & Monorepo Architecture Overview

The workspace is a multi-tenant, modular web framework built with React 19, TypeScript, Material UI (MUI v7), Zustand, and Vite, managed via `pnpm` workspaces.

### Package Inventory & Layer Hierarchy

```
Tier 5: Shell App             [@cap/app]
                                  │
Tier 4: Feature Modules       [@cap/module-auth, @cap/module-landing, @cap/module-theme, @cap/module-dashboard, @cap/module-widget-studio]
                                  │
Tier 3: Platform Façade       [@cap/platform-core]
                                  │
Tier 2: Platform Services     [@cap/layout, @cap/authorization, @cap/auth-contracts]
                                  │
Tier 1: Core Domain           [@cap/platform-store, @cap/theme, @cap/api-contracts]
                                  │
Tier 0: Foundation            [@cap/shared-types]
```

#### Package Responsibilities

- **`@cap/shared-types`** (`packages/shared-types`): Zero-dependency TypeScript type declarations, domain entities, API contracts (`CAPModule`, `TenantThemeConfig`, `AccessPolicy`, `SearchItemConfig`).
- **`@cap/api-contracts`** (`packages/api-contracts`): API query key factories, request/response models, and endpoint schema declarations.
- **`@cap/platform-store`** (`packages/platform-store`): Main Zustand global state management (`useAppStore`) with encrypted persistent storage (`secureStorage`), sliced by domain.
- **`@cap/theme`** (`packages/theme`): MUI v7 design tokens, token composition (`composeMuiTheme`), tenant theme context (`TenantThemeProvider`), visual effects (glassmorphism, neumorphism, bento, brutalism, organic, immersive), component overrides, baseline styles, and default `themeConfig`.
- **`@cap/authorization`** (`packages/authorization`): High-performance permission checker and ABAC/RBAC evaluation engine.
- **`@cap/auth-contracts`** (`packages/auth-contracts`): Contracts and administrative services specific to identity and access management.
- **`@cap/layout`** (`packages/layout`): Structural layout components (`VerticalLayout`, `HorizontalLayout`, `PublicLayout`, `BlankLayout`), navigation shells, `ThemeBridge`, `ModuleMenuRenderer`, and `SkipToContent`.
- **`@cap/platform-core`** (`packages/platform-core`): Central orchestration façade for runtime module assembly (`assembleApp`), routing, i18n initialization, plugin registry (`globalPluginRegistry`), `TenantProvider`, and `LayoutRouteWrapper`.
- **`@cap/module-auth`** (`packages/modules/auth`): Complete IDaaS module encompassing auth-core, MFA, passwordless, SAML, JWKS, identity broker, user directory, and session management.
- **`@cap/module-landing`** (`packages/modules/landing`): Public marketing pages, workflow step pipeline, pricing tables, contact forms, and legal screens.
- **`@cap/module-theme`** (`packages/modules/theme`): Tenant branding module — theme preset picker, AI prompt theme synthesis, and live `ColorPaletteEditor`.
- **`@cap/module-dashboard`** (`packages/modules/dashboard`): Layout customizer and live multi-tenant widget workspace.
- **`@cap/module-widget-studio`** (`packages/modules/widget-studio`): Multi-agent AI widget generation studio with SSE streaming pipeline.
- **`@cap/app`** (`app`): Shell application entry point (`main.tsx`), provider assembly (`Providers.tsx`), top-level layout selector (`layout.tsx`), Vite config with modular `manualChunks`, and Playwright e2e test suite.

---

## 2. Module Assembly & Dynamic Plugin System

### The `CAPModule` Interface

Every feature module exports a `CAPModule` contract object containing:

- `id`: Unique module identifier string (e.g. `'auth-module'`, `'landing-module'`)
- `version`: SemVer string (e.g. `'1.0.0'`)
- `routes`: Array of route configurations (`ModuleRouteConfig[]`) with layout intent
- `navItems`: Navigation items (`NavItemConfig[]`) specifying ordering, section groupings, icons, role guards, and layout variants
- `searchItems`: Command-palette search entries (`SearchItemConfig[]`)
- `i18n`: Localized dictionary bundles (`en`, `fr`, `ar`)
- `plugins`: Module-level plugins conforming to `CAPPlugin`

### Runtime Module Discovery

`AppAssembly.tsx` resolves modules through a dual mechanism:

1. **Static Discovery**: Vite `import.meta.glob` scans `../../packages/modules/*/src/index.ts` eagerly.
2. **Dynamic Registration**: `registerDynamicModule(contract)` allows uploaded or remote modules to register at runtime.
3. **Assembly Memoization**: The assembled router component is memoized via `React.useMemo()` in `AppAssembly.tsx` to preserve React DOM stability across renders.

---

## 3. Theme & Design System Strategy

### Three-Layer Theme Compilation

1. **Tokens (`PrimitiveTokens`)**: Color palettes (primary, secondary, background, paper, status colors), spacing scales, radii, typography rules, shadows, and z-index definitions.
2. **Composition (`composeMuiTheme`)**: Merges primitive tenant tokens with dark/light mode bases and applies MUI component overrides (`getComponentOverrides`).
3. **Delivery (`ThemeBridge` & `DesignSystemProvider`)**: Synchronizes tenant configuration with CSS custom properties (`--border-color`, `--header-z-index`) via `applyThemeVariablesSync`, and provides the compiled MUI `theme` via `MuiThemeProvider`. `ThemeBridge` coalesces rapid config changes into a single `requestAnimationFrame` write (no per-frame DOM thrash on preset switching) and removes variables that a previous config produced but the new one no longer emits (e.g. `--glass-*`/`--effect-*` on returning to a non-effect preset).

**Status color tenantization (resolved):** in `composeMuiTheme.ts`, all six palette groups — `primary`, `secondary`, `error`, `warning`, `success`, `info` — now tokenize the same way. `derivePaletteColorGroup(main, token?)` honors an explicitly authored `token.light` / `token.dark` outright (the same "the author said so" rule `resolveChromeColor` applies to chrome tokens), and otherwise derives the variant from `main` via `lighten()` / `darken()`. The five opacity steps are always derived from `main`. So a tenant can customize a status color's `main` alone and get a coherent `light`/`dark` pair, or author explicit per-variant values for full control. `composeMuiThemeMemoized`'s cache key folds in each token's `light`/`dark`, so tuning `error.dark` in the theme editor invalidates the cache. `TenantThemeConfig` / `ColorToken` shapes are unchanged. (Former "known gap"; see improvement-roadmap.md Phase 3 item 14 and technical-debt-report.md §1's theme section (K) for the history.)

### System Mode & RTL Support

- When `settings.mode === 'system'`, theme mode dynamically resolves browser `prefers-color-scheme`.
- Components MUST use RTL-aware logical CSS properties (`inlineSize`, `blockSize`, `marginInlineStart`) **or** rely on `stylis-plugin-rtl` (already wired into the app and `@cap/theme`), which auto-flips MUI's physical `sx` shorthands (`px`, `mx`, `pl`, etc.) for `dir='rtl'`. Both are in active use in this codebase — don't assume a component using `px`/`mx` is an RTL bug; check whether the plugin already covers it before "fixing" it to logical properties.

---

## 4. Known Gaps — Read Before Touching Routing/Layout

These are real, code-confirmed gaps (not stylistic nitpicks) found during the August 2026 architecture review. Full detail: `analysis/architecture-report.md` §4, `analysis/technical-debt-report.md` §1.7/§2, `analysis/improvement-roadmap.md` Phase 1.

1. **`layout: 'vertical'` / `layout: 'horizontal'` on a `ModuleRouteConfig` do nothing at runtime today**, despite being documented in `MODULE_DEVELOPMENT_GUIDE.md`'s scaffolding example. Only `'noLayout'` and `'admin'` are actually wired up in `LayoutRouteWrapper` / `LayoutWrapper`. If you're scaffolding a new module's routes, use `'admin'` for authenticated dashboard-style screens and `'noLayout'` for chrome-free screens (sign-in, verification links, etc.) — don't reach for `'vertical'`/`'horizontal'` expecting them to switch the shell; they won't, until `improvement-roadmap.md` Phase 1 item 6 lands. **Check `improvement-roadmap.md` Phase 1 before assuming this is still open — it may already be resolved.**
2. **`LayoutRouteWrapper` had two implementations that drifted** — this was **resolved in commit `ca5ea29`** ("refactor: unify layout wrapping…"): the `@cap/platform-core/src/components/LayoutRouteWrapper.tsx` copy was deleted and the single canonical implementation now lives at `@cap/layout/src/components/wrappers/LayoutRouteWrapper.tsx`, imported by `assembleApp`. If you need to fix or extend this component, there is only **one** implementation to touch now — don't reintroduce a second copy.
3. **Not every route in every auth sub-module declares a `layout`.** An undeclared `layout` silently inherits whatever `layoutOverride` the previously-visited route left behind, because `assembleApp` defaults it to `'none'`, which is a no-op in the wrapper. When adding a new route, **always declare `layout` explicitly** rather than omitting it, even if you think the "default" is what you want.

---

## 5. Coding Standards & Engineering Rules

### Framework Principles

- **Zero Hardcoded Menus**: Never hardcode route lists or menu items in layout components; declare them inside module contracts via `navItems` and `routes`.
- **Code Splitting Required**: Always wrap screen components in `React.lazy()` when declaring `ModuleRouteConfig[]`.
- **No render-phase factory calls**: Component definitions or router tree assemblies (`assembleApp`) MUST NOT be called inline inside render bodies without `useMemo`.
- **Typing**: Avoid `any`. Use strict TypeScript interfaces exported from `@cap/shared-types` or package `types/`. This is checked less consistently than it's stated — `technical-debt-report.md` §2.4 has concrete examples (`routeHelpers.tsx`'s `layout?: any`, several `error: any` catch handlers) of where this standard has slipped. Don't add to that list.
- **State Scoping**: Keep transient component state in `useState`/`useReducer`. Only system-wide or cross-module state belongs in `@cap/platform-store` (Zustand).
- **i18n discipline**: All user-facing strings go through `t()`/the module's `i18n` dictionary bundle, even in shared UI packages like `@cap/layout`. A hardcoded locale-specific string in a shared component (found once already — see technical-debt-report.md §1.3) defeats the multi-tenant i18n contract for every other locale.
- **No demo credentials as form defaults**: Don't pre-fill auth forms (`useForm({ defaultValues: ... })`) with real-shaped credentials, even for local dev convenience. Gate any demo-fill behavior behind `import.meta.env.DEV` explicitly, or leave fields empty.

### Cognitive UX & 4 Key Principles Guiding UI

All UI components, workflows, and layouts MUST adhere to the **4 Key UI Principles** and psychological UX heuristics (see [`packages/theme/laws_of_ux.md`](file:///c:/Node.Js/proj/boilerplate/packages/theme/laws_of_ux.md)):

- **4 Key Principles Guiding UI**:
  - **Visual Hierarchy**: Guiding the eye to the most important information first.
  - **Contrast**: Making elements legible and distinct from one another.
  - **Alignment**: Creating visual order to reduce the user's mental effort.
  - **Proximity**: Grouping related elements to indicate that they share a function.
- **Doherty Threshold (<400ms)**: UI transitions and debounce feedback must resolve in <400ms. Operations >400ms require immediate skeleton or optimistic feedback.
- **Fitts’s Law**: Primary touch/click targets must be >= 44x44px (`minHeight: 48px` on inputs).
- **Miller’s Law & Chunking**: Group related fields into cards; navigation menus capped at 5-7 items per section.
- **Postel’s Law**: Be liberal in what you accept (masks/resilient inputs) and conservative in what you send (strict API contracts).
- **Von Restorff Effect**: Isolate primary actions with high visual weight; keep secondary actions neutral.
- **4 UI States Discipline**: Every interactive view must render Idle/Empty, Loading, Success, and Error states.

### Security & Privacy

- **Zero PII Logging**: NEVER log sensitive credentials, authorization tokens, or raw user storage payload objects (`state.user`) to the console.
- **Environment Guards**: Wrap diagnostic logging in `if (import.meta.env.DEV)`.
- **Production Logs**: Keep `console.error` and `console.warn` intact in production for exception tracking.

---

## 6. Development Workflow

- **Scaffold a new module**: `pnpm generate:module` (Plop, see `MODULE_DEVELOPMENT_GUIDE.md`). The shell's `import.meta.glob` auto-discovers it — no manual registration needed.
- **Check package coupling before a large refactor**: `node scripts/analyze-coupling.cjs` writes `docs/MODULE_COUPLING_REPORT.md` with real Ce/Ca/instability metrics per package and DDD sub-module. A report is already committed (`docs/MODULE_COUPLING_REPORT.md`, generated 2026-08-04) — regenerate it fresh rather than trusting that stale copy.
- **Before declaring a route's `layout`**, re-read §4 above.
- **Before adding a new `any`**, check whether the surrounding file is already on the list in `technical-debt-report.md` §2.4 — if so, fixing the type properly while you're there is preferred over adding to the pile.

---

## 7. Key Documentation Index

| Document                             | File Path                                                                                                    | Description                                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| **Architecture Reference**           | [`ARCHITECTURE.md`](file:///c:/Node.Js/proj/boilerplate/ARCHITECTURE.md)                                     | Full multi-tenant framework architecture, layer rules, and provider hierarchy.              |
| **Architecture Review (Aug 2026)**   | [`analysis/architecture-report.md`](file:///c:/Node.Js/proj/boilerplate/analysis/architecture-report.md)     | Principal-level review: dependency graph, theme scalability, layout/routing findings.       |
| **Technical Debt Report (Aug 2026)** | [`analysis/technical-debt-report.md`](file:///c:/Node.Js/proj/boilerplate/analysis/technical-debt-report.md) | UI/UX audit + code-quality audit with severity-ranked findings.                             |
| **Improvement Roadmap (Aug 2026)**   | [`analysis/improvement-roadmap.md`](file:///c:/Node.Js/proj/boilerplate/analysis/improvement-roadmap.md)     | Sequenced, phased fix plan. Awaiting approval before implementation.                        |
| **Laws of UX Reference Guide**       | [`packages/theme/laws_of_ux.md`](file:///c:/Node.Js/proj/boilerplate/packages/theme/laws_of_ux.md)           | Comprehensive 31-principle cognitive UX guide and engineering implementation mapping.       |
| **Module Development Guide**         | [`MODULE_DEVELOPMENT_GUIDE.md`](file:///c:/Node.Js/proj/boilerplate/MODULE_DEVELOPMENT_GUIDE.md)             | Step-by-step guide for creating modules, route declarations, navigation items, and plugins. |
| **Contributing Guide**               | [`CONTRIBUTING.md`](file:///c:/Node.Js/proj/boilerplate/CONTRIBUTING.md)                                     | Environment setup, CLI commands, and PR guidelines.                                         |

---

## 8. Verification, Build & Testing Playbook

### Monorepo Validation Commands

1. **Type-Checking across all packages:**
   ```bash
   pnpm -r run type-check
   ```
   _Expectation:_ Must pass with 0 errors across all 15 packages.
2. **Production Bundle Compilation & Chunk Audit:**
   ```bash
   pnpm --filter @cap/app run build
   ```
   _Expectation:_ `tsc -b && vite build` succeeds. Entry bootstrap bundle `dist/assets/index-*.js` remains slim (< 60 kB gzip). Feature modules are cleanly code-split into `dist/assets/module-*.js` and `vendor-*.js` chunks.
3. **End-to-End Testing against Local Backend:**
   ```bash
   pnpm --filter @cap/app run test:e2e
   ```
   _Prerequisites:_
   - MySQL 9.5 running on `127.0.0.1:3306` (database migrated via `node ace migration:run` and seeded via `node ace db:seed`).
   - Redis / Memurai running on `127.0.0.1:6379`.
   - AdonisJS Backend running on `http://127.0.0.1:3333` (healthcheck: `/health`).
   - Vite Dev Server running on `http://localhost:5173`.

---

## 9. The 17 Specialist Agent Personas & Governance Matrix

Agents working on the Serafort framework can assume or delegate to any of the 17 specialized personas, defined as executable subagents in `.claude/agents/` and governed by `.agents/rules/`:

1. **`@architect`** ([`.claude/agents/architect.md`](file:///c:/Node.Js/proj/boilerplate/.claude/agents/architect.md) | [Rule 01](file:///c:/Node.Js/proj/boilerplate/.agents/rules/01-architecture-governance.md)): Tier boundaries (0-5), `CAPModule` contracts, modularity, circular checks (`pnpm lint:boundaries && pnpm lint:circular`).
2. **`@quality`** ([`.claude/agents/quality.md`](file:///c:/Node.Js/proj/boilerplate/.claude/agents/quality.md) | [Rule 02](file:///c:/Node.Js/proj/boilerplate/.agents/rules/02-code-quality-types.md)): Strict TypeScript, zero `any`, component decomposition (<300 lines), Vitest unit tests (`pnpm -r run type-check`).
3. **`@security`** ([`.claude/agents/security.md`](file:///c:/Node.Js/proj/boilerplate/.claude/agents/security.md) | [Rule 03](file:///c:/Node.Js/proj/boilerplate/.agents/rules/03-security-sentinel.md)): Zero-PII logging, AES-GCM encrypted stores (`packages/platform-store`), protocol whitelisting, `.jules/sentinel.md`.
4. **`@performance`** ([`.claude/agents/performance.md`](file:///c:/Node.Js/proj/boilerplate/.claude/agents/performance.md) | [Rule 04](file:///c:/Node.Js/proj/boilerplate/.agents/rules/04-performance-vitals.md)): Doherty Threshold (<400ms), main bundle size (<60 kB gzip), rAF batching for theme changes.
5. **`@theme-artisan`** ([`.claude/agents/theme-artisan.md`](file:///c:/Node.Js/proj/boilerplate/.claude/agents/theme-artisan.md) | [Rule 05](file:///c:/Node.Js/proj/boilerplate/.agents/rules/05-ui-theme-tokens.md)): 3-layer tokens, 15 tenant presets, 6 visual effect engines (glass, neomorph, bento, brutalism, organic, immersive), zero hardcoded colors.
6. **`@ux-cognitive`** ([`.claude/agents/ux-cognitive.md`](file:///c:/Node.Js/proj/boilerplate/.claude/agents/ux-cognitive.md) | [Rule 06](file:///c:/Node.Js/proj/boilerplate/.agents/rules/06-ux-cognitive-states.md)): 4 Key UI Principles (Visual Hierarchy, Contrast, Alignment, Proximity), 4 UI States (Idle, Loading, Success, Error), Fitts/Miller Laws.
7. **`@a11y-i18n`** ([`.claude/agents/a11y-i18n.md`](file:///c:/Node.Js/proj/boilerplate/.claude/agents/a11y-i18n.md) | [Rule 07](file:///c:/Node.Js/proj/boilerplate/.agents/rules/07-a11y-wcag-i18n.md)): WCAG 2.2 AA, bidirectional parity (LTR/RTL with `stylis-plugin-rtl`), zero hardcoded strings (`t('key', 'default')`).
8. **`@visual-qa`** ([`.claude/agents/visual-qa.md`](file:///c:/Node.Js/proj/boilerplate/.claude/agents/visual-qa.md) | [Rule 08](file:///c:/Node.Js/proj/boilerplate/.agents/rules/08-visual-qa-playwright.md)): Headless browser verification, DOM geometry inspection, and shell hydration testing (`driver.mjs shot ... --shell`).
9. **`@network-boundary`** ([`.claude/agents/network-boundary.md`](file:///c:/Node.Js/proj/boilerplate/.claude/agents/network-boundary.md) | [Rule 09](file:///c:/Node.Js/proj/boilerplate/.agents/rules/09-network-contracts-cache.md)): React Query key factory (`API_QUERY_KEYS`), optimistic rollback lifecycle, AbortSignal cancellation, Zod runtime validation.
10. **`@telemetry-audit`** ([`.claude/agents/telemetry-audit.md`](file:///c:/Node.Js/proj/boilerplate/.claude/agents/telemetry-audit.md) | [Rule 10](file:///c:/Node.Js/proj/boilerplate/.agents/rules/10-observability-telemetry.md)): Zero-PII analytics events, isolated ErrorBoundary widgets, contextual breadcrumbs, Core Web Vitals (INP < 200ms).
11. **`@tenant-lifecycle`** ([`.claude/agents/tenant-lifecycle.md`](file:///c:/Node.Js/proj/boilerplate/.claude/agents/tenant-lifecycle.md) | [Rule 11](file:///c:/Node.Js/proj/boilerplate/.agents/rules/11-tenant-lifecycle-isolation.md)): Client storage keys (`<tenantId>:<userId>:<keyName>`), subscription tier & feature flag pre-mount checks, clean tenant teardown.
12. **`@widget-engine`** ([`.claude/agents/widget-engine.md`](file:///c:/Node.Js/proj/boilerplate/.claude/agents/widget-engine.md) | [Rule 12](file:///c:/Node.Js/proj/boilerplate/.agents/rules/12-widget-engine-plugins.md)): Widget studio runtime, standardized widget manifest contracts, Zod runtime validation for widget props, grid persistence, error boundary isolation.
13. **`@mock-fixtures`** ([`.claude/agents/mock-fixtures.md`](file:///c:/Node.Js/proj/boilerplate/.claude/agents/mock-fixtures.md) | [Rule 13](file:///c:/Node.Js/proj/boilerplate/.agents/rules/13-mock-fixtures-contracts.md)): MSW handlers and synthetic datasets derived directly from `@cap/api-contracts`, multi-tenant seed datasets (heavy vs empty), error presets (`mockNetworkError`, `mockRateLimit`, `mockExpiredSession`).
14. **`@release-dx`** ([`.claude/agents/release-dx.md`](file:///c:/Node.Js/proj/boilerplate/.claude/agents/release-dx.md) | [Rule 14](file:///c:/Node.Js/proj/boilerplate/.agents/rules/14-release-dx-workspaces.md)): pnpm workspace dependency synchronization (React 19, TypeScript 5.8, MUI v7), Rollup chunk budgets, Vite build times, Plop generators (`pnpm generate:module`).
15. **`@compliance-governance`** ([`.claude/agents/compliance-governance.md`](file:///c:/Node.Js/proj/boilerplate/.claude/agents/compliance-governance.md) | [Rule 15](file:///c:/Node.Js/proj/boilerplate/.agents/rules/15-compliance-governance-audit.md)): GDPR/HIPAA/SOC 2 compliance, immutable client audit trails for sensitive resources, inactivity lockouts, third-party script isolation.
16. **`@e2e-journey`** ([`.claude/agents/e2e-journey.md`](file:///c:/Node.Js/proj/boilerplate/.claude/agents/e2e-journey.md) | [Rule 16](file:///c:/Node.Js/proj/boilerplate/.agents/rules/16-e2e-journey-workflows.md)): Multi-screen Playwright user journeys, dynamically assembled route transitions, browser back/forward/refresh persistence, strict `AppPaths` enforcement (`pnpm lint:routes`).
17. **`@flow-state`** ([`.claude/agents/flow-state.md`](file:///c:/Node.Js/proj/boilerplate/.claude/agents/flow-state.md) | [Rule 17](file:///c:/Node.Js/proj/boilerplate/.agents/rules/17-flow-state-lifecycle.md)): Cross-screen data passing prioritization (URL query parameters over hidden state with Zero-PII), `<Suspense>` skeletons for <400ms Doherty threshold, unmount state cleanup.

---

## 10. Autonomous 7-Step Multi-Agent Lifecycle

All agent operations must strictly adhere to the continuous 7-step engineering loop:
`Plan -> Test -> Implement -> Review -> Verify -> Remember -> Improve`.

1. **Plan**:
   - Query Graphify (`graphify query "<question>"`, `graphify path "<A>" "<B>"`).
   - Check package tier boundaries (Tiers 0 through 5).
   - Review prior lessons in `.agents/memory/lessons-learned.md`.
   - Post active task context to `.agents/blackboard/active-task.json`.
2. **Test**:
   - Write or identify failing Vitest or Playwright assertions before making production edits.
3. **Implement**:
   - Apply token-based styles, strict types, modular components (<300 lines), and Zero-PII logging.
4. **Review**:
   - Execute architectural checks: `pnpm lint:boundaries`, `pnpm lint:routes`, `pnpm lint:circular`.
   - Cross-audit against relevant specialist persona rules.
5. **Verify**:
   - Run `pnpm -r run type-check` across all 15 packages.
   - Run package Vitest tests.
   - Run visual driver: `node .claude/skills/run-serafort-app/driver.mjs shot <path> <file> --shell`.
6. **Remember**:
   - Record newly discovered gotchas, race conditions, or patterns in `.agents/memory/lessons-learned.md`.
7. **Improve**:
   - Adapt rules, add regression tests, and synchronize the AST knowledge graph: `graphify update .`.

---

## 11. Inter-Agent Blackboard & Dynamic Delegation Protocol

### Blackboard Collaboration
- Agents communicate and share state via `.agents/blackboard/active-task.json`.
- Visual QA screenshots and DOM measurements are stored in `.agents/blackboard/shots/` for cross-agent reference.

### Delegation Handshake
- Any agent can delegate to another specialist by issuing a structured delegation contract:
  ```markdown
  DELEGATE TO: @specialist-name
  OBJECTIVE: Specific goal
  CONTEXT: .agents/blackboard/active-task.json
  EXPECTED DELIVERABLE: Code, tests, or visual screenshot artifact
  ```

---

## 12. Knowledge Graph (Graphify) & Visual QA Integration

### Graphify
- The project knowledge graph lives at `graphify-out/`.
- Query first for architecture questions (`graphify query`, `graphify explain`).
- Update the AST graph after code modifications: `graphify update .`.

### Visual QA Playwright Driver
- The driver at `.claude/skills/run-serafort-app/driver.mjs` probes DOM state, captures screenshots, and measures geometry.
- For authenticated routes (`/dashboard`), **always pass `--shell`** to handle the 2.5-second white backdrop hydration veil.
