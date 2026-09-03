# Component Deep Dive — Module Assembly (`@cap/platform-core/assembly`)

File: `packages/platform-core/src/assembly/index.tsx` (backed by `packages/platform-core/src/assembly/ModuleRegistry.ts`)

## What It Does
`assembleApp({ modules })` is invoked from `app/src/AppAssembly.tsx`, which resolves the module list automatically via Vite `import.meta.glob` (eager) plus the runtime `registerDynamicModule()` API, and memoizes the assembled component. On each call `assembleApp`:
1. Resets the `ModuleRegistry` singleton (`modulesMap`, `searchItems`, `seenSearchIds`).
2. Registers each module via `registry.registerModule(module)`, which:
   - Initializes `module.i18n` bundles into i18next strictly isolated by module namespace (`moduleNs = module.id || module.name || 'common'`). This eliminates global translation key collisions across modules.
   - Appends `module.searchItems`, deduped by `item.id` (first occurrence wins).
3. Calls `registry.extractRoutesAndNav()`, which collects each module's `navItems` into `navItemsToRegister`, flattens route configs into one array deduped by `path` (first occurrence wins; each module's route source is `module.routes || module.authRouteConfig` — `routes` takes priority when a module defines both), and auto-extracts nav items from routes that carry `variant`/`roles`/`guestOnly`/`icon` metadata.
4. Returns a functional `App` component that (in a `useEffect`) clears navigation in the Zustand store and registers the collected nav items, then renders a single `<Routes>` tree where each route is wrapped in `<LayoutRouteWrapper layout={layout || 'none'}>{element}</LayoutRouteWrapper>` (children pattern — `LayoutRouteWrapper` also accepts an `element` prop, but `children` takes priority when both are given), plus a catch-all wildcard `<Route path='*' element={<LayoutRouteWrapper layout='none'><NotFound /></LayoutRouteWrapper>} />`.

## Notable Implementation Details
- **Singleton registry with module-level mutable state instead of React state/context.** `ModuleRegistry` is a shared, non-reactive global singleton; the assembled `<Routes>` tree is memoized in `AppAssembly` via `React.useMemo`, and dynamic module registration triggers a revision bump to re-assemble.
- **Isolated i18n namespaces**: i18n resources are registered under module-scoped namespaces to ensure module translation keys do not overwrite each other.
- **Layout metadata preservation**: `assembleApp` passes the `layout` metadata to `LayoutRouteWrapper`, ensuring non-default layout overrides like `noLayout` or `admin` are properly synced to the layout state.
- **Dedicated Catch-All 404 Route**: Unmatched paths trigger the `<NotFound />` component wrapped in `LayoutRouteWrapper`, avoiding blank null screens.

## Consumers
- `app/src/AppAssembly.tsx` — the primary application invocation.
- `getNavItems()`, `getSearchItems()`, `getModules()` are exported for other parts of the app to read the merged registries.
