# Prioritized Technical Recommendations

This document outlines prioritized refactoring roadmaps and architectural recommendations to address the bugs, performance improvements, and codebase drift identified during the analysis.

---

## 1. High Priority: Route Layout Association Bug

> **Current status: RESOLVED.** Both recommended resolutions landed. `LayoutRouteWrapper` was moved from `@cap/module-auth` into `@cap/layout` (canonical implementation now lives at `packages/layout/src/components/wrappers/LayoutRouteWrapper.tsx`), and `assembleApp` wraps every route element at compile time (see `packages/platform-core/src/assembly/index.tsx`). The `layout` attribute is read from each route config and applied dynamically:
>
> ```tsx
> // packages/platform-core/src/assembly/index.tsx (Current implementation)
> {allRouteConfigs.map(({ path, element, layout, label }) => (
>   <Route
>     key={path}
>     path={path}
>     element={
>       <LayoutRouteWrapper layout={layout || 'none'} label={label}>
>         {element}
>       </LayoutRouteWrapper>
>     }
>   />
> ))}
> ```
>
> Remaining caveat: `LayoutRouteWrapper` only distinguishes `'noLayout'` and `'admin'` at runtime — `'vertical'`/`'horizontal'`/`'public'` are accepted by the type but currently inert. See `architecture-report.md` §4 and the `improvement-roadmap.md` Phase 1 routing items.

### The Issue
The module compilation system in `packages/platform-core/src/assembly/index.tsx` (`assembleApp`) reads each module's `authRouteConfig` configuration and builds Route elements using only `path` and `element`. The `layout` attribute (e.g. `layout: 'noLayout'`) is discarded:

```typescript
// packages/platform-core/src/assembly/index.tsx (Historical implementation — fixed)
const App = () => {
  return (
    <Routes>
      {allRouteConfigs.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}
      <Route path='*' element={null} />
    </Routes>
  )
}
```

### Impact
Any screen declared as a bare element (such as `Path.signinV2`, `Path.login`, and recovery/verification views) that relies on `layout: 'noLayout'` to render without headers/footers gets rendered inside the public site layout. Only routes wrapped explicitly by `createAuthRoute` or `createAdminRoute` function properly because they trigger layout changes inside their own react lifecycles.

### Proposed Resolutions

*   **Resolution A: Move and Wire Layout Wrapper (Recommended)** — **DONE (see status note above)**
    1.  Move `LayoutRouteWrapper` from `@cap/module-auth` into `@cap/layout` (to prevent circular package dependencies).
    2.  Update `assembleApp` to import `LayoutRouteWrapper` and wrap elements dynamically during routing compilation:
        ```tsx
        // Proposed Fix in assembleApp (implemented)
        {allRouteConfigs.map(({ path, element, layout }) => (
          <Route
            key={path}
            path={path}
            element={<LayoutRouteWrapper element={element} layout={layout} />}
          />
        ))}
        ```
*   **Resolution B: Enforce Explicit Decorator Factory Wrapping**
    1.  Convert all bare auth views in `authCoreRouteConfig` to use the decorator factory `createAuthRoute` explicitly, defining `layout: 'noLayout'` inside the decorator parameters rather than the outer routing configuration block.

---

## 2. Medium Priority: i18n Key Collision Mitigation

> **Current status: RESOLVED.** `ModuleRegistry.registerModule()` (in `packages/platform-core/src/assembly/ModuleRegistry.ts`) now registers each module's `i18n` bundles under a module-scoped namespace (`moduleNs = module.id || module.name || 'common'`) via `i18next.addResourceBundle(langLower, moduleNs, resources, true, true)`, in addition to merging into the shared `translation`/`common` bundles. This eliminates silent cross-module key overwrites.

### The Issue
The i18n composition in `assembleApp` merges dictionary bundles directly into global namespaces using `overwrite: true`.
As the module count grows (e.g. adding KYC, Civil Registry, Digital ID), duplicate keys across dictionaries will silently overwrite each other based on module registration order, leading to localization bugs.

