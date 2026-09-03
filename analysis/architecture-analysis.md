# Architecture Analysis — CAP Monorepo

## Pattern: Pluggable Module Federation (Compile-Time)
The core architectural idea is a **"module assembly"** pattern implemented in `packages/platform-core/src/assembly`:

- Each feature area is a self-contained package (`@cap/module-auth`, `@cap/module-landing`, `@cap/module-theme`, etc.) exporting a `CAPModule` descriptor with:
  - `routes` — route configs, each tagged with a `RouteLayout` (`public | vertical | horizontal | noLayout | admin | none`); `ModuleRegistry` also accepts a legacy `authRouteConfig` key as a fallback
  - `navItems` — navigation entries
  - `searchItems` — global command-palette/search entries
  - `i18n` — per-locale dictionaries
- `assembleApp({ modules })` in the host app (`app/src/AppAssembly.tsx`) combines the discovered modules into one React component:
  - Deduplicates nav/search items by path/id (first module registered wins)
  - Merges all routes into a single `<Routes>` tree, wrapping each element in `LayoutRouteWrapper` so the declared `layout` intent is applied at render time
  - Syncs navigation into a Zustand-backed store for reactive UI updates
- Modules are discovered **automatically** via Vite `import.meta.glob` (`../../packages/modules/*/src/index.ts`, eager) plus the runtime `registerDynamicModule()` API — there is no manual import list to comment/uncomment. A module ships as a compile-time dependency of `@cap/app` simply by existing in `packages/modules/`.

This is conceptually similar to a plugin system or micro-frontend composition, but everything is bundled into one SPA rather than independently deployed.

## Auth Module: Domain-Driven / Hexagonal Structure
`packages/modules/auth/src` stands out as more deeply architected than the other modules:
```
auth/src/
├── domain-kernel/   # core domain types/events/ports, own package.json (sub-package)
├── idaas-facade/     # facade layer — likely abstracts an external Identity-as-a-Service provider
├── modules/           # auth sub-features
├── plugins/           # pluggable auth strategies (e.g. MFATOTPPlugin used in AppAssembly)
├── registry/          # plugin/strategy registration
└── routes/
```
- `domain-kernel/src` further splits into `data`, `events`, `i18n`, `ports`, `types` — a **ports-and-adapters (hexagonal architecture)** style, where `ports` define abstract interfaces the domain depends on and adapters (elsewhere) implement them.
- The `plugins` + `registry` pair (initialized by `initAuthPlugins([MFATOTPPlugin])` in `packages/modules/auth/src/index.ts` at module load) implements a **strategy/plugin registration pattern** for authentication methods — MFA via TOTP is the only plugin currently wired in, suggesting the system is designed to support multiple MFA/auth strategies pluggably.
- `idaas-facade` (Identity-as-a-Service facade) hints at integration with an external identity provider, consistent with the "Blockchain IDaaS" module referenced (but not yet included) in the app.

## Cross-Cutting Concerns (via `@cap/platform-core`)
`platform-core/src` centralizes shared infrastructure consumed by all modules:
- `contexts/` — React contexts (tenant, settings, etc.)
- `services/` — `tenantService.ts` plus `auth/`, `config/`, `theme/`, `user/` service groups; likely wraps API calls (React Query hooks probably live under `hooks/`)
- `registry/` — likely the module registry backing `assembleApp`
- `theme/` — theme resolution logic (separate from the `@cap/theme` design-system package)
- `stubs/` — placeholder/mock implementations, useful for isolated dev or testing

## Multi-Tenancy
`TenantProvider` → `useTenant()` exposes `theme`, `isLoadingTheme`, `errorTheme`, `refetchTheme`, `updateTheme`, `saveTheme`. The app fetches a tenant-specific theme asynchronously and can persist edits — implying an admin-configurable, white-label theming system per tenant, layered on top of the static `@cap/theme` design tokens.

## i18n Composition
`Providers.tsx` manually merges each module's `i18n` resources into i18next at startup:
1. Strict namespacing by module ID (e.g., `moduleNs = module.id || 'common'`) prevents cross-module key collisions.

This isolation means that consumers must either reference the explicit namespace or rely on correctly bound local instances of the translation hook.

## Observed Risks / Open Questions (non-blocking, for Phase 2)
- **Glob-based module toggling:** modules are auto-discovered by Vite `import.meta.glob`; removing a module requires removing the package from `packages/modules/` and pruning `app/package.json`, not a runtime flag.
