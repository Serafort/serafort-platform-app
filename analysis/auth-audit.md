# `@cap/module-auth` — IDaaS & Authentication Core Audit

Date: 2026-08-06 · Scope: `packages/modules/auth` against the "Multi-Tenant IDaaS & Authentication Core" spec (email/password, OAuth2/OIDC, magic links, session management, strict tenant-level data isolation).

**Headline verdict:** the module has a genuine client-side skeleton — real service/hook/store/guard layers, a real in-process domain event bus, real React Query + Zustand wiring, and real admin CRUD UIs — but **none of the five spec areas is end-to-end functional**. All actual authentication is delegated to an external backend that is **not part of this repository** (default `http://localhost:3333/api`, see `app/e2e/test-config.ts:6` and `packages/platform-core/src/services/config/index.ts:3`). Two features (magic links, OIDC) are effectively unimplemented, and tenant data isolation is enforced nowhere.

---

## Spec Area 1 — Email/password authentication — ⚠️ ~70% real

### Implemented (real logic)
- Service layer: `modules/authentication-core/services/auth.service.ts` — `signin`, `signup`, `signout`, `refreshToken`, `forgotPassword`, `resetPassword`, `verifyEmail`, `resendVerification`, session endpoints, and domain-event publishing (`UserAuthenticated`, `SessionCreated`, `TokenIssued`, `SessionRevoked`) on each lifecycle transition.
- Endpoint registry: `services/endpoints.ts` (`/api/auth/*`, `/api/user/*`, `/api/admin/*`).
- React Query hooks: `hooks/useAuthQuery.ts` — `useSignin`, `useRegister`/`useSignup`, `useForgotPassword`, `useResetPassword`, `useSession`, `useSessions`, `useRevokeSession`, `useSsoDiscovery`, etc.
- Zustand store: `authentication-core/store/index.ts` (auth slice + UI slice).
- Guards: `middlewares/AuthRoute.tsx`, `GuestRoute.tsx`, `AdminRoute.tsx`.
- Real screens calling the real service: `SignInV2` (primary `/auth/sign-in`), `SignUp`/`SignUpV2`, `ForgotPassword`, `ResetPassword`, `SetNewPasswordScreen`, `EmailVerificationScreen`.

### Stubbed / placeholder
- **Three parallel screens "authenticate" via `setTimeout(1500)` with no API call** — `screens/signin/LoginScreen.tsx:40-45` (`/auth/login`), `screens/signup/RegistrationScreen.tsx:36-38` (`/auth/register`), `screens/signin/AdminLoginScreen.tsx:29-31` (`/auth/admin/login`).
- **MFA/passkey verification inside the real `SignInV2` flow resolves through an explicit mock** — `mfa-orchestrator/services/mfa.service.ts:1-20` (`verifyMfaCode` always returns `success: true`; passkey `verifyLogin` returns an empty session). Comment: "Temporary mock service for MFA until @cap/module-mfa is available."
- **Demo credentials prefilled in the primary sign-in form** — `SignInV2.tsx:19-25` (`admin@example.com` / `password`), violating AGENTS.md §5.
- `CheckEmailConfirmation.tsx:31-42` — resend button is a fake `setTimeout`, never calls `resendVerification`.
- Zod schemas in `utils/schema.ts` are dead code — referenced only by `schema.test.ts`; screens hand-roll validation.
- `LoginScreen`/`AdminLoginScreen`/`RegistrationScreen` additionally hardcode navigation (e.g. `navigate('/auth/recovery')`, `navigate('/auth/sso/initiate?...')`) to paths that don't exist in the route config.

### Where authentication actually happens
- Nowhere in-repo. `signin`/`signup` are thin `apiClient.post` calls; credential verification, password hashing, and session minting are backend-only. The `domain-kernel` ports (`IAuthenticateUser`, `IUserRepository`, `IPasswordless`, `ISessionManager`, `IMfaOrchestrator`) are declared but have **zero implementations** in the monorepo.

---

## Spec Area 2 — OAuth2/OIDC — ❌ Not a provider

### Implemented
- Full admin CRUD UIs (real react-hook-form/zod forms + lists): `OIDCClientCreate`, `OIDCClientEdit` (with secret rotation), `OIDCConfigBrowser`, `JWKSManagement`, `SSFConfiguration`, `SAMLConfigDashboard`.
- HTTP wiring: `auth.service.ts:290-321` (`/api/auth/oidc/*`, `/api/auth/saml/sso`), plus `useOidcCompliance.ts` hooks and `adminService.ts:368-422` OIDC client CRUD.
- Client-side RBAC permission engine (`authorization-engine/services/authorization.service.ts:124-219`) and the in-process domain event bus.

