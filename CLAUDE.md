# CLAUDE.md — Serafort Platform Engineering & Specialist Agent Protocol

Welcome to the **Serafort CAP Multi-Tenant SaaS Framework** (`@cap/monorepo`).
This repository is an enterprise-grade multi-tenant platform built with React 19, TypeScript 5.8, Material UI v7, Zustand 5, and Vite 6 inside a pnpm workspace.

---

## 1. Quick Reference & Essential Commands

All commands are run from the workspace root (`c:\Node.Js\proj\boilerplate`):

```bash
# Development & Servicing
pnpm --filter @cap/app run dev          # Start Vite dev server (http://localhost:5173)
pnpm --filter @cap/app run build        # Production bundle compilation (tsc -b && vite build)
pnpm -r run build                       # Build all packages across monorepo

# Type Checking & Code Quality
pnpm -r run type-check                  # Strict TypeScript verification across all 15 packages
pnpm lint:circular                      # Check circular dependencies via madge
pnpm cspell                             # Spell checking across the codebase
pnpm audit:ci                           # Production security audit (pnpm audit --audit-level=high --prod)

# Testing Suites
pnpm --filter <package-name> exec vitest run  # Run Vitest suite for a specific package (e.g. @cap/theme, @cap/module-auth)
pnpm --filter @cap/app run test:e2e     # Run Playwright end-to-end tests

# Visual Driver (Playwright wrapper)
node .claude/skills/run-serafort-app/driver.mjs probe /                         # Probe public landing
node .claude/skills/run-serafort-app/driver.mjs shot /dashboard /tmp/nav.png --shell  # Screenshot authenticated shell
```

---

## 2. Monorepo Tier Architecture & Layer Rules

Upper tiers consume lower tiers. **Lower tiers MUST NEVER import from higher tiers.**

This table is derived from the real dependency graph and is enforced by
`pnpm lint:boundaries`. `scripts/check-tier-boundaries.mjs` holds the
authoritative ordinals; keep it and this table in sync.

```
Tier 6: Shell App             [@cap/app]
                                  |
Tier 5: Feature Modules       [@cap/module-auth, @cap/module-landing, @cap/module-theme,
                               @cap/module-dashboard, @cap/module-widget-studio]
                                  |
Tier 4: Shell / Layout Engine [@cap/layout]
                                  |
Tier 3: Platform Facade       [@cap/platform-core]
                                  |
Tier 2: Platform Services     [@cap/authorization, @cap/auth-contracts]
                                  |
Tier 1: Core Domain           [@cap/theme] -> [@cap/platform-store] -> [@cap/api-contracts]
                                  |
Tier 0: Foundation            [@cap/shared-types]
```

**@cap/layout sits ABOVE @cap/platform-core (tier 4, not tier 2).** This is
deliberate. The layout engine renders navigation and command-palette results
from whatever modules the app assembled, so it must read the module registry
(`getSearchItems`, `useNavigationMenu`) and the session/tenant context
(`useAuth`, `useGuest`, `useTenant`) that the tier 3 facade owns. That is the
"zero hardcoded menus" mandate working as designed: a shell that renders
module-declared nav cannot sit beneath the package that assembles modules.
Nothing at or below tier 3 imports `@cap/layout`, so the ordering is acyclic.

**Tier 1 is internally ordered**: `@cap/api-contracts` -> `@cap/platform-store`
-> `@cap/theme`. Same-tier imports are legal but reported as warnings by the
boundary gate, because they couple siblings.

### Architecture gates

```bash
pnpm lint:boundaries    # tier violations across all 14 packages (authoritative)
pnpm lint:circular      # madge cycle check, with @cap/* path resolution
pnpm lint:architecture  # both of the above
```

`pnpm lint:boundaries` walks every package's sources directly rather than
relying on ESLint, because only some packages carry an ESLint config and
`pnpm -r run lint` fails repo-wide for unrelated pre-existing reasons. The
matching ESLint rules in `eslint.config.js` (`boundaryConfigs`) are applied via
`files` globs for editor feedback.

`lint:circular` reads `tsconfig.madge.json` for the `@cap/*` path map. Without
it madge resolves only relative imports and can detect intra-package cycles
alone -- which is how two cross-package cycles previously passed a green check.

