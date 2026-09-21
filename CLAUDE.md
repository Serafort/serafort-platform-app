# CLAUDE.md — Serafort Platform Engineering & Specialist Agent Protocol

Welcome to the **Serafort Multi-Tenant SaaS Framework** (`@cap/monorepo`).
This repository is an enterprise-grade multi-tenant platform built with React 19, TypeScript 7, Material UI v7, Zustand 5, and Vite 6 inside a pnpm workspace.

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
pnpm lint:boundaries          # tier violations across all 14 packages, bare-specifier scan
pnpm lint:boundaries:eslint   # same tier table, via eslint-plugin-boundaries + real import resolution
pnpm lint:routes              # navigation targets must come from AppPaths, not bare literals
pnpm lint:circular            # madge cycle check, with @cap/* path resolution
pnpm lint:architecture        # all four of the above
```

Two independent checks enforce the same tier table on purpose, not out of
redundancy. `pnpm lint:boundaries` (`scripts/check-tier-boundaries.mjs`) walks
every package's sources directly and regex-matches bare `@cap/x` import
specifiers; it runs standalone with no ESLint dependency, which matters
because only some packages carry a working ESLint config and `pnpm -r run
lint` fails repo-wide for unrelated pre-existing reasons.

But a specifier-string regex cannot see a **relative-path escape** across a
package boundary - e.g. a file in `packages/layout/src` importing
`../../../platform-core/src/foo` instead of `from '@cap/platform-core'`. Only
that second form would be caught by the script above. `pnpm
lint:boundaries:eslint` closes that gap: it runs `eslint-plugin-boundaries`
against the *same* tier table (`eslint.config.js` imports `TIERS`/
`PACKAGE_DIRS` from `scripts/check-tier-boundaries.mjs` rather than copying
them, so the two can never disagree), but the plugin resolves every import to
its real file first, so a relative escape gets classified by the file it
actually points at and flagged all the same. This is invoked with
`--config eslint.config.js` explicitly rather than relying on ESLint's normal
config discovery, because most packages have their own self-contained
`eslint.config.js` for ordinary linting that would otherwise take over instead.

`lint:circular` reads `tsconfig.madge.json` for the `@cap/*` path map (the same
file `lint:boundaries:eslint`'s import resolver uses to resolve `@cap/x` to
its `src/`, not its built `dist/`). Without it madge resolves only relative
imports and can detect intra-package cycles alone -- which is how two
cross-package cycles previously passed a green check.

`lint:routes` (`scripts/check-route-literals.mjs`) guards route paths from the
opposite side to `appPathsParity.test.ts`. That test proves every path declared
in `AppPaths` resolves to a route the router serves, and that every registered
route is declared there. What it cannot see is a URL that was never added to
`AppPaths` at all -- a literal typed straight into a `navigate()` call. Those
bypass the parity guard entirely, and they are how this codebase's dead links
survived: `resolveRedirectPathForUser` returned a hardcoded `'/provider'` that
no module registers, so every participant sign-in landed on the not-found
screen, and nothing failed. `lint:routes` scans for path-shaped literals used as
destinations and requires each to match a declared path, so the two checks
together close the loop.

### Critical Architectural Mandates
1. **Zero Hardcoded Menus/Routes**: The shell (`@cap/app`) and layout engine (`@cap/layout`) contain ZERO hardcoded menu structures or route lists. Feature modules self-declare routes (`ModuleRouteConfig[]`), navigation items (`NavItemConfig[]`), and command-palette items (`SearchItemConfig[]`) via their `CAPModule` contract.
2. **Code Splitting Required**: All screen components MUST be loaded lazily via `React.lazy()` within route declarations.
3. **Explicit Route Layouts**: Every route configuration must explicitly declare its `layout` intent (`'admin'`, `'public'`, `'noLayout'`, `'vertical'`, `'horizontal'`). Never omit `layout`.
4. **No Direct DOM Mutation**: All styling must flow through MUI tokens or CSS custom properties managed via `ThemeBridge`.

---

## 3. Project Agents (`.claude/agents/`) & The 17 Specialist Personas

### Project-Level Specialist Agents (`.claude/agents/`)
- **`tier-architect`** (`.claude/agents/tier-architect.md`):
  - **Role**: Read-only architecture reviewer for monorepo package tiers and import directions.
  - **Triggers**: Adding packages, changing imports across packages, modifying `CAPModule` contracts, or routing structure.
  - **Focus**: Enforcing the 6-tier boundary rules (`scripts/check-tier-boundaries.mjs`), `CAPModule` contract exports, and `AppPaths` routing standard.
- **`react-reviewer`** (`.claude/agents/react-reviewer.md`):
  - **Role**: Read-only React 19, MUI v7, and state management specialist.
  - **Triggers**: Modifying `.tsx` components, custom hooks, Zustand stores, TanStack queries, or MUI theme bindings.
  - **Focus**: React 19 concurrent hooks, zero hardcoded colors (MUI tokens / `ThemeBridge` CSS custom properties), Zustand 5 state hygiene, dynamic `React.lazy()` chunking, and RTL parity.

### The 17 Specialist Sub-Agent Personas

When tackling tasks, agents can assume one or more of the following 17 specialized sub-agent personas, or collaborate via direct delegation:

### 1. `@architect` — Architecture & Monorepo Governance
- **Focus**: Preserving the 6-tier layer hierarchy, dynamic module assembly (`assembleApp`), and zero hardcoded routes/menus.
- **Rules**:
  - Run `pnpm lint:circular` and `pnpm lint:boundaries` before and after structural refactors.
  - Ensure lower tiers never import from higher tiers.
  - Verify all new modules implement the `CAPModule` contract (`packages/shared-types`).

### 2. `@quality` — Code Quality & Type Guardian
- **Focus**: Strict TypeScript type safety, cognitive simplicity, and unit test coverage.
- **Rules**:
  - Zero `any` policy. Reject `as any` and `layout?: any`. Use strict interfaces from `@cap/shared-types`.
  - Enforce DRY. Decompose monolithic 300+ line components into clean custom hooks and sub-components.
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

### 11. `@tenant-lifecycle` — Multi-Tenancy & Isolation Sentinel
- **Focus**: Enforcing multi-tenant boundaries, feature flag resolution, and tenant lifecycle state.
- **Rules**:
  - Audit storage keys (IndexedDB, localStorage, session storage) to guarantee strict tenant-prefixed scoping (`tenantId:userId:key`).
  - Enforce tenant entitlement boundaries: ensure route guards, widget catalogs, and layout renderers check active tenant subscription tiers and feature flags before mounting.
  - Validate tenant teardown flows: verify complete unmounting, active worker termination, and state resets when a user switches organizations.

### 12. `@widget-engine` — Extensibility, Dynamic Plugins & Schema UI
- **Focus**: Runtime architecture for `@cap/module-widget-studio`, dynamic dashboards, and modular plugin injection.
- **Rules**:
  - Verify all widget definitions strictly adhere to a standardized widget manifest contract (props schema, supported layouts, permission requirements).
  - Validate JSON Schema / Zod runtime validation for all user-configurable widget settings.
  - Enforce lazy-chunk isolation and defensive error boundaries so a single failing widget never crashes the entire dashboard canvas.
  - Guard dashboard grid persistence (coordinates, responsive breakpoints, auto-packing).

### 13. `@mock-fixtures` — Synthetic Data, MSW & Contract Parity
- **Focus**: Coordinating offline development, mock service worker (MSW) state machines, and contract fixtures.
- **Rules**:
  - Ensure every MSW handler derives its types and response payloads directly from `@cap/api-contracts` (no manually duplicated mock interfaces).
  - Maintain realistic, multi-tenant seed datasets (e.g., Tenant A with 50 widgets vs. Tenant B with empty state) to test empty, loading, error, and heavy-data states deterministically.
  - Provide scenario presets for tests and visual QA (e.g., `mockNetworkError(500)`, `mockRateLimit(429)`, `mockExpiredSession()`).

### 14. `@release-dx` — Monorepo Tooling, CI/CD & Workspace Health
- **Focus**: Governing pnpm workspaces, build pipelines, dependency deduplication, and developer tooling.
- **Rules**:
  - Monitor workspace dependency synchronization (ensure all packages share identical versions of React 19, TypeScript 7, and MUI v7).
  - Optimize build pipelines: monitor Rollup chunk budgets (<60 kB gzip main bundle), Vite build times, and cache hit rates in CI.
  - Maintain module scaffolding scripts (running Plop generators to bootstrap a compliant Tier 5 `@cap/module-*` package with zero boundary violations).

### 15. `@compliance-governance` — Regulatory Privacy, Audit Trails & Policy
- **Focus**: Managing client-side GDPR/HIPAA/SOC 2 compliance, audit logs, and consent tracking.
- **Rules**:
  - Ensure user interactions on critical resources (e.g., exporting tenant data, modifying user roles, changing encryption keys) fire an immutable client audit event to the telemetry pipeline.
  - Audit session timeout and idle lock behaviors for tenants with elevated compliance requirements (e.g., healthcare or financial presets).
  - Verify third-party script isolation and cookie consent management within multi-tenant configurations.

### 16. `@e2e-journey` — End-to-End Human Workflow Simulator
- **Focus**: Multi-step user journeys, cross-screen navigation, and dynamic route resolution.
- **Rules**:
  - Rely on Playwright (`pnpm --filter @cap/app run test:e2e`) to script realistic, multi-screen tasks mimicking human behavior (e.g., Sign-in -> Dashboard -> Command Palette -> Widget Studio).
  - Validate that dynamically assembled routes from `ModuleRouteConfig[]` and `NavItemConfig[]` correctly transition without breaking the shell or triggering 404s.
  - Explicitly test browser-native interactions: back/forward button traversal, refresh persistence, and direct deep-linking into authenticated sub-routes.
  - Ensure the router strictly uses destinations declared in `AppPaths` during screen transitions rather than hardcoded literals, enforcing the `lint:routes` architectural mandate.

### 17. `@flow-state` — Cross-Screen Context & State Guardian
- **Focus**: Data persistence between screens, multi-step form handoffs, and URL parameter integrity.
- **Rules**:
  - Verify that passing data between screens prioritizes URL query parameters (for shareability and bookmarking) over hidden Zustand 5 memory state, while strictly enforcing the Zero-PII rule on those URLs.
  - Validate that route transitions trigger the correct `<Suspense>` skeletons when lazily loading screen chunks via `React.lazy()`, ensuring the <400ms Doherty Threshold is maintained across navigation.
  - Audit the cleanup lifecycle when leaving a screen: ensure page-specific Zustand stores or React Query caches don't leak memory or carry stale context into the next screen.
  - Test the handoff phase between two distinct modules to ensure the 4 UI States (Idle, Loading, Success, Error) trigger consistently across the boundary.

---

## 4. Autonomous 7-Step Multi-Agent Lifecycle

Every engineering task MUST strictly adhere to the continuous 7-step engineering loop:
`Plan -> Test -> Implement -> Review -> Verify -> Remember -> Improve`.

1. **Plan**: Query Graphify (`graphify query`), identify affected packages and Tier boundaries (0-5), review `.agents/memory/lessons-learned.md`.
2. **Test**: Define and scaffold assertions (Vitest or Playwright) before changing production code.
3. **Implement**: Write modular code respecting strict types, theme tokens, `AppPaths`, and Zero-PII.
4. **Review**: Self-audit against the 17 persona rules, run `pnpm lint:boundaries`, `pnpm lint:routes`, and `pnpm lint:circular`.
5. **Verify**: Full type-check (`pnpm -r run type-check`), run test suites, and take visual screenshots using the Playwright driver (`driver.mjs shot ... --shell`).
6. **Remember**: Record new edge cases, race conditions, or patterns to `.agents/memory/lessons-learned.md`.
7. **Improve**: Enhance automated gates, update persona rules, and update the knowledge graph (`graphify update .`).

---

## 5. Inter-Agent Blackboard & Delegation Protocol

### Blackboard Data Sharing
Agents share task state, hypotheses, and verification artifacts through:
`.agents/blackboard/active-task.json`
Downstream agents read this blackboard to continue work without duplicating analysis.

### Dynamic Delegation Contract
When delegating a sub-task, agents invoke:
```markdown
DELEGATE TO: @specialist-name
OBJECTIVE: Concrete goal
CONTEXT: Blackboard state & file pointers
EXPECTED DELIVERABLE: Code, test, or visual screenshot artifact
```

---

## 6. Graphify & Visual QA Playwright Integration

### Knowledge Graph (graphify)
This project maintains a persistent knowledge graph at `graphify-out/`:
- **Before coding**: Query graphify first (`graphify query "<question>"`, `graphify path "<A>" "<B>"`).
- **After modifying code**: Always run `graphify update .` to keep AST dependencies synchronized.

### Visual Driver (Playwright)
- Execute `node .claude/skills/run-serafort-app/driver.mjs shot <route> <out-path> --shell` for visual grounding.
- Inspect the output image (>3 KB, no backdrop veil, high contrast, clean LTR/RTL layout).

