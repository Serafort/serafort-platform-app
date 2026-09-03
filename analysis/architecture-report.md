# CAP Boilerplate — Principal Architecture Review

**Scope:** Full monorepo (`app/`, `packages/*`), theme system, layout/routing, and dependency structure.
**Method:** Direct inspection via Filesystem MCP of `pnpm-workspace.yaml`, every package's `package.json`, `eslint.config.js` layering rules, `packages/platform-core/src/assembly/index.tsx`, `packages/layout`, `packages/theme`, and representative screens/components. Cross-checked against existing `/analysis` docs, `ARCHITECTURE.md`, and `AGENTS.md` for currency.
**Companion documents:** `technical-debt-report.md`, `improvement-roadmap.md`.

---

## 1. Executive Summary

CAP Boilerplate is a **multi-tenant SaaS application framework**, not a single app. The core thesis — feature modules self-declare routes, navigation, i18n, and plugins; the shell contains zero hardcoded menus — is real and is actually implemented, not just aspirational. That is uncommon and is the framework's biggest architectural strength.

The codebase is in noticeably good shape for its size: the documented 6-tier dependency model is documented and a working coupling-analysis script exists and its output is committed, prior audit passes have fixed real bugs (see `technical-issues.md`), and the theme/design-token system is genuinely sophisticated (15 presets, 6 visual effect generators, tenant-scoped).

