# Rule 01: Architecture & Monorepo Governance

This rule governs monorepo package boundaries, dependency flow, module contribution contracts, and dynamic routing in the **Serafort CAP Multi-Tenant Framework**.

---

## 1. Monorepo 6-Tier Hierarchy

Dependencies must flow strictly downward. **Lower tiers MUST NEVER import from higher tiers.**

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

### Tier Package Boundaries

| Tier | Package | Location | Allowed Dependency Imports | Prohibited Imports |
| :--- | :--- | :--- | :--- | :--- |
| **0** | `@cap/shared-types` | `packages/shared-types` | **None** (zero dependencies) | All other packages |
| **1** | `@cap/api-contracts` | `packages/api-contracts` | Tier 0 | Tiers 1, 2, 3, 4, 5 |
| **1** | `@cap/platform-store` | `packages/platform-store` | Tier 0, Tier 1 | Tiers 2, 3, 4, 5 |
| **1** | `@cap/theme` | `packages/theme` | Tier 0 | Tiers 1 (store/api), 2, 3, 4, 5 |
| **2** | `@cap/auth-contracts` | `packages/auth-contracts` | Tier 0, Tier 1 | Tiers 2, 3, 4, 5 |
| **2** | `@cap/authorization` | `packages/authorization` | Tier 0, Tier 1 | Tiers 2, 3, 4, 5 |
| **2** | `@cap/layout` | `packages/layout` | Tier 0, Tier 1 | Tiers 3, 4, 5 (Layout never imports Shell or Modules) |
| **3** | `@cap/platform-core` | `packages/platform-core` | Tier 0, Tier 1, Tier 2 | Tiers 4, 5 |
| **4** | `@cap/modules/*` | `packages/modules/*` | Tiers 0, 1, 2, 3 | Tier 5 (Modules never import App shell) |
| **5** | `@cap/app` | `app` | All Tiers (0 through 4) | N/A |

---

## 2. Dynamic Module Contract (`CAPModule`)

All feature modules must export a conforming `CAPModule` contract (`packages/shared-types/src/index.ts`):

```ts
export interface CAPModule {
  id: string;                    // e.g. 'auth-module', 'theme-module'
  version: string;               // SemVer string, e.g. '1.0.0'
  name?: string;
  description?: string;
  routes?: ModuleRouteConfig[];  // Contributed routes
  navItems?: NavItemConfig[];    // Contributed navigation menu items
  searchItems?: SearchItemConfig[]; // Search command palette entries
  i18n?: Record<string, any>;    // Multilingual dictionary bundles ('en', 'fr', 'ar')
  plugins?: CAPPlugin[];         // Service & component plugins
  storeReducers?: Record<string, any>;
}
```

### Module Contribution Invariants
1. **Zero Hardcoded Menus**: The application shell (`@cap/app`) and structural layouts (`@cap/layout`) must NEVER contain hardcoded route lists or navigation links. All navigation items are contributed dynamically by modules via `navItems`.
2. **Code Splitting**: All screen components declared in `ModuleRouteConfig[]` MUST be wrapped in `React.lazy()`.
3. **Explicit Route Layouts**: Every `ModuleRouteConfig` MUST explicitly specify its layout intent:
   - `'admin'`: Authenticated dashboard shell (respects tenant settings: vertical drawer / horizontal navbar).
   - `'public'`: Marketing, public landing, terms, and documentation shell.
   - `'noLayout'`: Chrome-free screens (e.g. sign-in, MFA prompt, email validation).
   - `'vertical'`: Forced vertical navigation layout.
   - `'horizontal'`: Forced horizontal navigation layout.
   *Do NOT omit `layout`; omitting layout causes layout bleed across navigation transitions.*

---

## 3. Circular Dependency & Architecture Verification

Always run:
```bash
pnpm lint:circular
```
before opening PRs or merging refactors. Madge scans all packages under `packages/` and `app/src` to ensure 0 circular import chains exist.
