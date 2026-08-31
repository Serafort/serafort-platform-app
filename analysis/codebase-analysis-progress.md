# Codebase Analysis & Maintenance Log

## Project Summary
- **Root:** `C:\Node.Js\proj\boilerplate`
- **Name:** `cap-monorepo` (`@cap/*` packages) — multi-tenant civil/digital-identity platform boilerplate.

---

## Architecture & Maintenance Updates (Recent Milestones)

### 1. Dedicated Not Found (404) Route
- **File:** `packages/platform-core/src/assembly/index.tsx`
- **Details:** Mapped wildcard route (`*`) in `assembleApp()` to a dedicated `<NotFound />` component in `@cap/platform-core` wrapped in `<LayoutRouteWrapper element={<NotFound />} />`. Avoids blank null screens on unmatched URLs.

### 2. Isolated i18n Resource Bundles
- **File:** `packages/platform-core/src/assembly/index.tsx`
- **Details:** Updated `assembleApp()` to register module `i18n` bundles strictly by module namespace (`moduleNs = module.id || module.name || 'common'`). Eliminates key collision risk across modules.

### 3. Route Layout Association Fix
- **File:** `packages/platform-core/src/assembly/index.tsx`, `packages/layout/src/components/wrappers/LayoutRouteWrapper.tsx`
- **Details:** Moved `LayoutRouteWrapper` to `@cap/layout` and updated `assembleApp()` to wrap every route in `<LayoutRouteWrapper element={element} layout={layout} />`. Preserves layout metadata (`noLayout`, `admin`, `public`) across all route configs.

### 4. Activated DDD Event Bus
- **Files:** `packages/modules/auth/src/modules/authentication-core/services/auth.service.ts`
- **Details:** Injected `eventBus.publish()` calls across key authentication lifecycle hooks (`UserAuthenticated`, `SessionCreated`, `TokenIssued`, `SessionRevoked`, `TokenRefreshed`, `AuthenticationFailed`), ensuring domain events publish on state changes.

### 5. Dynamic Table Virtualization Measurements
- **Files:** `packages/layout/src/components/ui/virtualized/VirtualizedTable.tsx`
- **Details:** Bound `measureElement` ref to `TableRow` elements to accurately calculate dynamic row heights in TanStack Virtualizer, resolving table height jumps.

### 6. Security Audit Remediation (Critical & High)
- **Files:** `packages/platform-core/SECURITY.md`, `packages/platform-store/src/services/storage/*`, `packages/modules/auth/*`, `*.env`
- **Details:** Addressed all 15 findings from the `CAP_Boilerplate_Security_Audit_Report.txt` including untracking secrets, deprecating plaintext session storage in favor of `authSlice`, enforcing exact route matching, implementing strict RBAC in `PermissionCheckerService`, upgrading PRNG to `crypto.randomUUID()`, and enforcing `POST` for sensitive operations.

### 7. Removed Orphaned Module package.json Files
- **Files:** `packages/modules/auth/src/modules/*/package.json`, `packages/modules/auth/src/domain-kernel/package.json`
- **Details:** Removed the vestigial package manifests from the auth submodules that were effectively inert and causing workspace dependency drift, fully resolving item #8. The modules correctly rely on the parent `@cap/module-auth` and TS path mapping.

### 8. Monorepo AST Cleanup (Unused Imports & Dead Handlers)
- **Details:** Pruned 241 unused imports across 113 files and cleaned dead variables/handlers across 12 files. Gated all test credentials behind `import.meta.env.DEV`.

### 9. Environment Setup & E2E Test Suite Hardening (Track B2)
- **Files:** `playwright.config.ts`, `app/e2e/*`, `app/vite.config.ts`
- **Details:** Migrated all 57 database schemas on local MySQL 9.5 and executed seeders (`01_core_starter_seeder` through `07_agents_features_seeder`). Gated `mkcert` on `HTTPS=true` and fixed Playwright ready-check to `/health` (200 OK). Hardened locators across `auth.setup.ts`, `signin.spec.ts`, and `signup.spec.ts`.

### 10. Strong Typed-Contract Pass (Track B3)
- **Files:** `packages/modules/auth/*`, `packages/modules/theme/*`, `packages/theme/*`, `packages/api-contracts/*`
- **Details:** Replaced `as any` casts with strict TypeScript interfaces. Defined `MfaLoginCompletionResponse`, typed mutation options with `UseMutationOptions<TData, Error, TVariables>`, typed WebAuthn JSON options, and verified 0 errors across all 15 packages via `pnpm -r run type-check`.

### 11. Bundle & Performance Budget Optimization (Track B4)
- **Files:** `app/vite.config.ts`
- **Details:** Implemented modular `manualChunks` splitting for feature modules (`module-auth-*`, `module-landing`, `module-dashboard`, `module-theme`, `module-widget-studio`, `module-layout`) and vendors. Reduced initial bootstrap entry from 5.2 MB down to 53.9 kB (17.0 kB gzip). Verified clean production compilation with `pnpm --filter @cap/app run build`.

---

## Accuracy Review (Latest Pass)
- Verified tech stack claims in `project-overview.md` against actual `package.json` files (root, `app`, `platform-core`, `theme`, `layout`) — all confirmed accurate (React 19, Vite 7, React Router 7, MUI 7, TanStack Query 5, Zustand 5, Zod 4, i18next, Vitest 4, Playwright).
- Corrected `module-assembly.md` and `technical-issues.md` (#1, #3): the actual `LayoutRouteWrapper` call in `assembly/index.tsx` uses the children pattern (`<LayoutRouteWrapper layout={...}>{element}</LayoutRouteWrapper>`), not the previously documented `element={element}` prop form. Also documented the undocumented `module.routes || module.authRouteConfig` fallback.
- Confirmed the `app/src/menu/` migration is complete (folder no longer exists).
- **Resolved** the orphaned-package finding: Removed the inert `package.json` files under `packages/modules/auth/src/modules/*` and `packages/modules/auth/src/domain-kernel`.
- Fixed: `auth.service.ts` contained a comment claiming "MFA and Passkey logic moved to @cap/module-mfa", but no such package existed — `MFATOTPPlugin` actually lives at `packages/modules/auth/src/plugins/MFATOTPPlugin.tsx`. Corrected comments in `auth.service.ts` and `useAuthQuery.ts`.

## Documentation Artifacts
- `analysis/project-overview.md` — system overview
- `analysis/architecture-analysis.md` — platform architecture breakdown
- `analysis/technical-issues.md` — tracked technical issues and resolution log
- `analysis/component-deep-dives/` — detailed component analysis for assembly, auth, theme, domain kernel, virtualization, and session state
- `packages/platform-core/src/assembly/README.md` — assembly module API and architecture guide
