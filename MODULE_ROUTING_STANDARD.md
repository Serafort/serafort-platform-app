# CAP Framework — Module Routing Architecture & Standardization Guide

This document defines the official architectural standard, conventions, and contract requirements for route definitions across all feature modules in the **CAP Multi-Tenant SaaS Framework**.

---

## 1. Core Principles

1. **Zero Hardcoded Shell Routes**: The shell application (`@cap/app`) and layout engine (`@cap/layout`) contain no static route declarations. All routes are dynamically contributed by feature modules.
2. **Self-Declaration via `CAPModule`**: Each module contributes its routes through the `routes` property on its `CAPModule` contract (`ModuleRouteConfig[]`).
3. **Decoupled Path Constants**: Route paths must be declared in a dedicated `path.ts` registry within the module rather than hardcoded inline.
4. **Code-Splitting Mandatory**: All screen components must be imported lazily via `React.lazy(() => import(...))` to ensure Vite creates isolated chunk bundles.
5. **Layout Intent (`RouteLayout`)**: Every route explicitly declares its layout intent (`public`, `vertical`, `horizontal`, `noLayout`, `admin`). The framework's `LayoutRouteWrapper` dynamically applies the requested shell layout.

> **Runtime gap (verified 2026-08 — `analysis/architecture-report.md` §4):** only `'noLayout'` and `'admin'` actually switch the shell in `LayoutWrapper` today; `'vertical'`, `'horizontal'`, and `'public'` fall through to the default public path (for public marketing routes this is fine — public *is* the default; for dashboard screens it is not). An undeclared `layout` silently inherits the previous route's `layoutOverride` (`'none'` is a no-op). Always declare `layout` explicitly, and use `'admin'` for authenticated dashboard-style routes.
6. **i18n & Module Scope Discipline**: Never call React hooks (such as `useTranslation()`) at module scope outside component functions. Route `label`s must store translation keys (e.g., `'landing.home'`) or lazy getters.

---

## 2. Standardized Module Routes Directory Layout

Every feature module (`packages/modules/<module-name>/src/`) MUST maintain the following standardized structure under `src/routes/`:

```
packages/modules/<module-name>/src/routes/
├── path.ts           # Canonical path constants registry
├── routes.tsx        # ModuleRouteConfig[] definitions & <ModuleRoutes /> component
├── index.ts          # Barrel export for route configs, components, and paths
└── routeHelpers.tsx  # (Optional) Route factory functions & middleware wrappers
```

---

## 3. The `ModuleRouteConfig` Interface

Routes are defined using the strict `ModuleRouteConfig` contract from `@cap/shared-types`:

```ts
import type { ModuleRouteConfig, RouteLayout, NavVariant } from '@cap/shared-types'

export interface ModuleRouteConfig {
  path: string                      # Canonical URL path (from Path registry)
  element: React.ReactNode          # Lazy-loaded screen component
  layout?: RouteLayout              # Layout intent: 'public' | 'vertical' | 'horizontal' | 'noLayout' | 'admin' | 'none'
  label?: string                    # i18n translation key or fallback label string

  // Navigation auto-promotion metadata (Optional)
  id?: string                       # Unique navigation item ID
  icon?: string                     # Tabler icon class (e.g., 'tabler-home')
  section?: string                  # Menu section grouping
  roles?: string[]                  # RoleGuard permissions
  permissions?: string[]            # PermissionGuard permissions
  guestOnly?: boolean               # If true, visible only to unauthenticated guests
  variant?: NavVariant[]            # Menu variants: ['public'], ['vertical'], ['admin'], etc.
  order?: number                    # Sort ordering weight
}
```

---

## 4. Implementation Guidelines & Code Examples

### A. Path Registry (`path.ts`)

Centralize all path constants to ensure type safety and eliminate magic strings across the codebase:

```ts
// packages/modules/landing/src/routes/path.ts
export const LandingPath = {
  home: '/',
  features: '/features',
  pricing: '/pricing',
  contact: '/contact',
} as const

export const Path = LandingPath
export default LandingPath
```

### B. Route Configuration & Component (`routes.tsx`)

Define route configurations with `React.lazy()` imports and export a standalone component wrapped in `LayoutRouteWrapper`:

```tsx
// packages/modules/landing/src/routes/routes.tsx
import React from 'react'
import { Route, type RoutesProps } from 'react-router-dom'
import type { ModuleRouteConfig } from '@cap/shared-types'
import { LayoutRouteWrapper } from '@cap/layout'
import { LandingPath } from './path'

const HomeScreen = React.lazy(() => import('../screens/Home'))
const FeaturesScreen = React.lazy(() => import('../screens/FeatureComparison'))
const PricingScreen = React.lazy(() => import('../screens/Pricing'))

export const landingRouteConfig: ModuleRouteConfig[] = [
  {
    path: LandingPath.home,
    id: 'nav-home',
    element: <HomeScreen />,
    label: 'landing.home',
    layout: 'public',
    variant: ['public'],
    guestOnly: true,
  },
  {
    path: LandingPath.features,
    id: 'guest-features',
    element: <FeaturesScreen />,
    label: 'landing.features',
    layout: 'public',
    variant: ['public'],
  },
  {
    path: LandingPath.pricing,
    id: 'guest-pricing',
    element: <PricingScreen />,
    label: 'landing.pricing',
    layout: 'public',
    variant: ['public'],
  },
]

/**
 * Route component for standalone or test rendering.
 */
export const landingRoutes: React.FC<RoutesProps> = () => (
  <>
    {landingRouteConfig.map((route) => (
      <Route
        key={route.path}
        path={route.path}
        element={
          <LayoutRouteWrapper layout={route.layout || 'public'}>
            {route.element}
          </LayoutRouteWrapper>
        }
      />
    ))}
  </>
)

export const LandingRoutes = landingRoutes
export default landingRoutes
```

### C. Barrel Export (`index.ts`)

Provide a clean API surface for consumers:

```ts
// packages/modules/landing/src/routes/index.ts
export {
  landingRouteConfig,
  landingRoutes,
  LandingRoutes,
  default,
} from './routes'
export { LandingPath, Path } from './path'
```

### D. Re-exporting from Module Root (`src/index.ts`)

Export routes and paths from the package root and attach them to the `CAPModule` contract:

```ts
// packages/modules/landing/src/index.ts
import type { CAPModule } from '@cap/shared-types'
import { landingRouteConfig } from './routes'
import { landingDictionaries } from './i18n/registry'

export { landingRouteConfig, landingRoutes, LandingRoutes, LandingPath } from './routes'

export const LandingModule: CAPModule = {
  id: 'landing-module',
  version: '1.0.0',
  routes: landingRouteConfig,
  i18n: landingDictionaries,
}
```

---

## 5. Route Helpers & Middleware Wrappers (`routeHelpers.tsx`)

For complex authentication or authorization workflows (such as in `@cap/module-auth`), use route helper factories to attach guards lazily while maintaining strict typing:

```tsx
// packages/modules/auth/src/routes/routeHelpers.tsx
import React from 'react'
import type { ModuleRouteConfig, RouteLayout } from '@cap/shared-types'
import { Roles } from '@cap/platform-core'
import AdminRoute from '../modules/authorization-engine/middlewares/AdminRoute'
import AuthRoute from '../modules/authentication-core/middlewares/AuthRoute'

export const createAdminRoute = (
  path: string,
  element: React.ReactNode,
  label?: string,
): ModuleRouteConfig => ({
  path,
  label,
  layout: 'admin',
  get element() {
    return <AdminRoute element={element} minimumRole={Roles.ADMIN} layout='admin' />
  },
})

export const createAuthRoute = (
  path: string,
  element: React.ReactNode,
  options: { requiresVerification?: boolean; layout?: RouteLayout; label?: string } = {},
): ModuleRouteConfig => ({
  path,
  label: options.label,
  layout: options.layout || 'admin',
  element: (
    <AuthRoute
      element={element}
      requiresVerification={options.requiresVerification}
      layout={options.layout}
    />
  ),
})

export { LayoutRouteWrapper } from '@cap/layout'
```

---

## 6. Framework Assembly Integration

When `assembleApp()` initializes at shell startup:
1. It collects `routes` from all registered `CAPModule` instances.
2. Route objects containing `variant` or `roles` are promoted automatically into navigation items in `useAppStore`.
3. All route elements are compiled into a unified React Router `<Routes>` tree wrapped in `<LayoutRouteWrapper layout={route.layout}>`.

---

## 7. Migration Checklist for Feature Modules

- [x] Create `routes/path.ts` and define all paths in a freeze-protected dictionary (`Path` / `ModuleNamePath`).
- [x] Update `routes/routes.tsx` to use `ModuleRouteConfig` and dynamic `React.lazy()` imports.
- [x] Remove any top-level `useTranslation()` calls in route config files.
- [x] Ensure `<ModuleRoutes />` wraps element children in `<LayoutRouteWrapper layout={route.layout}>`.
- [x] Create/update `routes/index.ts` with standardized named and default exports.
- [x] Replace `any` types in route helpers with strict `RouteLayout` types.