### Proposed Resolution
Refactor the translation system to enforce **module-scoped namespaces**:
1.  Configure the root i18next instance to support multiple namespaces.
2.  Register translation keys under namespaced scopes (e.g., `auth:login.title` instead of `auth.login.title` in a global namespace).
3.  Adjust module i18n declarations to export their scope names, letting the compiler register them cleanly under distinct namespaces:
    ```typescript
    // Proposed Namespace Registration (implemented)
    i18next.addResourceBundle(lang.toLowerCase(), module.id, resources, true, true)
    ```

---

## 3. Medium Priority: Workspace & Dependency Drift Cleanup

> **Current status: RESOLVED.** `pnpm-workspace.yaml` no longer references a `packages/platform-api` entry (it lists only existing packages plus `packages/modules/**`), `app/package.json` declares only the three vendored modules that actually exist (`@cap/module-auth`, `@cap/module-landing`, `@cap/module-theme`), and `AppAssembly.tsx` discovers modules via `import.meta.glob` with no commented-out import blocks. Additionally, the vestigial per-sub-module `package.json` manifests under `packages/modules/auth/src/**` were removed (see `codebase-analysis-progress.md` item 7).

### The Issue
The project contains several leftovers from a larger monorepo:
*   `pnpm-workspace.yaml` refers to a non-existent `packages/platform-api`.
*   `app/package.json` declares dependencies on seven modules that are missing from disk (`@cap/module-admin`, `@cap/module-user`, `@cap/module-civil-registry`, etc.).
*   `AppAssembly.tsx` imports these packages inside commented-out blocks.

### Proposed Resolution
1.  **Prune Configs**: Remove the missing packages from `app/package.json` and delete the `packages/platform-api` entry from `pnpm-workspace.yaml` to ensure clean workspace resolutions and avoid installation warnings.
2.  **Document Activation**: Place a standard "Module Activation Checklist" in the onboarding guide so developers know how to add and register these modules once they are checked back into the repository.

---

## 4. Low Priority: Catch-All Route Rendering

> **Current status: RESOLVED.** `assembleApp` now renders a dedicated `NotFound` screen (from `@cap/platform-core/src/components/NotFound`) inside a `LayoutRouteWrapper` for the fallback route:
>
> ```tsx
> // packages/platform-core/src/assembly/index.tsx (Current implementation)
> <Route path='*' element={<LayoutRouteWrapper layout='none'><NotFound /></LayoutRouteWrapper>} />
> ```

### The Issue
Unmapped paths hit `<Route path='*' element={null} />` in `assembleApp`, rendering a blank screen inside the currently active layout.

### Proposed Resolution
Create a custom `NotFound` component inside `@cap/layout` (retaining tenant design systems) and set it as the default element for the fallback route:
```tsx
// Proposed NotFound Integration (implemented)
<Route path='*' element={<NotFoundScreen />} />
```

---

## 5. Low Priority: Virtualized Table Dynamic Sizing

> **Current status: RESOLVED.** `VirtualizedTable.tsx` now binds the `measureElement` ref to its `TableRow` elements (`ref={measureRef}`, sourced from `rowVirtualizer.measureElement`, with `data-index`), giving it the same dynamic row-height measurement as `VirtualizedList` and `VirtualizedGrid`.

### The Issue
`VirtualizedTable.tsx` calculates row positions using static height estimates (`estimatedRowHeight`), but does not attach the `rowVirtualizer.measureElement` ref to its `TableRow` elements. If row content wraps or varies in size, the table layout will jitter or misalign.

### Proposed Resolution
Attach the measure element ref to standard row renders:
```tsx
// Proposed TableRow Integration (implemented)
<TableRow hover key={row.id} ref={rowVirtualizer.measureElement} data-index={virtualRow.index}>
```
This enables the table to dynamically measure and adjust row heights on the fly, matching the robust behavior found in `VirtualizedList` and `VirtualizedGrid`.

---

## 6. Medium Priority: Architectural Extensibility & Agentic Integrations

To prepare the codebase for modern development paradigms (such as AI-driven agentic assistants, developer tooling integrations, and decoupled real-time synchronization):