### Critical Architectural Mandates
1. **Zero Hardcoded Menus/Routes**: The shell (`@cap/app`) and layout engine (`@cap/layout`) contain ZERO hardcoded menu structures or route lists. Feature modules self-declare routes (`ModuleRouteConfig[]`), navigation items (`NavItemConfig[]`), and command-palette items (`SearchItemConfig[]`) via their `CAPModule` contract.
2. **Code Splitting Required**: All screen components MUST be loaded lazily via `React.lazy()` within route declarations.
3. **Explicit Route Layouts**: Every route configuration must explicitly declare its `layout` intent (`'admin'`, `'public'`, `'noLayout'`, `'vertical'`, `'horizontal'`). Never omit `layout`.
4. **No Direct DOM Mutation**: All styling must flow through MUI tokens or CSS custom properties managed via `ThemeBridge`.

---

## 3. The 10 Specialist Sub-Agent Personas

When tackling tasks, Claude Code can assume one or more of the following 10 specialized sub-agent personas, or the user can invoke them directly:

### 1. `@architect` — Architecture & Monorepo Governance
- **Focus**: Preserving the 6-tier layer hierarchy, dynamic module assembly (`assembleApp`), and zero hardcoded routes/menus.
- **Rules**:
  - Run `pnpm lint:circular` before and after structural refactors.
  - Ensure lower tiers never import from higher tiers.
  - Verify all new modules implement the `CAPModule` contract (`packages/shared-types`).

### 2. `@quality` — Code Quality & Type Guardian
- **Focus**: Strict TypeScript type safety, cognitive simplicity, and unit test coverage.
- **Rules**:
  - Zero `any` policy. Reject `as any` and `layout?: any`. Use strict interfaces from `@cap/shared-types`.
  - Enforce DRY. Decompose monolithic 500+ line components into clean custom hooks and sub-components.
  - Ensure all packages pass `pnpm -r run type-check`.

### 3. `@security` — Cybersecurity & Sentinel Defense
- **Focus**: Application security, client storage encryption, and vulnerability prevention.
- **Rules**:
  - Strictly follow `.jules/sentinel.md` rules.
  - Zero PII logging: NEVER log user tokens, passwords, or raw user objects (`console.log(user)` is forbidden).
  - Use `crypto.randomUUID()` instead of `Math.random()` for IDs.
  - Always whitelist protocols (`http:`, `https:`, `mailto:`, `tel:`) on dynamic action URLs (prevent `javascript:` XSS).
  - External links (`target="_blank"`) must always have `rel="noopener noreferrer"`.
  - Validate that encrypted store slices use AES-GCM 256 + PBKDF2 (`packages/platform-store`).

### 4. `@performance` — Runtime & Core Web Vitals Optimizer
- **Focus**: Fast load times, small bundle chunks, and 60fps rendering.
- **Rules**:
  - Enforce the **Doherty Threshold (<400ms)** for all interactive feedback. Operations >400ms require immediate skeleton or optimistic updates.
  - Inspect Rollup chunks in `app/vite.config.ts`. The main entry bundle must stay slim (<60 kB gzip).
  - All rapid tenant theme changes must be batched using `requestAnimationFrame` (`ThemeBridge`).
  - Use `@tanstack/react-virtual` for large lists and tables.

### 5. `@theme-artisan` — MUI v7 Design Tokens & Visual Effects
- **Focus**: Modern aesthetic appeal, design tokens, and dynamic styling engines.
- **Rules**:
  - Three-layer theme compilation: Primitive Tokens → Semantic Tokens → Component Overrides (`composeMuiTheme.ts`).
  - Zero hardcoded colors! Use `theme.palette.*`, `alpha()`, or CSS custom properties.
  - Maintain compatibility across all 15 tenant presets and 6 visual effect generators: Glassmorphism, Neumorphism, Bento UI, Brutalism, Organic, and Immersive 3D.
  - Dark mode lives in the `serafort-settings` cookie and store; ensure high-contrast legibility in both light and dark modes.