> **Current status (verified 2026-08):** the effect generator count in this report is **6**, not 7 — `computeEffects.ts` implements `computeNeumorphismShadows`/`BoxShadow`, `getGlassmorphismStyles`, `getBrutalismStyles`, `getBentoStyles`, `getOrganicStyles`, `getImmersiveStyles`. Also, the claim below that ESLint "genuinely enforces" the tiering must be softened: the per-layer `layerConfigs` in `eslint.config.js` are **not applied** by any active config (root exports only `baseConfig`; package-level configs don't import `layerConfigs`), so the boundaries are aspirational today rather than lint-enforced.

That said, this review surfaced a **previously undocumented, real routing/layout defect** (Section 4), several **duplicated implementations that have already started to drift** (Section 4.3), and **config/tooling debt that is live, not historical** (broken lint-staged hooks, phantom packages referenced in the active `eslint.config.js`, TypeScript version drift across package manifests) — all detailed in `technical-debt-report.md` with exact file paths.

---

## 2. Package Inventory & Responsibilities

| Package | Path | Responsibility |
|---|---|---|
| `@cap/shared-types` | `packages/shared-types` | Zero-dependency contracts: `CAPModule`, `ModuleRouteConfig`, `NavItemConfig`, `TenantThemeConfig`, domain entities. |
| `@cap/api-contracts` | `packages/api-contracts` | API query-key factories, endpoint schema registries. |
| `@cap/platform-store` | `packages/platform-store` | Zustand `useAppStore`, domain slices (`auth`, `settings`, `navigation`, `network`, `offlineQueue`, `preferences`), AES-256 `secureStorage`. |
| `@cap/theme` | `packages/theme` | Design tokens, `composeMuiTheme`, tenant theme context, 15 presets, 6 visual-effect generators (glass/neu/bento/brutalism/organic/immersive), MUI component overrides. |
| `@cap/auth-contracts` | `packages/auth-contracts` | IAM-specific contracts and admin service surface, decoupled from the full auth module. |
| `@cap/layout` | `packages/layout` | Structural shells (`VerticalLayout`, `HorizontalLayout`, `PublicLayout`, `BlankLayout`), `LayoutWrapper` (the layout *selector*), menu rendering, `ThemeBridge`. |
| `@cap/platform-core` | `packages/platform-core` | Orchestration facade: `assembleApp`, `AuthRouteConfig`/`RouteLayout` types, `tenantContext`, `useDynamicTheme`, plugin registry, hooks barrel. |
| `@cap/module-auth` | `packages/modules/auth` | Full IDaaS surface: 9 DDD sub-modules (`authentication-core`, `authorization-engine`, `identity-broker`, `mfa-orchestrator`, `passwordless-service`, `platform-cluster`, `session-manager`, `user-directory`, plus a `developer-console` screen set) behind a `domain-kernel` (ports/events/types) and an `idaas-facade`. |
| `@cap/module-landing` | `packages/modules/landing` | Public marketing site: pricing, FAQ, workflow pipeline, legal pages. |
| `@cap/module-theme` | `packages/modules/theme` | Tenant branding module: theme preset picker and live `ColorPaletteEditor` for the tenant design system. |
| `@cap/app` | `app` | Shell entry point, `AppAssembly.tsx` (module discovery + dynamic registration), Vite/Playwright/Lighthouse tooling. |

**Verified against `pnpm-workspace.yaml`:** the workspace glob is exactly `app`, `packages/auth-contracts`, `packages/api-contracts`, `packages/layout`, `packages/platform-core`, `packages/platform-store`, `packages/shared-types`, `packages/theme`, `packages/modules/**`. Three modules exist under `packages/modules/`: `auth`, `landing`, and `theme`. (`@cap/module-theme` was added after this review's original package inventory — the coupling report `docs/MODULE_COUPLING_REPORT.md` includes it: 19 files, Ce 5, Ca 1, instability 0.83.)

---

## 3. Dependency Graph

The 6-tier model below matches `ARCHITECTURE.md` / `AGENTS.md`. **Important correction (verified 2026-08):** this review originally described the tiering as "independently confirmed by `eslint.config.js`'s per-layer `import/no-restricted-imports` rules" — that is **no longer true**. The `layerConfigs` defined in `eslint.config.js` are defined but **never applied**: the root config's default export is only `baseConfig`, and none of the package-level configs import `layerConfigs`. The tier boundaries are therefore documented-aspirational, not lint-enforced today. The committed coupling report (`docs/MODULE_COUPLING_REPORT.md`) is the authoritative source for real dependencies.

*(See the interactive tier diagram rendered above in this conversation for the visual — not reproduced here to avoid duplication.)*

**Rule:** each tier may depend only on tiers strictly below it. `@cap/app` (Tier 5) may import anything; `@cap/shared-types` (Tier 0) may import nothing internal.

### Notable real-world exceptions / drift found in the enforcement config itself
`eslint.config.js`'s `Layers` object references packages that **do not exist on disk**:
```
LAYER_4: [..., '@cap/civil-registry']
LAYER_5: ['@cap/module-admin', '@cap/module-auth', '@cap/module-landing', '@cap/module-kyc',
          '@cap/module-digital-id', '@cap/module-blockchain-idaas', '@cap/module-monitoring-alerts', '@cap/module-user']
```
Only `@cap/module-auth`, `@cap/module-landing`, and `@cap/module-theme` exist under `packages/modules/` (the rest — `@cap/module-admin`, `@cap/module-kyc`, `@cap/module-digital-id`, `@cap/module-blockchain-idaas`, `@cap/module-monitoring-alerts`, `@cap/module-user`, `@cap/civil-registry` — remain provisioned-ahead phantoms; see `technical-debt-report.md` §2.1).

Also note: the ESLint layer grouping doesn't map 1:1 onto the ARCHITECTURE.md tier numbers (e.g. ESLint's `LAYER_1` groups `auth-contracts` + `theme` together and puts `platform-store` alone in `LAYER_2`, whereas `ARCHITECTURE.md` groups `platform-store` + `theme` + `api-contracts` together as "Tier 1"). Functionally both produce a valid DAG with the same effective ordering, but the tier *numbering* between the prose doc and the enforcement config doesn't match term-for-term — a minor documentation-consistency item, not a structural bug.

### Coupling analysis tooling exists and its output is now committed
`scripts/analyze-coupling.cjs` is a real, working static-import analyzer that computes afferent/efferent coupling (Ca/Ce) and instability per package and per DDD sub-module, and writes `docs/MODULE_COUPLING_REPORT.md`.

> **Current status (verified 2026-08):** the roadmap Phase 0 item 1 is **DONE** — the report was generated and committed (`docs/MODULE_COUPLING_REPORT.md`, generated 2026-08-04, 825 files, 11 packages, 76 sub-modules). When this review was written, `docs/` did not exist yet; it does now.

### Qualitative coupling observations (from direct code reading)
- **`@cap/module-auth` is the largest and most internally coupled package by a wide margin** — 9 sub-modules under `src/modules/*`, each with its own `routes/`, `screens/`, `services/`, `hooks/`, several importing across sibling sub-modules via `@idaas/*` TS path aliases (e.g. `AdminRoute.tsx` imports `useSessionGuard` from `session-manager` and `normalizeAuthUser` from `authentication-core`). This is expected for an IDaaS module but means the sub-modules are not truly independent — see `technical-issues.md` #8 for the related package.json history.
- **`@cap/layout` depends on `@cap/platform-core`**, and `@cap/platform-core` also has its own copy of `LayoutRouteWrapper` — meaning `@cap/layout`'s components indirectly reference logic that is duplicated one tier down. Detailed in §4.3 below.
- **`RouteLayout` is now a single type in `@cap/shared-types`** (`src/module.ts`: `'public' | 'vertical' | 'horizontal' | 'noLayout' | 'admin' | 'none'`), imported by `LayoutRouteWrapper`, `routeHelpers.tsx`, and `platform-core`'s types barrel. However a **narrower, overlapping type** `LayoutOverride` still lives in `packages/platform-store/src/store/slices/settingsSlice.ts` (`'public' | 'admin' | 'noLayout' | 'none'` — no `'vertical'`/`'horizontal'`). Two names for overlapping-but-not-identical concepts across two packages remains a coupling smell even though ESLint's layer rule doesn't (and can't) catch it, because a type duplicate isn't an import violation. See §4.1. *(The original review noted "two independently-declared `RouteLayout` unions in `platform-core/src/assembly/index.tsx` and `platform-core/src/components/LayoutRouteWrapper.tsx`" — that specific duplication has since been consolidated into `@cap/shared-types`; `assembleApp` re-exports `AuthRouteConfig` from `ModuleRegistry`.)*

