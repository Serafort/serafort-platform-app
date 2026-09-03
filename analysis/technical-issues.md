# Technical Issues & Resolutions Log

Technical findings and resolution status tracking across the platform.

## 1. [RESOLVED] `layout` tagging is dropped for plain auth routes
- **Status:** FIXED
- **Resolution:** Moved `LayoutRouteWrapper` to `@cap/layout` package and updated `assembleApp()` in `packages/platform-core/src/assembly/index.tsx` to wrap every route in `<LayoutRouteWrapper layout={layout || 'none'}>{element}</LayoutRouteWrapper>`. Layout metadata (`layout: 'noLayout'`, `layout: 'admin'`, etc.) is now preserved across all route configurations.

> **Current status (verified 2026-08):** the consolidation that later fixes would have required is already done — `packages/platform-core/src/components/LayoutRouteWrapper.tsx` no longer exists in the tree (removed in `ca5ea29` "refactor: unify layout wrapping…"); the single canonical implementation lives at `packages/layout/src/components/wrappers/LayoutRouteWrapper.tsx` and `assembleApp` imports it from `@cap/layout`. The "duplicate implementations, already diverged" finding in `architecture-report.md` §4.3 is **historical** — the two-copy drift no longer exists. What remains open is the *behavioral* gap in §4.1: only `'noLayout'`/`'admin'` are honored at runtime.

## 2. [RESOLVED] i18n merge collision risk across modules
- **Status:** FIXED
- **Resolution:** Updated `assembleApp()` in `packages/platform-core/src/assembly/index.tsx` to register each module's `module.i18n` bundle under an isolated module namespace (`moduleNs = module.id || module.name || 'common'`). This eliminates global translation key collisions.

## 3. [RESOLVED] Catch-all route renders `null`
- **Status:** FIXED
- **Resolution:** Created dedicated `NotFound` component in `@cap/platform-core` (`packages/platform-core/src/components/NotFound.tsx`) and mapped wildcard path `*` to `<Route path='*' element={<LayoutRouteWrapper layout='none'><NotFound /></LayoutRouteWrapper>} />`.

## 4. [RESOLVED] Inert DDD Event Bus
- **Status:** FIXED
- **Resolution:** Injected `eventBus.publish()` calls into authentication lifecycle services (`auth.service.ts` publishing `UserAuthenticated`, `SessionCreated`, `TokenIssued`, `SessionRevoked`, `TokenRefreshed`, `AuthenticationFailed`), enabling event subscribers to trigger domain workflows on state changes.

## 5. [RESOLVED] Table Virtualization Row Height Jumps
- **Status:** FIXED
- **Resolution:** Bound `@tanstack/react-virtual`'s `measureElement` ref to `TableRow` elements in `VirtualizedTable.tsx` so dynamic row heights are accurately measured, eliminating layout shifts and height jumping.

## 6. Workspace/dependency drift
- **Status:** RESOLVED
- **Resolution:** Removed legacy npm `workspaces` from `package.json` and dropped the nonexistent `platform-api` from `pnpm-workspace.yaml`. The `app/package.json` dependencies on unimplemented modules remain commented out in code as scaffolding.

> **Current status (verified 2026-08):** the workspace is now clean — `pnpm-workspace.yaml` lists only existing packages plus `packages/modules/**`, and `app/package.json` declares only the three vendored modules that exist (`@cap/module-auth`, `@cap/module-landing`, `@cap/module-theme`). `AppAssembly.tsx` discovers modules via `import.meta.glob` with no commented-out import blocks. See also `technical-recommendations.md` §3.

## 8. [RESOLVED] Orphaned `package.json` files inside `@cap/module-auth`'s DDD submodules
- **Status:** RESOLVED
- **Details:** Every submodule under `packages/modules/auth/src/modules/` (`authentication-core`, `authorization-engine`, `developer-console`, `identity-broker`, `mfa-orchestrator`, `passwordless-service`, `platform-cluster`, `session-manager`, `user-directory`) has its own `package.json` (scoped `@idaas/*`, e.g. `@idaas/session-manager`, `@idaas/user-directory`), each declaring independent `dependencies`/`peerDependencies`. None of these are linked into `node_modules` (no `@idaas` scope exists at the repo root) despite `pnpm-workspace.yaml` including `packages/modules/**` — pnpm's workspace glob only discovers the immediate `packages/modules/auth` and `packages/modules/landing` projects, not package.json files nested further inside an already-matched project. These submodule manifests are effectively inert: their declared dependencies are never installed or deduped by pnpm, so any version differences from the parent `@cap/module-auth` manifest (e.g. `@mui/lab@7.0.1-beta.23` in `session-manager` vs `^7.0.1-beta.20` in the parent) are silently ignored.
- **Resolution:** Removed the vestigial `package.json` files from `packages/modules/auth/src/modules/*` and `packages/modules/auth/src/domain-kernel` as they were causing workspace drift and their dependencies were not being honored by `pnpm`. The parent module (`@cap/module-auth`) properly manages all dependencies for these subdirectories, and imports rely on typescript path aliases (`@idaas/*`).

> **Current status (verified 2026-08):** the manifests no longer exist on disk — the Details above are historical. The sub-modules correctly rely on the parent `@cap/module-auth` manifest and TS path mapping.

## 7. Security Audit Remediation
- **Status:** RESOLVED
- **Resolution:** All 15 findings from the `CAP_Boilerplate_Security_Audit_Report.txt` have been addressed:
  - **Critical:** Untracked `.env` files; implemented strict RBAC in `PermissionCheckerService`.
  - **High:** Deprecated the plaintext `SecureSessionManagementService` in favor of `authSlice`; enforced `VITE_STORAGE_ENCRYPTION_KEY` checks.
  - **Medium/Low:** Enforced `POST` requests for sensitive actions (logout, verifications); exact route matching in `PrivateRoute`; replaced `Math.random` with `crypto.randomUUID()`; implemented strict NIST-style password policies and `SameSite/Secure` cookies; removed sensitive `console.log` statements.
