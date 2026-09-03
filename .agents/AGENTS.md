# AGENTS.md — CAP Framework Developer & AI Agent Context

This document provides complete architectural context, coding standards, theme strategies, framework principles, and development workflows for AI coding agents and engineering contributors working on the **CAP Multi-Tenant SaaS Framework**.

> **Before making changes**, also check `/analysis/architecture-report.md`, `/analysis/technical-debt-report.md`, and `/analysis/improvement-roadmap.md` — a full principal-level review (August 2026) with file-level findings. This file gives you the stable mental model; those three give you the current, dated punch list. If you're about to touch routing, layout, or `LayoutRouteWrapper`, read "Known Gaps" below first — it will save you from re-deriving a bug that's already diagnosed.

---

## 1. Framework Identity & Monorepo Architecture Overview

The workspace is a multi-tenant, modular web framework built with React 19, TypeScript, Material UI (MUI v7), Zustand, and Vite, managed via `pnpm` workspaces.

### Package Inventory & Layer Hierarchy

```
Tier 5: Shell App             [@cap/app]
                                  │
Tier 4: Feature Modules       [@cap/module-auth, @cap/module-landing, @cap/module-theme]
                                  │
Tier 3: Platform Façade       [@cap/platform-core]
                                  │
Tier 2: Platform Services     [@cap/layout, @cap/auth-contracts]
                                  │
Tier 1: Core Domain           [@cap/platform-store, @cap/theme, @cap/api-contracts]
                                  │
Tier 0: Foundation            [@cap/shared-types]
```

> **Note on "enforcement":** the tier diagram above is the **conceptual** model used throughout the docs. The tooling-side grouping in `eslint.config.js` uses a *different*, more granular set of layers (`FOUNDATION`/`LAYER_1`…`LAYER_6` — e.g. `@cap/layout` is `LAYER_4` there and `@cap/platform-core` is `LAYER_3`, so `layout → platform-core` imports are legal). As of this writing the `layerConfigs` defined in that file are **not yet wired into any active ESLint config** (the root config's default export is only `baseConfig`; per-package configs don't apply them), so the boundaries are aspirational rather than enforced today. The same file also lists several `@cap/module-*` and `@cap/civil-registry` packages that **do not exist yet on disk** (provisioned ahead of creation) — don't be misled into thinking they're missing/broken; see technical-debt-report.md §2.1 before "fixing" this.

#### Package Responsibilities

* **`@cap/shared-types`** (`packages/shared-types`): Zero-dependency TypeScript type declarations, domain entities, API contracts (`CAPModule`, `TenantThemeConfig`, `AccessPolicy`, `SearchItemConfig`).
* **`@cap/api-contracts`** (`packages/api-contracts`): API query key factories, request/response models, and endpoint schema declarations.
* **`@cap/platform-store`** (`packages/platform-store`): Main Zustand global state management (`useAppStore`) with encrypted persistent storage (`secureStorage`), sliced by domain.
* **`@cap/theme`** (`packages/theme`): MUI v7 design tokens, token composition (`composeMuiTheme`), tenant theme context (`TenantThemeProvider`), visual effects (glassmorphism, neumorphism, bento, brutalism, organic, immersive), component overrides, baseline styles, and default `themeConfig`.
* **`@cap/auth-contracts`** (`packages/auth-contracts`): Contracts and administrative services specific to identity and access management.
* **`@cap/layout`** (`packages/layout`): Structural layout components (`VerticalLayout`, `HorizontalLayout`, `PublicLayout`, `BlankLayout`), navigation shells, `ThemeBridge`, `ModuleMenuRenderer`, and `SkipToContent`.
* **`@cap/platform-core`** (`packages/platform-core`): Central orchestration façade for runtime module assembly (`assembleApp`), routing, i18n initialization, plugin registry (`globalPluginRegistry`), `TenantProvider`, and `LayoutRouteWrapper`.
* **`@cap/module-auth`** (`packages/modules/auth`): Complete IDaaS module encompassing auth-core, MFA, passwordless, SAML, JWKS, identity broker, user directory, and session management.
* **`@cap/module-landing`** (`packages/modules/landing`): Public marketing pages, workflow step pipeline, pricing tables, contact forms, and legal screens.
* **`@cap/module-theme`** (`packages/modules/theme`): Tenant branding module — theme preset picker and live `ColorPaletteEditor` for the tenant design system.
* **`@cap/app`** (`app`): Shell application entry point (`main.tsx`), provider assembly (`Providers.tsx`), top-level layout selector (`layout.tsx`), Vite config, and Playwright e2e tests.

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