---

## 4. Layout & Routing Review (Guest / Authenticated, Layout Switching, Navigation)

> **Current status (verified 2026-08):** the findings in §4.1–§4.3 have changed materially since this review was written:
> - **§4.3 (duplicate `LayoutRouteWrapper`) is RESOLVED** — the platform-core copy was removed in commit `ca5ea29` ("refactor: unify layout wrapping…"); the single canonical implementation lives in `@cap/layout/src/components/wrappers/LayoutRouteWrapper.tsx` and is what `assembleApp` imports.
> - **§4.1 (inert `'vertical'`/`'horizontal'`) is still OPEN** — the runtime only honors `'noLayout'` and `'admin'` today.
> - **§4.2 (inconsistent per-route layout declarations) is still OPEN.**
> The scaffolding docs (`MODULE_DEVELOPMENT_GUIDE.md`, `ARCHITECTURE.md`) have been updated to steer module authors toward `'admin'`/`'noLayout'` and to warn that the other values are inert until the roadmap's Phase 1 lands.

This is the deepest and most consequential part of this review because the finding below **contradicts the framework's own documentation**.

### 4.1 Finding: `layout: 'vertical'` / `layout: 'horizontal'` are documented as working route-level values but are dead in the current wiring

`MODULE_DEVELOPMENT_GUIDE.md` §3 and `ARCHITECTURE.md` §3 both document five legal route-layout values — `'public' | 'vertical' | 'horizontal' | 'noLayout' | 'admin'` — and state that declaring `layout: 'vertical'` on a route causes the shell to switch to the vertical dashboard shell.

Tracing the actual runtime path:

