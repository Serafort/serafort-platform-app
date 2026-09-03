# CAP Multi-Tenant SaaS Framework — Master Architecture Reference

This document provides complete architectural context, framework design principles, package hierarchy rules, module contribution contracts, and design system specifications for developers and AI agents working on the **CAP Platform Framework**.

---

## 1. Framework Identity & Multi-Tenant Core Principles

The CAP Monorepo is **not just a single web application**; it is an **enterprise multi-tenant SaaS framework**.

### Core Architectural Mandates
1. **Zero Hardcoded Routes or Menus**: The application shell (`@cap/app`) and structural layout engine (`@cap/layout`) contain ZERO hardcoded menu structures or route tables. All capabilities are contributed dynamically by feature modules.
2. **Self-Declaring Feature Modules**: Feature modules (`packages/modules/*`) encapsulate their own routes (`ModuleRouteConfig`), navigation items (`NavItemConfig`), search items (`SearchItemConfig`), i18n dictionaries, and plugins (`CAPPlugin`).
3. **Dynamic Discovery & Runtime Plugability**: Modules are discovered via static Vite `import.meta.glob` scans and runtime `registerDynamicModule()` API calls.
4. **Three-Layer Token-Driven Design System**: Branding and visual identities are governed by a token hierarchy (Primitives → Semantics → Component Overrides) paired with visual effect generators (Glassmorphism, Neumorphism, Bento, Brutalism, Organic, Immersive 3D).
5. **Strict 6-Tier Monorepo Layering**: High-tier packages depend on low-tier packages. **Low-tier packages MUST NEVER import from higher-tier packages.**