### Model Context Protocol (MCP) Server for API Contracts
*   **Recommendation**: Implement a local Model Context Protocol (MCP) server that exposes the static typescript definitions, schemas, and endpoints under `packages/api-contracts` and `packages/auth-contracts`.
*   **Rationale**: Exposing contracts via an MCP server establishes a standardized, secure channel for external agents (like IDE coding assistants or automation workflows) to read and understand the API interfaces without exposing core secrets or production data keys.
*   **Status**: Not yet claimed — no MCP server exists in the repo as of this review. `@cap/api-contracts` and `@cap/auth-contracts` remain constants/type-only packages with zero afferent coupling (see `docs/MODULE_COUPLING_REPORT.md`), so this remains open for a future implementation.

### Granular OAuth-Style Token Scopes for Machine Identities
*   **Recommendation**: Extend the `authorization-engine`'s API Token management (`APITokenActions.tsx`, `MachineIdentityManagement.tsx`) to support granular, OAuth2-style permissions scopes (e.g., `read:contracts`, `write:layout`, `manage:sessions`).
*   **Rationale**: Restricts external systems, automation agents, or service accounts accessing the identity APIs to the absolute minimum privileges required, preventing lateral escalation if a token is compromised.

### Decoupled State Mutators via Event Bus
*   **Recommendation**: Enforce that external inputs arriving via WebSockets or Server-Sent Events (`useSSE.ts`) must publish events to the `domain-kernel/src/events/event-bus.ts` rather than triggering direct slice mutations or hook refetches.
*   **Rationale**: Preserves unidirectional data flows and decouples real-time stream processing from local client store synchronization, allowing plugins and audit subscribers to hook into incoming changes transparently.

---

## 7. High/Medium Priority: Security Hardening

Strengthen the application layer's security posture against client-side exploitation and supply chain vulnerabilities:

### Content Security Policy (CSP) Enforcement
*   **Recommendation**: Set up a strict CSP header (or `<meta http-equiv="Content-Security-Policy">` in `/app/index.html` as a fallback):
    *   Restrict `script-src` and `object-src` to trusted domains.
    *   Limit `connect-src` to authorized tenant endpoints and WebSocket/SSE streams.
    *   Sanitize resources like images (`/app/public/icons/`) and fonts.
*   **Rationale**: Serves as a critical defense layer to block Cross-Site Scripting (XSS) and data exfiltration.

### Strict IP Constraints at API Gateway
*   **Recommendation**: Map the UI's IP configuration controls (`CreateAPITokenIPRestrictions.tsx`) to enforcement checks at the API gateway or reverse proxy level.
*   **Rationale**: Validates that all administrative and machine-to-machine calls are blocked if they originate from unlisted IP spaces, regardless of credential validity.

### Service Worker Cache Restrictions
*   **Recommendation**: Configure the Workbox service worker generator (`/app/dev-dist/sw.js` via Vite PWA plugin) to explicitly exclude caching for authenticated API endpoints, session tokens, or JWTs.
*   **Rationale**: Prevents sensitive authentication material from being persisted in unencrypted client-side cache stores where they could be extracted on compromised devices.

### Automated Supply Chain Dependency Auditing
*   **Recommendation**: Integrate automated auditing checks (such as `pnpm audit` or Dependabot scanning) directly into the repository pre-push or CI/CD pipelines.
*   **Rationale**: Detects and alerts on vulnerabilities in third-party libraries across the monorepo's multiple `package.json` boundaries.

---

## 8. Low Priority: Structural Refinements

Maintain codebase hygiene and reduce build/linter maintenance overheads:

### Barrel File Enforcement (`index.ts`)
*   **Recommendation**: Enforce the use of `index.ts` barrel files across all components and UI packages (e.g., `/packages/layout/src/components/ui/index.ts`). Add linter rules (e.g. `import/no-internal-modules`) to restrict deep subdirectory imports.
*   **Rationale**: Improves interface encapsulation, makes components clean to consume, and aids Vite's tree-shaker in stripping dead code during production compiles.

### Consolidation of Linting and Prettier Boundaries
*   **Recommendation**: Merge scattered configuration files (like separate `.prettierrc` or duplicate eslint files) into single root-level configurations. Use ESLint project references and overrides to target package-specific TypeScript rule variations.
*   **Rationale**: Mitigates configuration drift across packages and guarantees identical formatting behaviors across the entire developer team.

