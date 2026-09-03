# CAP Framework — Module Development & Plug-in Architecture Guide

This guide details how human engineers and AI coding agents build, register, and extend feature modules in the **CAP Multi-Tenant SaaS Framework**.

---

## 1. Core Framework Philosophy

The CAP workspace is not just a single web application; it is an **extensible multi-tenant application framework**.

- **Zero Hardcoded Menus/Routes**: The shell application (`@cap/app`) and layout engine (`@cap/layout`) contain ZERO hardcoded route definitions or navigation menus.
- **Module Self-Declaration**: Feature modules declare ALL their contributions via a declarative `CAPModule` contract object.
- **Runtime Plugin Discovery**: Modules register routes, navigation items, command-palette search items, i18n dictionaries, and plugins dynamically via static glob imports or runtime module upload.
- **Tenant Isolation**: Modules respect per-tenant module enablement (`isModuleEnabled(moduleId)`), role-based navigation filtering (`roles`/`permissions`), and tenant branding themes.

---

## 2. The `CAPModule` Contract Interface

Every feature module MUST export a `CAPModule` contract object from its package entry point (`packages/modules/<module-name>/src/index.ts`):

```ts
import type { CAPModule } from '@cap/shared-types'

export const MyFeatureModule: CAPModule = {
  id: 'my-feature-module',           // Unique module identifier string
  version: '1.0.0',                  // SemVer string
  name: 'My Feature Module',          // Human readable display name
  description: 'Module description',
  routes: myFeatureRoutes,           // Route contributions (ModuleRouteConfig[])
  navItems: myFeatureNavItems,       // Navigation contributions (NavItemConfig[])
  searchItems: myFeatureSearchItems, // Command-palette search entries
  i18n: { en, fr, ar },               // Localized dictionaries
  plugins: [MyCustomPlugin],          // Service / Component plugins
}
```

---

## 3. Modular Route Contributions (`ModuleRouteConfig`)

Modules declare their routes as an array of `ModuleRouteConfig` objects:

```ts
import React from 'react'
import type { ModuleRouteConfig } from '@cap/shared-types'

const DashboardScreen = React.lazy(() => import('../screens/DashboardScreen'))
const SettingsScreen = React.lazy(() => import('../screens/SettingsScreen'))

export const myFeatureRoutes: ModuleRouteConfig[] = [
  {
    path: '/dashboard',
    element: <DashboardScreen />,
    layout: 'admin',              // Layout intent: 'public' | 'vertical' | 'horizontal' | 'noLayout' | 'admin'
  },
  {
    path: '/settings',
    element: <SettingsScreen />,
    layout: 'admin',
  },
]
```

> **Layout intent — read before choosing:** only `'admin'` (authenticated dashboard-style chrome) and `'noLayout'` (chrome-free screens such as sign-in or verification links) actually switch the shell at runtime today. `'vertical'`, `'horizontal'`, and `'public'` are accepted values but are **inert** — they fall through to the default public path in `LayoutWrapper` (see `ARCHITECTURE.md` §3 and `analysis/architecture-report.md` §4). Always declare `layout` explicitly; an undeclared `layout` silently inherits whatever `layoutOverride` the previously-visited route left behind.

### Route Layout Declaration & Code Splitting Rules
1. **Always use `React.lazy()`**: Import screen components using dynamic `import()` so Vite splits each screen into a separate bundle chunk.
2. **Declare Layout Intent**: Specify the `layout` property. Prefer `'admin'` for authenticated dashboard-style screens and `'noLayout'` for chrome-free screens; `'vertical'`/`'horizontal'`/`'public'` are accepted values but are not wired up at runtime yet (see the note above).

---

## 4. Modular Navigation Contributions (`NavItemConfig`)

Modules contribute menu items to vertical sidebars, horizontal top-navs, and admin menus via `navItems`:

```ts
import type { NavItemConfig } from '@cap/shared-types'

export const myFeatureNavItems: NavItemConfig[] = [
  // Section Header definition
  {
    id: 'my-feature-section',
    label: 'navigation.myFeatureSection',
    section: 'My Feature Group',
    variant: ['vertical', 'horizontal'],
    order: 200,
  },
  // Single Menu Item
  {
    id: 'my-feature-dashboard',
    label: 'navigation.dashboard',
    path: '/dashboard',
    icon: 'tabler-dashboard',
    variant: ['vertical', 'horizontal'],
    order: 210,
    roles: ['admin', 'manager'],      // RoleGuard filtering
  },
  // SubMenu with children
  {
    id: 'my-feature-parent',
    label: 'navigation.parent',
    icon: 'tabler-folder',
    variant: ['vertical'],
    order: 220,
    children: [
      {
        id: 'my-feature-child-1',
        label: 'navigation.child1',
        path: '/dashboard/child-1',
        order: 10,
      },
    ],
  },
]
```

### Navigation Rules
- `variant`: Restricts item visibility (`'vertical'`, `'horizontal'`, `'admin'`, or `'all'`).
- `order`: Sorts items within sections across modules.
- `roles` / `permissions`: Automatically filters items out for unauthorized users.

---

## 5. Command-Palette Search Contributions (`SearchItemConfig`)

Modules contribute command-palette shortcuts via `searchItems`:

```ts
export const myFeatureSearchItems: SearchItemConfig[] = [
  {
    id: 'search-dashboard',
    name: 'Dashboard Overview',
    url: '/dashboard',
    icon: 'tabler-dashboard',
    section: 'Navigation',
    shortcut: ['g', 'd'],
  },
]
```

---

## 6. Plugin Registration (`CAPPlugin`)

Modules can extend platform capabilities by exporting plugins conforming to `ServicePlugin`:

```ts
import type { ServicePlugin } from '@cap/shared-types'

export const MyFeatureServicePlugin: ServicePlugin = {
  id: 'my-feature-plugin',
  name: 'My Feature Service Plugin',
  version: '1.0.0',
  pluginType: 'service',
  services: {
    myFeatureService: new MyFeatureService(),
  },
  install: async (context) => {
    console.log('[MyFeaturePlugin] Installed into global plugin registry')
  },
}
```

---

## 7. Scaffolding a New Module

To create a new feature module:

```bash
pnpm generate:module
```

Follow the prompts in Plop generator. This creates:
```
packages/modules/<module-name>/
├── package.json
├── src/
│   ├── index.ts          # Module contract export (CAPModule)
│   ├── routes/          # ModuleRouteConfig[] definitions
│   ├── screens/         # React.lazy screen components
│   ├── data/
│   │   └── dictionaries/# i18n JSON bundles (en, fr, ar)
│   └── plugins/         # Optional ServicePlugins
```
The shell app's `import.meta.glob` will automatically discover and register your new module!