### Absent / stubbed
- **No OIDC protocol logic whatsoever** — no discovery document (`.well-known/openid-configuration`), no JWKS serving, no authorization/token/introspection endpoint logic, no PKCE, no state validation, no signature verification. All "OIDC" is redirects + HTTP calls to a backend that doesn't exist in the repo.
- **`OidcWaitScreen.tsx:25-26` hardcodes `http://localhost:3333`** (dev-only origin) and builds the auth URL by string concatenation.
- **Admin SSO config screens are unreachable (dead code)** — `identity-broker/routes/routes.tsx:16-25` registers only public SSO flow screens; the OIDC/JWKS/SSF/SAML config screens are not routed anywhere. `src/index.ts:141` says they "moved to `@cap/module-admin`", which **does not exist** in `packages/modules/`.
- `RbacSubscriber` (`authorization-engine/src/services/rbac.subscriber.ts:15-29`) is an intentional no-op shell subscribing to `USER_AUTHENTICATED`/`SESSION_CREATED`/`SESSION_REVOKED`/`TOKEN_ISSUED`.
- `SAMLConfigDashboard.tsx:576-608` ships hardcoded fake signing keys; `SSFConfiguration.tsx:197` hardcodes the JWKS URL string `/.well-known/jwks.json`.
- Duplicate `AdminService` in two packages (`authorization-engine` and `auth-contracts`) with identical endpoint paths — drift risk.

---

## Spec Area 3 — Magic links (passwordless) — ❌ Not implemented

- **Service methods exist but have zero callers**: `authService.passwordless.send` / `.verify` (`auth.service.ts:261-271`) → `POST /api/auth/passwordless/send`, `GET /api/auth/passwordless/verify?token=...`.
- **Both routed screens are fake-timer stubs**: `PasswordlessInitiation.tsx:27-29` (`setTimeout(1500)` then navigate, never sends), `PasswordlessVerification.tsx:17-29` (fake progress bar then flips to "expired", never verifies, "Resend link" has no `onClick`).
- **No hooks**: `passwordless-service/hooks/index.ts` is empty (`export {}`). No `usePasswordlessSend`/`usePasswordlessVerify` exists.
- **Dead duplicate screen**: `authentication-core/screens/email/PasswordlessVerification.tsx` is lazy-imported (`authentication-core/routes/routes.tsx:44`) but never added to `authCoreRouteConfig` (line 56-97). It is another `setTimeout(2500)` stub.
- **Wrong route guard**: `passwordless-service/routes/routes.tsx:16` wraps the *initiation* screen in `createAuthRoute` (authenticated `AuthRoute` guard) — wrong for a login-flow entry screen.
- The `IPasswordless` port has no implementation.

---

## Spec Area 4 — Session management — ⚠️ Real client half

### Implemented
- Real event-driven client lifecycle: `auth.service.ts:75-125` (signin → `UserAuthenticated`/`SessionCreated`/`TokenIssued`), `:127-138` (signout → `SessionRevoked`), `:205-229` (revoke → `SessionRevoked`).
- Real `useSessionGuard.ts` (hydration-aware, refreshes session via `refreshAuth()`).
- Real session list/revoke UI: `ActiveSessionsManagement`, `ActiveSessions` wired to `useSessions`/`useRevokeSession`/`useRevokeAllSessions`.
- `AccountOverview` wired to `useGetUser`, `useSecurityStatus`, `useLinkedAccounts`, `useUserTokens`.
- Domain types: `domain-kernel/src/types/session.ts`.

### Stubbed / gaps
- **`UserActivityTimeline.tsx` is a pure hardcoded mock** — static array of 5 fake activities (lines 10-61), "Load older activity" button is a no-op. Despite `AccountOverview` calling `useActivityTimeline`, this screen never does.
- Session minting/revocation is backend-only (thin HTTP wrappers in `useAuthQuery.ts:324-405`).
- `ActiveSessions.tsx:27-38` uses raw `window.alert`/`window.confirm` instead of the app snackbar system.

---

## Spec Area 5 — Tenant-level data isolation — ❌ Type-only / aspirational

**No `tenantId` is ever sent in any API request, header, or store.** The frontend cannot enforce server-side isolation, but it also does not even propagate tenant identity to the backend.

