# Component Deep Dive — Auth Module (`@cap/module-auth`)

## Structure
`packages/modules/auth/src` is organized as nine feature sub-modules under `modules/`, plus shared infrastructure:
```
auth/src/
├── domain-kernel/            # ports/adapters domain types, events, i18n (no own package.json — inert manifests removed)
├── idaas-facade/              # facade over an external Identity-as-a-Service
├── registry/                  # plugin registry (e.g. MFA strategies)
├── plugins/                   # pluggable strategies (MFATOTPPlugin etc.)
├── routes/                    # route aggregation + route-factory helpers (see below)
└── modules/
    ├── authentication-core/    # sign in/up, recovery, email flows, device/org join
    ├── authorization-engine/   # role/permission checks, AdminRoute middleware
    ├── developer-console/
    ├── identity-broker/
    ├── mfa-orchestrator/
    ├── passwordless-service/
    ├── platform-cluster/
    ├── session-manager/        # session guard hook consumed by AuthRoute/GuestRoute
    └── user-directory/
```
Each sub-module owns its own `routes/routes.tsx`, exporting a route-config array that gets spread into the top-level `authRouteConfig` in `routes/routes.tsx`, which in turn becomes `AuthModule.routes` in `src/index.ts` (`routes: authRouteConfig`). The legacy `authRouteConfig` key is also still present on the descriptor for backward compatibility with `ModuleRegistry`'s `module.routes || module.authRouteConfig` fallback.

This is a genuinely DDD/hexagonal-flavored auth domain — much more elaborate than a typical "boilerplate" auth slice, closer to a real identity platform (consistent with the civil-registry/KYC/digital-ID modules referenced elsewhere in the app).

## Route Composition — One Effective Path
`packages/modules/auth/src/routes/routes.tsx` exports **two** things from the same `authRouteConfig` data:
1. `authRouteConfig: ModuleRouteConfig[]` — the raw array (`{ path, element, layout? }`), consumed by `assembleApp` in `platform-core` (via `AuthModule.routes`).
2. `authRoutes: React.FC` — a legacy component that maps the same config through `<LayoutRouteWrapper>` inside its own `<Suspense>` tree. Its source comment states `assembleApp` wraps all module routes itself, and it is not imported/rendered anywhere in `app/` — retained for compatibility only.

**Only `authRouteConfig` (as `AuthModule.routes`) is actually used** via `assembleApp`, which wraps every route in `<LayoutRouteWrapper layout={layout || 'none'}>{element}</LayoutRouteWrapper>`.

## Layout Tagging Mechanism
Three different ways a route ends up correctly chrome-tagged, all of which now work:
| Mechanism | How layout gets applied | Works via `assembleApp`? |
|---|---|---|
| `createAdminRoute(path, element)` | Wraps `element` in `<AdminRoute layout='admin' .../>`, which itself calls `updateLayoutOverride('admin')` | ✅ Yes — layout logic lives inside the rendered element itself |
| `createAuthRoute(path, element, {layout})` | Wraps `element` in `<AuthRoute layout={layout} .../>`, which calls `updateLayoutOverride(layout)` in a `useEffect` | ✅ Yes — same reason |
| Plain `{ path, element: <GuestRoute element={...}/>, layout: 'noLayout' }` | Relies on `assembleApp`'s `LayoutRouteWrapper` reading the *outer* config's `layout` field | ✅ Yes — `assembleApp` wraps every route, so `'noLayout'` (and `'none'`/`'admin'` handling) is applied for bare elements too |

Concretely, sign-in (`SignInV2`, `SigninV2`, `LoginScreen`), sign-up (`SignUp`, `SignUpV2`, `RegistrationScreen`), and several recovery/verification screens all correctly render chrome-free. The only remaining gap: routes declared with `layout: 'vertical'`/`'horizontal'`/`'public'` are accepted by the type but `LayoutRouteWrapper` sets no override for them, so they silently render in `publicLayout` — see `technical-issues.md` and the roadmap.

## Plugin System (MFA)
- `initAuthPlugins([MFATOTPPlugin])` (called once at module load in `packages/modules/auth/src/index.ts`) registers plugins into `registry/`.
- Only a TOTP-based MFA plugin is currently wired in; the `plugins/` + `registry/` split implies the intent to support additional strategies (e.g. SMS, WebAuthn/passkeys, push) without changing `mfa-orchestrator` core logic — classic strategy pattern.

## Session/Guard Middleware
- `useSessionGuard` (in `session-manager`) is the shared hook behind both `AuthRoute` and `GuestRoute`, centralizing "is there a valid session" logic.
- `AuthRoute` additionally handles: loading state, session errors (with a "Go to Login" recovery action), role-based access (`allowedRoles`), and email-verification gating (`requiresVerification`), with admins bypassing verification.
- `GuestRoute` redirects already-authenticated users away from guest-only pages (e.g. sign-in) back to `/dashboard` or wherever they came from.

## `idaas-facade` and `domain-kernel`
Not yet opened in detail — flagged for a possible Phase 2 follow-up or Phase 3. Given the naming, `idaas-facade` most likely normalizes calls to an external identity provider (matches the "Blockchain IDaaS" module referenced but not active elsewhere), and `domain-kernel/src/ports` likely defines the abstract interfaces that facade and other adapters implement.