> **Current status on enforcement:** the 6 tiers below are the **conceptual** model. `eslint.config.js` defines a *different, more granular* `Layers` grouping (`FOUNDATION`/`LAYER_1`…`LAYER_6` — e.g. `@cap/layout` is `LAYER_4` there vs. Tier 2 here) plus `layerConfigs` with per-layer `import/no-restricted-imports` rules. As of this writing those `layerConfigs` are **defined but not wired into any active ESLint config** (the root config's default export is only `baseConfig`; no package-level config imports them), so the boundaries are aspirational, not enforced. See §2 below.

---

## 2. Monorepo Layer Architecture

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

> **Enforcement reality (verified 2026-08):** this table is the *conceptual* model. ESLint's actual grouping in `eslint.config.js` is `FOUNDATION` (`@cap/shared-types`, `@cap/api-contracts`), `LAYER_1` (`@cap/auth-contracts`, `@cap/theme`), `LAYER_2` (`@cap/platform-store`), `LAYER_3` (`@cap/platform-core`), `LAYER_4` (`@cap/layout`, `@cap/civil-registry`), `LAYER_5` (`@cap/module-*`), `LAYER_6` (`@cap/app`). The per-layer `layerConfigs` restrictions are currently **not applied** by any active config, so package boundaries are not lint-enforced today. The committed coupling report (`docs/MODULE_COUPLING_REPORT.md`, 2026-08-04) is the authoritative source for real dependencies; note it shows `@cap/layout → @cap/platform-core` (20 edges) and `@cap/layout → @cap/module-auth` (2), both legal under the ESLint model (LAYER_4 may import LAYER_3 and below).

### Tier Inventory & Rules

| Tier | Package | Location | Allowed Dependencies | Contract & Responsibility |
|---|---|---|---|---|
| **0** | `@cap/shared-types` | `packages/shared-types` | *None* | Zero-dependency TypeScript interfaces, API schemas, `CAPModule` contract, domain entities. |
| **1** | `@cap/api-contracts` | `packages/api-contracts` | Tier 0 | API query keys, endpoint schema registries, request/response models. |
| **1** | `@cap/platform-store` | `packages/platform-store` | Tier 0, Tier 1 | Main Zustand state store (`useAppStore`), encrypted storage (`secureStorage`), sliced by domain. |
| **1** | `@cap/theme` | `packages/theme` | Tier 0 | Design tokens (`PrimitiveTokens`), token composition (`composeMuiTheme`), theme context (`TenantThemeProvider`), visual effects. |
| **2** | `@cap/auth-contracts` | `packages/auth-contracts` | Tier 0, Tier 1 | Contracts and administrative services specific to identity and access management. |
| **2** | `@cap/layout` | `packages/layout` | Tier 0, Tier 1 | Structural layouts (`VerticalLayout`, `HorizontalLayout`, `PublicLayout`, `BlankLayout`), `ThemeBridge`, `ModuleMenuRenderer`. |
| **3** | `@cap/platform-core` | `packages/platform-core` | Tier 0, Tier 1 | Orchestration façade: runtime module assembly (`assembleApp`), routing, i18n, `TenantProvider`, `globalPluginRegistry`. |
| **4** | `@cap/modules/*` | `packages/modules/*` | Tier 0, 1, 2, 3 | Self-contained feature modules (`@cap/module-auth`, `@cap/module-landing`, `@cap/module-theme`). |
| **5** | `@cap/app` | `app` | All Tiers | Shell application entry point (`main.tsx`), provider assembly (`Providers.tsx`), top-level layout selector. |

---

## 3. Dynamic Module Contribution & Modular Routing System

### The `CAPModule` Interface
```ts
export interface CAPModule {
  id: string                          // Unique module identifier (e.g. 'auth-module')
  version: string                     // SemVer string
  name?: string                       // Display name
  description?: string
  routes?: ModuleRouteConfig[]        // Route contributions
  navItems?: NavItemConfig[]          // Navigation contributions
  searchItems?: SearchItemConfig[]    // Command-palette entries
  i18n?: Record<string, any>          // Localized dictionaries
  plugins?: CAPPlugin[]               // Service & Component plugins
  storeReducers?: Record<string, any> // Module store reducers
}
```

### Modular Routing Lifecycle
1. **Module Discovery**: `AppAssembly.tsx` resolves modules via Vite glob scan `import.meta.glob('../../packages/modules/*/src/index.ts', { eager: true })` and dynamic runtime store (`dynamicModulesStore`).
2. **Assembly**: `assembleApp({ modules })` in `@cap/platform-core`:
   - Registers navigation items into `useAppStore` navigation slice.
   - Registers search items into global command palette.
   - Merges namespaced i18n dictionaries into `i18next`.
   - Merges module routes into a single `<Routes>` tree.
3. **Suspense & Code Splitting**: All screen components are imported via `React.lazy()`. The root router is wrapped in `<React.Suspense fallback={<LoadingSpinner />}>`.
4. **Layout Switching**: Routes declare a layout intent (`layout: 'vertical' | 'horizontal' | 'public' | 'noLayout' | 'admin'`). `LayoutRouteWrapper` sets `layoutOverride` in Zustand, causing `LayoutWrapper` to mount the corresponding structural layout seamlessly.

> **Known gap (see `analysis/architecture-report.md` §4):** at runtime only `'noLayout'` and `'admin'` actually switch the shell in `LayoutWrapper`; `'vertical'`/`'horizontal'`/`'public'` fall through to the default public path today. An undeclared `layout` silently inherits whatever `layoutOverride` a previously-visited route left behind (a `'none'` default is a no-op in the wrapper). **Always declare `layout` explicitly** when adding a route.

---

## 4. Token-Driven Design System Architecture

### Token Layering
1. **Primitive Tokens**: Base values for colors, spacing scales, radii, typography, shadows, and z-index.
2. **Semantic Tokens**: Contextual mappings (`--color-primary`, `--color-surface`, `--color-border`).
3. **Component Tokens & Overrides**: Applied via `getComponentOverrides(theme)` for MUI Buttons, Cards, Inputs, Tables, and Menus.

### Dynamic Tenant Visual Styles
The design system supports 15 presets and 6 visual effect generators:
- **Glassmorphism**: Backdrop blur (`--glass-blur`), translucent background, luminous borders.
- **Neumorphism**: Computed dual light/dark relief shadows via `computeNeumorphismShadows()`.
- **Bento UI**: High radius, grid gap spacing.
- **Brutalism & Neo-Brutalism**: Thick solid borders (`--brutal-border-width`), hard offset box-shadows.
- **Organic & Immersive 3D**: Fluid curvature and 3D spatial rotation filters.

---

## 5. State Management & Hydration Architecture

Zustand (`@cap/platform-store`) provides domain-partitioned slices within a unified store (`useAppStore`):
- `AuthSlice`: Authentication state, user profile, tokens, `isAdmin`.
- `SettingsSlice`: Visual settings, theme mode, `layoutOverride`.
- `NavigationSlice`: Dynamic module menu items registry.
- `PreferencesSlice`: User language, theme mode preferences.
- `NetworkSlice` & `OfflineQueueSlice`: Connectivity status & offline mutation queue.

### Storage Security
Persisted slices are encrypted with **AES-GCM 256** via `secureStorage`, implemented with the Web Crypto API (PBKDF2, 200k iterations) in `packages/platform-store/src/services/encryption.ts`.

---

## 6. Document Directory

- **Module Developer Guide**: [`MODULE_DEVELOPMENT_GUIDE.md`](file:///c:/Node.Js/proj/boilerplate/MODULE_DEVELOPMENT_GUIDE.md)
- **Theme & Effect Pipeline**: [`packages/theme/THEME_SYSTEM.md`](file:///c:/Node.Js/proj/boilerplate/packages/theme/THEME_SYSTEM.md)
- **Design System Standards**: [`packages/theme/DESIGN_SYSTEM.md`](file:///c:/Node.Js/proj/boilerplate/packages/theme/DESIGN_SYSTEM.md)
- **Contribution Guidelines**: [`CONTRIBUTING.md`](file:///c:/Node.Js/proj/boilerplate/CONTRIBUTING.md)