- **No tenantId in any request**: verified across `auth.service.ts`, `user.service.ts`, `adminService.ts` (1,392 lines), `useAuthQuery.ts`, and `authentication-core/services/endpoints.ts`. `ILogin`/`ISignup` (`shared-types/src/auth.ts:138-154`) carry no tenant. The only occurrence is `auth.service.ts:24` reading `tenantId` from the login response into an event payload — inbound only, never re-sent.
- **`FetchClient` sets no tenant header** — only `Authorization: Bearer` (`platform-store/src/services/api/api.client.ts:286-339`). No `X-Tenant-Id`/`x-tenant` anywhere.
- **`TenantProvider`/`useTenant` is a branding/theme resolver, not a data-isolation context** — resolves a `TenantConfig` (theme/layout/branding/modules) by `window.location.hostname` (`platform-core/src/services/tenantService.ts:214-216`). Every `useTenant()` consumer is theme/branding related; the only auth-package consumer is `PermissionConsentScreen.tsx:30` (display copy).
- **`platform-store` has zero tenant references** — no tenant slice, no tenant-scoped storage keys.
- **Domain-kernel ports are dead type contracts**: `tenantId?` is optional on only 7 of 28 methods and absent from all primary-key lookups (`findById`, `update`, `delete`, etc.); `authorization.ts` doesn't even import `TenantId` (scoping is by optional `organizationId`). Zero `implements` matches exist for `IUserRepository`, `IOrganizationRepository`, `IOrganizationMemberRepository`, `IPasswordless`, `IMfaOrchestrator`, `ISessionManager`, `IAuthenticateUser`, `IPolicyEngine`.
- **`createTenantId` is a bare cast, never called** — `domain-kernel/src/types/identifiers.ts:14-16`.
- **`User` domain entity carries no tenantId** (`domain-kernel/src/types/user.ts:6-22`); `TokenClaims.tid` (`types/authentication.ts:7`) is declared but nothing generates/validates it.
- **Fail-open authorization**: `PermissionCheckerService.checkPermission` returns `{ allowed: true }` immediately for `admin`/`super-admin`/`super_admin`/`superadmin` (`authorization.service.ts:183-190`), with no tenant/org scoping on any evaluation path.

---

## Cross-cutting findings

| # | Finding | Severity | Evidence |
|---|---|---|---|
| 1 | No backend exists in the repo; all auth is external API wiring | Info / architectural | `app/e2e/test-config.ts:6`; no server dir |
| 2 | 3 auth screens authenticate via `setTimeout(1500)` | High | `LoginScreen.tsx:40`, `RegistrationScreen.tsx:36`, `AdminLoginScreen.tsx:29` |
| 3 | MFA + passkey inside `SignInV2` resolve to an always-success mock | High | `mfa-orchestrator/services/mfa.service.ts:19` |
| 4 | Demo credentials prefilled in primary sign-in | Medium | `SignInV2.tsx:19-25` |
| 5 | Domain-kernel auth/user ports have zero implementations | High | `ports/authentication.ts`, `ports/user.ts` |
| 6 | Magic-link feature non-functional (no callers, fake screens, empty hooks, dead screen) | High | `PasswordlessInitiation.tsx:27`, `PasswordlessVerification.tsx:17`, `hooks/index.ts` |
| 7 | Admin OIDC/SAML/JWKS/SSF screens are unreachable dead code | High | `identity-broker/routes/routes.tsx:16-25`; `@cap/module-admin` doesn't exist |
| 8 | `RbacSubscriber` is an intentional no-op | Medium | `rbac.subscriber.ts:15-29` |
| 9 | Fail-open admin bypass in permission checks | High | `authorization.service.ts:183-190` |
| 10 | `UserActivityTimeline` shows fake data | Medium | `UserActivityTimeline.tsx:10-61` |
| 11 | Hardcoded `localhost:3333` in OIDC/social redirect paths | Medium | `OidcWaitScreen.tsx:25`, `SignInV2.tsx:289,299` |
| 12 | `useAuthStore`/`user` typed as `any` | Low | `store/index.ts:6` |

---

## Recommended remediation order

1. **Wire stub screens to real services** (LoginScreen, RegistrationScreen, AdminLoginScreen, CheckEmailConfirmation) and remove demo credentials — unblocks real email/password flow.
2. **Implement magic links end-to-end** — add `usePasswordlessSend`/`usePasswordlessVerify` hooks, wire both screens, fix route guard, remove dead screen.
3. **Fix hardcoded origins** — derive OIDC/social URLs from `API_CONFIG.BASE_URL`.
4. **Wire `UserActivityTimeline`** to `useActivityTimeline`.
5. **Tenant isolation plumbing** — propagate tenant identity to the request layer (`X-Tenant-Id` header from the resolved tenant config) so a backend can scope by it; note that server-side enforcement and the port implementations are outside the frontend's reach.
6. **Backend**: a real IDaaS server (in or out of repo) implementing `/api/auth/*`, `/api/auth/oidc/*`, `/api/auth/passwordless/*`, session minting/revocation, and tenant scoping is required for any of this to be end-to-end functional.