**Known gap:** in `composeMuiTheme.ts`, only `primary`/`secondary` derive their `light`/`dark`/opacity variants from the tenant token at runtime (via `lighten()`/`darken()`). `error`/`warning`/`success`/`info` only tokenize `main`; their `light`/`dark`/opacity variants are hardcoded literals. If you're building tenant branding UI, know that customizing a status color's `main` today will produce a mismatched `light`/`dark` pair — see technical-debt-report.md §1's theme section (K) before assuming full status-color tenantization already works.

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
* **Zero Hardcoded Menus**: Never hardcode route lists or menu items in layout components; declare them inside module contracts via `navItems` and `routes`.
* **Code Splitting Required**: Always wrap screen components in `React.lazy()` when declaring `ModuleRouteConfig[]`.
* **No render-phase factory calls**: Component definitions or router tree assemblies (`assembleApp`) MUST NOT be called inline inside render bodies without `useMemo`.
* **Typing**: Avoid `any`. Use strict TypeScript interfaces exported from `@cap/shared-types` or package `types/`. This is checked less consistently than it's stated — `technical-debt-report.md` §2.4 has concrete examples (`routeHelpers.tsx`'s `layout?: any`, several `error: any` catch handlers) of where this standard has slipped. Don't add to that list.
* **State Scoping**: Keep transient component state in `useState`/`useReducer`. Only system-wide or cross-module state belongs in `@cap/platform-store` (Zustand).
* **i18n discipline**: All user-facing strings go through `t()`/the module's `i18n` dictionary bundle, even in shared UI packages like `@cap/layout`. A hardcoded locale-specific string in a shared component (found once already — see technical-debt-report.md §1.3) defeats the multi-tenant i18n contract for every other locale.
* **No demo credentials as form defaults**: Don't pre-fill auth forms (`useForm({ defaultValues: ... })`) with real-shaped credentials, even for local dev convenience. Gate any demo-fill behavior behind `import.meta.env.DEV` explicitly, or leave fields empty.

### Security & Privacy
* **Zero PII Logging**: NEVER log sensitive credentials, authorization tokens, or raw user storage payload objects (`state.user`) to the console.
* **Environment Guards**: Wrap diagnostic logging in `if (import.meta.env.DEV)`.
* **Production Logs**: Keep `console.error` and `console.warn` intact in production for exception tracking.

---

## 6. Development Workflow

* **Scaffold a new module**: `pnpm generate:module` (Plop, see `MODULE_DEVELOPMENT_GUIDE.md`). The shell's `import.meta.glob` auto-discovers it — no manual registration needed.
* **Check package coupling before a large refactor**: `node scripts/analyze-coupling.cjs` writes `docs/MODULE_COUPLING_REPORT.md` with real Ce/Ca/instability metrics per package and DDD sub-module. A report is already committed (`docs/MODULE_COUPLING_REPORT.md`, generated 2026-08-04) — regenerate it fresh rather than trusting that stale copy.
* **Before declaring a route's `layout`**, re-read §4 above.
* **Before adding a new `any`**, check whether the surrounding file is already on the list in `technical-debt-report.md` §2.4 — if so, fixing the type properly while you're there is preferred over adding to the pile.

---

## 7. Key Documentation Index

| Document | File Path | Description |
|---|---|---|
| **Architecture Reference** | [`ARCHITECTURE.md`](file:///c:/Node.Js/proj/boilerplate/ARCHITECTURE.md) | Full multi-tenant framework architecture, layer rules, and provider hierarchy. |
| **Architecture Review (Aug 2026)** | [`analysis/architecture-report.md`](file:///c:/Node.Js/proj/boilerplate/analysis/architecture-report.md) | Principal-level review: dependency graph, theme scalability, layout/routing findings. |
| **Technical Debt Report (Aug 2026)** | [`analysis/technical-debt-report.md`](file:///c:/Node.Js/proj/boilerplate/analysis/technical-debt-report.md) | UI/UX audit + code-quality audit with severity-ranked findings. |
| **Improvement Roadmap (Aug 2026)** | [`analysis/improvement-roadmap.md`](file:///c:/Node.Js/proj/boilerplate/analysis/improvement-roadmap.md) | Sequenced, phased fix plan. Awaiting approval before implementation. |
| **Module Development Guide** | [`MODULE_DEVELOPMENT_GUIDE.md`](file:///c:/Node.Js/proj/boilerplate/MODULE_DEVELOPMENT_GUIDE.md) | Step-by-step guide for creating modules, route declarations, navigation items, and plugins. |
| **Theme System Guide** | [`packages/theme/THEME_SYSTEM.md`](file:///c:/Node.Js/proj/boilerplate/packages/theme/THEME_SYSTEM.md) | Design token pipeline, theme presets, and visual effect generators. |
| **Design System Standards** | [`packages/theme/DESIGN_SYSTEM.md`](file:///c:/Node.Js/proj/boilerplate/packages/theme/DESIGN_SYSTEM.md) | MUI component styling rules, typography standards, and accessibility requirements. |
| **Contributing Guide** | [`CONTRIBUTING.md`](file:///c:/Node.Js/proj/boilerplate/CONTRIBUTING.md) | Environment setup, CLI commands, and PR guidelines. |