1. `assembleApp()` (`packages/platform-core/src/assembly/index.tsx`) wraps every route in `<LayoutRouteWrapper layout={layout || 'none'}>`.
2. `LayoutRouteWrapper` (`@cap/layout/src/components/wrappers/LayoutRouteWrapper.tsx` — the single canonical copy; the platform-core duplicate was removed in commit `ca5ea29`) only branches on **one** value in its `useEffect`:
   ```tsx
   if (layout === 'noLayout') { updateLayoutOverride('noLayout'); return () => updateLayoutOverride('none') }
   // nothing else — 'vertical' | 'horizontal' | 'public' | 'admin' are all no-ops here
   ```
   `'admin'` is deliberately handled elsewhere (`AdminRoute.tsx` / `AuthRoute.tsx` call `updateLayoutOverride('admin')` themselves, per the wrapper's own code comment). `'vertical'` and `'horizontal'` are handled **nowhere**.
3. `LayoutWrapper` (`packages/layout/src/LayoutWrapper.tsx`) — the component that actually picks which shell to render — only recognizes three states: `isNoLayout` (→ `noLayout` slot), `isAdminLayout` (→ `verticalLayout`/`horizontalLayout` chosen by the **global** `settings.layout` preference, not by the route), and **everything else falls through to `publicLayout`**. There is no branch for a bare `layoutOverride === 'vertical'` or `'horizontal'`.
4. `LayoutOverride` (`packages/platform-store/src/store/slices/settingsSlice.ts`) — the type actually backing the Zustand slice — only has four members: `'public' | 'admin' | 'noLayout' | 'none'`. It structurally cannot hold `'vertical'`/`'horizontal'` even if something tried to set it (TS widens this via `RouteLayout | string` on the wrapper props, so it wouldn't even be a compile error today — it would just silently do nothing at runtime).

**Net effect:** a module route declared with `layout: 'vertical'` — exactly as shown in the official scaffolding example in `MODULE_DEVELOPMENT_GUIDE.md` — renders inside `PublicLayout` (site header/footer chrome), not inside the vertical dashboard shell. The only two route-layout values that do anything today are `'noLayout'` and `'admin'`. This is a materially different behavior than what the framework promises a module author, and it's exactly the kind of gap an AI agent scaffolding a new module from the documented example would silently reproduce.

*(This is distinct from the already-fixed issue in `technical-issues.md` #1 — that one was about the `layout` prop being dropped entirely; it has genuinely been fixed. This is a narrower, previously-unflagged gap in the fix: the wrapper only special-cases `'noLayout'`.)*

### 4.2 Finding: inconsistent per-route layout declarations inside the same sub-module

Within `packages/modules/auth/src/modules/user-directory/routes/routes.tsx`, some routes declare `layout: 'admin'` (`Path.user.view`, `Path.user.edit`) while sibling routes in the same file (`Path.user.changeEmail`, `Path.user.linkedAccounts`, `Path.user.delete`, `Path.user.deactivate`) declare **no layout at all**. The same pattern repeats in `session-manager/routes/routes.tsx` (`Path.account.overview` → `'admin'`; `activeSessions`, `activityTimeline`, `changePassword` → undeclared). Given §4.1, an undeclared layout falls through to `layout: 'none'` in `assembleApp`, which is a no-op in `LayoutRouteWrapper`, which means **whatever `layoutOverride` was left behind by the previously-visited route persists**. A user navigating `/account/overview` (forces `'admin'`) → `/account/change-password` (declares nothing) will see the change-password screen still wrapped in the admin/dashboard shell purely as a side effect of navigation order, not by design. This is a genuine, reproducible layout-bleed bug, not a cosmetic one.

### 4.3 Finding: `LayoutRouteWrapper` is implemented twice and has already diverged

Two files, ~35 lines each, doing the same job:
- `packages/layout/src/components/wrappers/LayoutRouteWrapper.tsx`
- `packages/platform-core/src/components/LayoutRouteWrapper.tsx`

They are near-identical, but the `@cap/layout` copy carries an extra doc comment explaining the `'admin'`-is-handled-elsewhere contract that the `@cap/platform-core` copy lacks — direct evidence of copy-paste-then-edit-one drift. `packages/modules/auth/src/routes/routeHelpers.tsx` even explicitly re-exports the `@cap/layout` version (`export { LayoutRouteWrapper } from '@cap/layout'`) while `assembleApp` in `@cap/platform-core` imports its **own**, separate copy. Both are live and both are used, in different call paths, for the same purpose. Any future fix to one (including the §4.1 fix) has to be remembered and applied to both, or the drift gets worse.

> **Current status (verified 2026-08):** **RESOLVED** — the `@cap/platform-core` copy was deleted in commit `ca5ea29` ("refactor: unify layout wrapping…"). The single implementation now lives at `packages/layout/src/components/wrappers/LayoutRouteWrapper.tsx` and is imported by `assembleApp` (via `@cap/layout`). The finding is kept for the historical record; the drift risk it describes no longer applies.

### 4.4 What actually works well here
- **Hydration handling in `LayoutWrapper`** is a genuinely good pattern: it pre-renders the final layout tree invisibly behind a spinner overlay during `isHydrating` rather than swapping DOM after the fact, which avoids layout shift/flicker on load — better than most boilerplates bother with.
- **Guest vs. authenticated navbar switching** (`app/src/layout.tsx`'s `NavbarWrapper`) is a clean, minimal `React.memo` keyed off `isAuthenticated` — no over-engineering.
- **`GuestConfig`** (`packages/platform-core/src/configs/guestConfig.ts`) is a well-structured, centralized feature-flag object for what unauthenticated/guest users can do (job search limits, dashboard access, banner behavior) — a good, explicit contract rather than scattered `if (!isAuthenticated)` checks.
- **Route guard components** (`AuthRoute`, `GuestRoute`, `AdminRoute`) correctly handle loading/backdrop states, session errors, role-rank comparisons, and email-verification gating with reasonable UX (specific alert + actionable button rather than a bare redirect).

---

## 5. Theme Generator Review (Scalability & Multi-Tenant Flexibility)

### 5.1 Architecture — strong
`@cap/theme` implements a genuine three-layer token pipeline: `PrimitiveTokens` → `composeMuiTheme()` (merges tenant tokens with a light/dark base, expands MUI palette, applies `getComponentOverrides`) → delivery via `ThemeBridge`/`applyThemeVariablesSync` to CSS custom properties. `TenantThemeConfig` carries `organizationId`, `preset`, `tokens`, `effects`, `components`, `version` — this is a legitimate per-tenant white-labeling contract, not a single hardcoded palette with a coat of paint. `THEME_PRESETS` + `applyPreset()`/`mergeThemeWithPreset()`/`createThemeFromPartial()` (all using `immer.produce` for safe, immutable draft merges) give a tenant admin UI everything it needs to build a "pick a preset, then override specific tokens" customization flow. `validateTheme()` checks hex/rgba color format and clamps neumorphism `intensity`/`distance`/`altitude` ranges — real defensive validation for what is presumably admin-supplied, semi-trusted input. This is above-average maturity for a boilerplate's theme layer.

### 5.2 Finding: only `main` status colors are tenant-tokenized; `light`/`dark`/opacity variants are not
In `composeMuiTheme.ts`, `primary` and `secondary` correctly derive their `light`/`dark`/opacity variants at runtime from the tenant token via MUI's `lighten()`/`darken()`:
```ts
primary: { light: lighten(primaryMain, 0.2), main: primaryMain, dark: darken(primaryMain, 0.12), lighterOpacity: `${primaryMain}14`, ... }
```
But `error`, `success`, `warning`, and `info` do **not** follow the same pattern — only `main` reads from `tokens.colors.<name>?.value`; every `light`/`dark`/opacity variant for those four is a **hardcoded literal** (e.g. `light: '#FF7074'`, `dark: '#E64449'`) regardless of what a tenant sets for `main`. A tenant that rebrands their error color will get a mismatched `light`/`dark` pair that doesn't relate to their chosen `main` hue. This is a real, fixable scalability gap given how close the pattern already is for primary/secondary — it's a ~15-line change to reuse the same `lighten`/`darken` calls for all five status colors, not a redesign.

### 5.3 Finding: `mergeDeep` in `mergeTheme.ts` appears unused
`mergeDeep<T>()` is exported from `packages/theme/src/utils/mergeTheme.ts`, but `applyPreset`, `mergeThemeWithPreset`, and `createThemeFromPartial` in the same file all use `immer.produce` + `Object.assign` directly rather than calling `mergeDeep`. Worth a grep-confirmed dead-code check before the next cleanup pass — low priority, but it's unbounded recursive mutation with no cycle guard, so if it *is* used elsewhere on user-controlled theme JSON it deserves a second look; if it's genuinely unused, remove it.

### 5.4 Documentation vs. practice: RTL strategy isn't fully described
`DESIGN_SYSTEM.md` §1 instructs contributors to use RTL-*logical* CSS properties (`inlineSize`, `marginInlineStart`, etc.) instead of physical ones. In practice, sampled screens (e.g. `SignInV2.tsx`) predominantly use MUI's physical `sx` shorthand (`px`, `mx`, `mb`) rather than logical properties — which is fine *because* the app also ships `stylis-plugin-rtl` (confirmed in `app/package.json` and `@cap/theme/package.json` dependencies), which auto-flips physical properties at the CSS layer for `dir='rtl'`. Both strategies work, but `DESIGN_SYSTEM.md` doesn't mention the plugin-based approach at all, so a contributor who takes the doc literally may over-invest in manually converting `px`→`paddingInline` where the plugin already handles it, or may not realize which strategy is actually authoritative when the two conflict. Worth a one-paragraph clarification in the doc, not a code change.

> **Current status:** the clarifying paragraph was added to `packages/theme/DESIGN_SYSTEM.md` (roadmap Phase 3 item 16).

### 5.5 Multi-tenant verdict
The token/preset/effect architecture is genuinely built for scale across tenants — the gaps found are refinements (status-color completeness, one doc clarification, one dead-code check), not structural rework. This is the strongest-reviewed subsystem in the codebase.

---

## 6. Cross-References
- Concrete tech-debt inventory (config drift, `any` typing, duplicated logic, dead scripts): `technical-debt-report.md`
- Prioritized, sequenced fix plan: `improvement-roadmap.md`
- Existing prior-pass documents this review builds on and does **not** duplicate: `technical-issues.md` (resolved-issue log — still accurate as of this pass), `component-deep-dives/module-assembly.md`, `component-deep-dives/theme-layout.md`
- Existing document that is now **partially stale**: `technical-recommendations.md` §1 and §4 describe the pre-fix `assembleApp` implementation (dropped `layout` prop, `element: null` catch-all) — both are already resolved in current code per `technical-issues.md` #1/#3 and confirmed directly in `packages/platform-core/src/assembly/index.tsx` during this review. Recommend adding a "RESOLVED — see technical-issues.md #1/#3" note at the top of those two sections rather than deleting them, to preserve the historical record.