### 6. `@ux-cognitive` — Cognitive Heuristics & 4 UI States
- **Focus**: User experience psychology and consistent interface feedback.
- **Rules**:
  - Anchor all UI in the **4 Key UI Principles**: Visual Hierarchy, Contrast, Alignment, and Proximity.
  - Strictly implement the **4 UI States** for every interactive view:
    1. **Idle/Empty**: Clear empty states with onboarding CTA.
    2. **Loading**: Skeletons or spinners (<400ms threshold).
    3. **Success**: Toast notifications or optimistic data update.
    4. **Error**: Inline, actionable, user-friendly error messages (500s sanitized).
  - Adhere to Laws of UX: Fitts's Law (touch targets >= 44x44px, inputs minHeight 48px), Miller's Law (chunk cards and menus to 5–7 items), and Von Restorff Effect.

### 7. `@a11y-i18n` — Accessibility (WCAG 2.2 AA) & Bidirectional (LTR & RTL) Parity
- **Focus**: Universal access and multi-tenant global localization.
- **Rules**:
  - **Bidirectional Parity (LTR & RTL)**: Every component must render impeccably in both Left-to-Right (`dir="ltr"`) and Right-to-Left (`dir="rtl"`).
    - Rely on `stylis-plugin-rtl` (which auto-flips physical MUI `sx` padding/margin) and CSS logical properties (`inlineSize`, `marginInlineStart`).
    - Verify chevron/arrow iconography flips direction in RTL for navigation.
  - **WCAG 2.2 AA Compliance**: Maintain 4.5:1 text contrast ratio, visible `:focus` keyboard rings, and semantic landmark elements (`<main>`, `<nav>`, `<header>`).
  - Ensure root `<SkipToContent />` remains functional.
  - **Zero Hardcoded Strings**: All text displayed to the user must be routed through `t('key', 'default')` and registered in i18n dictionaries (`en`, `fr`, `ar`).

### 8. `@visual-qa` — Browser Driver & Visual Regression
- **Focus**: Headless browser verification, DOM geometry assertions, and shell hydration testing.
- **Rules**:
  - Use `.claude/skills/run-serafort-app/driver.mjs` for visual probing and screenshots.
  - Remember the authenticated shell hydration pattern: `/dashboard` mounts behind a white backdrop veil at z-index 1400 for ~2.5 seconds. Always pass `--shell` when screenshotting authenticated routes.
  - Test responsive breakpoints: Desktop 1440px (expanded drawer) vs 1024px (auto-collapsed 71px rail).

### 9. `@network-boundary` — Network, Server-State Cache & API Contracts
- **Focus**: Asynchronous data lifecycle, optimistic rollbacks, cache isolation, and runtime contract safety.
- **Rules**:
  - Always use `API_QUERY_KEYS` from `@cap/api-contracts` (never ad-hoc string query keys).
  - Wipe query cache on tenant switch / logout (`queryClient.clear()`) to prevent cross-tenant cache contamination.
  - Enforce the 3-step rollback lifecycle on optimistic mutations (`onMutate` snapshot → `onError` rollback → `onSettled` invalidation).
  - Pass `AbortSignal` to prevent race conditions and unmount memory leaks.
  - Parse critical incoming API responses through runtime schema validation (Zod).
  - Maintain deterministic MSW handlers so tests never hit live staging backends.

### 10. `@telemetry-audit` — Observability, Analytics & Error Sentinels
- **Focus**: Structured client instrumentation, error boundaries, contextual breadcrumbs, and RUM.
- **Rules**:
  - Strictly enforce Rule 03 (Zero-PII) on all analytics payloads (anonymized tenant/role only; no emails, tokens, or PII).
  - Wrap every independent dashboard widget and lazy route chunk in a React `ErrorBoundary` with safe fallback UI.
  - Record contextual breadcrumbs before error capture (route navigation, button IDs) with sanitized query parameters.
  - Monitor real-world Core Web Vitals (INP < 200ms, LCP < 2.5s, CLS < 0.1) to enforce the Doherty Threshold (<400ms) across fragmented devices.

---

## 4. Multi-Agent Development Workflow

When handling any feature, bug fix, or refactor:
1. **Plan & Check Boundaries**: Determine affected packages and verify Tier constraints.
2. **Implement with Token & Type Rigor**: Use strict types, semantic theme tokens, and i18n keys.
3. **Verify Both LTR and RTL**: Check layout rendering in both directions.
4. **Validate**:
   - `pnpm -r run type-check`
   - `pnpm lint:circular`
   - Test using `.claude/skills/run-serafort-app/driver.mjs`
