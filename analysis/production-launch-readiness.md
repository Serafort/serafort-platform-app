# Production Launch Readiness — Gap Analysis

**Date:** 2026-08-30
**Assessed by:** Claude (session review)
**Verdict:** 🔴 **NOT READY.** Realistically a few focused days out, dominated by CI setup, end-to-end verification, and auditing the modules not yet reviewed.

---

## 1. Summary

| Area | Status | Notes |
|---|---|---|
| `@cap/module-auth` type safety | 🟢 Green | `tsc --noEmit` clean (was 14 errors) |
| Multi-tenant isolation | 🟢 Green | Header propagation + backend membership enforcement wired end-to-end |
| Authorization (RBAC) | 🟢 Green | `PermissionCheckerService` fails closed; cross-tenant checks precede any grant |
| MFA step-up token hardening | 🟢 Green | CSPRNG, honors server verdict |
| Core auth screens wired to backend | 🟡 Partial | Two live-broken flows fixed this session; rest of module spot-checked only |
| Working tree / release branch | 🔴 Blocker | 257 uncommitted files, mid-flight refactors |
| CI / automated gates | 🔴 Blocker | None exists |
| E2E verification | 🔴 Blocker | 8 Playwright specs never run against a live backend |
| Non-auth modules audited | 🔴 Blocker | `dashboard`, `landing`, `theme`, `widget-studio` not reviewed |
| Backend (`Authentication/` AdonisJS) audited | 🔴 Blocker | One middleware file read; no systematic review |
| Third-party security review / pen test | 🔴 Blocker | Required by `analysis/security-architecture.md`; no evidence performed |
| Production environment config | 🟡 Unverified | Env vars, cookie flags, HTTPS enforcement not confirmed in a prod target |
| Observability / incident response | 🔴 Missing | No error tracking, no runbook |

---

## 2. Scope of this assessment

**Reviewed in depth:** `packages/modules/auth` (`@cap/module-auth`) — all nine sub-modules
(`authentication-core`, `authorization-engine`, `developer-console`, `identity-broker`,
`mfa-orchestrator`, `passwordless-service`, `platform-cluster`, `session-manager`,
`user-directory`), plus `packages/platform-store/src/services/api/api.client.ts` and
`Authentication/app/middleware/tenant_middleware.ts`.

**Not reviewed:** `packages/modules/dashboard`, `packages/modules/landing`,
`packages/modules/theme`, `packages/modules/widget-studio`, `packages/platform-core` (beyond
tenant context), `packages/layout`, `packages/theme`, and the entire `Authentication/`
AdonisJS backend beyond tenant middleware.

**Method:** static review, `tsc --noEmit`, targeted `vitest` runs. No E2E, no load testing,
no live-environment testing, no dependency/CVE audit.

---

## 3. Release blockers (P0 — must clear before any launch)

### P0-1. Stabilize the release branch
- **Problem:** `git status` shows **257 uncommitted changes** on
  `feat/auth-security-and-architecture-hardening`, including in-flight structural work:
  the whole `mfa-orchestrator/screens/` tree is being reorganized into sub-folders, and
  `user-directory/screens/profile/profile.tsx` is a ~2,400-line rewrite that is not
  finished. `EditProfile.tsx` and `ProfileView.tsx` were deleted; `profile.tsx` was added.
- **Why it blocks:** there is no single, buildable, testable artifact to release. You
  cannot reason about "the build" while half the screen layer is being moved.
- **Action:** finish or shelve the refactors, commit in coherent units, merge to a
  release branch, confirm a clean `git status`.

### P0-2. Establish CI with blocking gates
- **Problem:** no `.github/workflows/`. Nothing enforces type-checking, linting, or tests.
  Three `auth.service.test.ts` tests have been failing (unnoticed) for some time.
- **Action:** add a pipeline that runs on every PR and blocks merge on failure:
  1. `pnpm -r run type-check` (all packages, not just auth)
  2. `pnpm --filter @cap/app run build` (`tsc -b && vite build`)
  3. `pnpm -r run lint`
  4. `pnpm -r run test` (`vitest run`)
  5. `pnpm --filter @cap/app run test:e2e` (Playwright, against a seeded backend)
  6. `pnpm run lint:circular` (madge — the repo already defines this script)
- **Acceptance:** all six green on the release branch.

### P0-3. Fix the 3 failing EventBus tests
- **File:** `packages/modules/auth/src/modules/authentication-core/services/auth.service.test.ts`
- **Failing:**
  - `publishes UserAuthenticated, SessionCreated, and TokenIssued events on successful signin`
  - `publishes SessionRevoked event on signout`
  - `publishes SessionRevoked event when revokeSession is called`
- **Status:** confirmed pre-existing (fail identically with all recent changes stashed).
- **Action:** determine whether the domain-event wiring regressed or the tests assert
  removed behavior. Fix the code or delete the dead tests — do not ship with a red suite.

### P0-4. Run the E2E suite against a live backend
- **Command:** `pnpm --filter @cap/app run test:e2e`
- **Specs that must pass:** `app/e2e/` — `signin.spec.ts`, `signup.spec.ts`, `mfa.spec.ts`,
  `passkey.spec.ts`, `session.spec.ts`, `password-reset.spec.ts`,
  `email-verification.spec.ts`, plus `auth.setup.ts`.
- **Why it blocks:** all real authentication is delegated to the AdonisJS backend
  (`http://localhost:3333/api` by default). Nothing in this repo has been exercised against
  a running server this cycle. The two HIGH defects fixed this session
  (`InitiateEmailChange`, `PasskeyLoginOption`) were *silent* — they compiled and rendered
  fine. Only E2E catches that class of bug.
- **Acceptance:** full suite green against a freshly-migrated, seeded backend. File tickets
  for every failure.

### P0-5. Audit the modules and backend not yet reviewed
- **Rationale:** a *casual* pass over one module surfaced two completely non-functional
  user-facing flows plus a fake "GDPR data export." The base rate on unreviewed code is
  therefore high.
- **Targets:**
  - `packages/modules/dashboard`
  - `packages/modules/landing`
  - `packages/modules/theme`
  - `packages/modules/widget-studio` (AI/Gemini/OpenRouter integration — check for leaked
    keys, prompt injection surface, unbounded cost)
  - `packages/platform-core` (assembly, config, storage encryption, SSE)
  - `Authentication/` — full backend review: authN/authZ controllers, session/token
    lifecycle, rate limiting, input validation, SQL/ORM usage, secret management,
    the tenant/organization membership model end-to-end
- **Method for each:** same as the auth pass — grep for `setTimeout` fake submits,
  `TODO`/`mock`/`Simulate`, hardcoded hosts/credentials, `as any` in error handlers,
  unguarded `console.*`, plus `tsc` and tests.

### P0-6. Third-party security review / penetration test
- **Requirement source:** `analysis/security-architecture.md` and project `CLAUDE.md` make
  this a hard gate ("Third-party audit firm contracted", "Penetration test pass rate:
  100%", "Threat model workshop completed").
- **Status:** no evidence any of this has occurred.
- **Action:** contract the audit, complete a threat-model workshop, remediate findings,
  obtain a pass.

### P0-7. Verify the production environment contract
- **`packages/platform-store/src/services/api/api.client.ts`** already throws if
  `VITE_API_URL` is unset or non-HTTPS in prod — good. Confirm the deploy actually sets it.
- **`VITE_STORAGE_ENCRYPTION_KEY`** — must be set. Its absence broke an entire test file
  this session (`useOidcCompliance.test.ts` threw `VITE_STORAGE_ENCRYPTION_KEY is not
  defined` via `emitGlobalNotification`). Confirm it is present and rotated per environment.
- **Backend cookies** — confirm `HttpOnly`, `Secure`, `SameSite` on all session/refresh
  cookies in the AdonisJS app.
- **CORS / CSP / security headers** — confirm at the edge (`app/public/_headers` exists but
  was not reviewed).
- **Token lifecycle** — verify refresh-token rotation, logout clearing the backend session,
  and graceful expiry redirect, end-to-end (original task list Tier 7, still open).

---

## 4. High priority (P1 — fix before launch, or launch with a documented, accepted risk)

### P1-1. `as any` density in `@cap/module-auth`
- **~230 remaining occurrences**, heaviest in `user-directory` (~100), `identity-broker`
  (~39), `platform-cluster` (~30).
- **Risk:** these mask real contract mismatches (that is exactly how the 14 type errors
  fixed this session had been suppressed). Error handlers casting to `any` swallow shape
  bugs.
- **Action:** dedicate a typed-contract pass — wire `@cap/api-contracts` DTOs into consumer
  hooks, remove casts in mutation `onError`/`onSuccess` handlers first (highest bug-catch
  value), then screen-level casts. Scope as its own workstream; do not attempt in one
  sweep.

### P1-2. `verifyMfaCode` returns `FetchResponse<any>`
- **File:** `packages/modules/auth/src/modules/mfa-orchestrator/services/mfa.service.ts`
- Every consumer (`useMfaLoginVerify`, `MFAVerificationScreen`) is also `any`-typed, so a
  real login-completion response shape is never enforced. Define a
  `MfaLoginCompletionResponse` type and thread it through as part of P1-1.

### P1-3. Duplicate / redundant auth entry screens
- Three live sign-up screens now exist: `SignUp` (multi-step, `/auth/signup`), `SignUpV2`
  (`/auth/signup-v2`), and `/auth/register` (repointed to `SignUp` this session). Decide on
  one, redirect the rest, update docs. (Original task list Tier 6 #9.)
- `identity-broker` has `AuthWaitScreen`, `OidcWaitScreen`, `SamlWaitScreen`,
  `OIDCLoginPrompt`, `SSOProviderSelection` — confirm each is reachable and needed.

### P1-4. `identity-broker` runtime test health
- `useOidcCompliance.test.ts` was de-rotted this session (8/16 → 16/16) by fixing the mock
  targets. Audit the *other* `identity-broker` test files (`useSAMLQuery`, `useJWKSQuery`,
  `useSCIMQuery`, `useSSFQuery`, `useProvisioningQuery` — several are untracked/new) for the
  same "mocks the wrong module" pattern.

### P1-5. SAML / SSF configuration screens ship hardcoded fixtures
- Per `analysis/auth-audit.md`: `SAMLConfigDashboard.tsx` had hardcoded fake signing keys;
  `SSFConfiguration.tsx` hardcodes a JWKS URL string. Verify these were replaced with real
  data flows before exposing the federation admin UI.

### P1-6. `PermissionCheckerService` — two residual soft spots
- **File:** `packages/modules/auth/src/modules/authorization-engine/src/services/authorization.service.ts`
- The cross-tenant guards (lines ~194–218) only run when `userContext.tenantId` is
  resolved. If a non-super-admin's tenant context is missing, the checks are skipped and a
  role named `"admin"` still matches `${resource}:*` (line ~231). Fail closed when a
  non-super-admin carries a tenant/org target but has no resolved `tenantId`.
- Line ~231 synthesizes `${request.resource}:*` from the role *string*, not from an
  assigned permission record. Prefer real permission entries.

### P1-7. Bundle size / performance budget
- Project `CLAUDE.md` targets: initial load < 500 KB, Lighthouse > 90, build < 30 s.
- Run `pnpm --filter @cap/app run analyze` and `size`; confirm MUI tree-shaking and route
  code-splitting are effective. Not measured this cycle.

---

## 5. Medium priority (P2 — acceptable to ship, fix in the first patch window)

- **`EmailChangeStatusDashboard` "Cancel Request"** — there is no backend endpoint to
  revoke a pending email change. The screen now navigates away without claiming a
  server-side cancellation; a proper `DELETE /api/user/change-email/:id` (or similar) plus
  UI wiring is still owed.
- **Untranslated UI strings** — `EmailChangeStatusDashboard`, `InitiateEmailChange`
  (user-directory) and others contain hardcoded English (`"Security Link Expires In"`,
  `"Need to cancel this change?"`, etc.). Run an i18n coverage check.
- **Dead scaffold components** — `user-directory/components/form/ChangeAccount.tsx` and
  `ChangeEmail.tsx` have commented-out `mutationFn` bodies and are referenced nowhere
  (`ChangePassword.tsx` in the same folder was already deleted). Delete or finish them.
- **`console.*` sweep** — the auth-module prod-path logs were removed this session
  (`SignOutButton`, `useSessionGuard`, the two dead form components). Repeat the sweep
  across the other modules and the backend.
- **`ApplicationDashboard` redirect-URI default** — now derives from
  `window.location.origin` (was hardcoded `http://localhost:5173/callback`). Confirm the
  Python snippet's `https://api.trustkey.com` placeholder is intentional.
- **Structured logging & error tracking** — wire Sentry (or equivalent), add request-ID
  tracing across frontend/backend, dashboard auth-failure rates. (Original task list Tier
  10.)
- **Incident runbook** — rollback procedure, how to disable a broken auth method, how to
  reset a locked account. (Tier 10.)
- **Operator / architecture docs** — tenant resolution flow, authorization model,
  deployment runbook, admin quick-start. (Tier 9.)

---

## 6. What is already production-grade

These were verified this session and need no further work for launch:

- **Multi-tenant data isolation.** `X-Tenant-Id` is attached to every request on both the
  main-thread client (`api.client.ts`) and the shared worker (`api.shared-worker.ts`);
  `TenantProvider` and `authSlice` keep it in sync across login/logout/switch/impersonation;
  the AdonisJS `tenant_middleware.ts` resolves the org, rejects unknown explicit tenants,
  and enforces `OrganizationMember` membership for non-admin users.
- **Authorization fails closed.** `PermissionCheckerService.checkPermission` returns
  `allowed: false` for malformed requests, missing targets, unauthenticated context,
  `userId` mismatch, and any cross-tenant/org boundary violation — all *before* any grant
  path. Only platform `super-admin` / `platform_owner` gets an unconditional allow.
- **MFA step-up token generation** uses `crypto.randomUUID()` / `crypto.getRandomValues`
  and fails closed if no CSPRNG is available; `verifyTotp` derives success from the server
  response body.
- **`@cap/module-auth` compiles clean** — `tsc --noEmit` reports 0 errors.
- **Passwordless (magic link)** screens are wired to real `usePasswordlessSend` /
  `usePasswordlessVerify` hooks → `authService.passwordless.*`.
- **Admin federation screens** (JWKS, OIDC client CRUD, SAML config, SSF) are routed via
  `createAdminRoute` and reachable behind `AdminRoute` guards.

---

## 7. Go / No-Go checklist

```
[ ] P0-1  Release branch clean — WIP refactors landed or shelved, git status clean
[ ] P0-2  CI pipeline green and merge-blocking (type-check, build, lint, unit, e2e, circular)
[ ] P0-3  auth.service.test.ts EventBus tests: fixed or removed; full unit suite green
[ ] P0-4  Playwright e2e suite green against a live, seeded AdonisJS backend
[ ] P0-5  dashboard / landing / theme / widget-studio / platform-core / backend audited
[ ] P0-6  Third-party pen test passed; threat-model workshop complete; findings remediated
[ ] P0-7  Prod env verified: VITE_API_URL https, VITE_STORAGE_ENCRYPTION_KEY set,
          cookie flags (HttpOnly/Secure/SameSite), CORS/CSP headers, token lifecycle
[ ] P1    P1-1..P1-7 fixed, or risk-accepted in writing by the security owner
[ ] ----  Load / smoke test of the tenant-resolution path under concurrency
[ ] ----  Rollback plan rehearsed; on-call and incident runbook in place
```

**Launch requires every P0 checked.** P1 items may be waived only with a written,
signed risk acceptance from the security owner.

---

## 8. Suggested sequence

| Phase | Work | Rough effort |
|---|---|---|
| 1 | P0-1 (branch), P0-2 (CI), P0-3 (fix tests) | 1–2 days |
| 2 | P0-4 (E2E against backend, triage failures) | 1–2 days |
| 3 | P0-5 (audit remaining modules + backend), fix what it finds | 3–5 days |
| 4 | P0-7 (env/config verification), P1-1..P1-7 | 2–3 days |
| 5 | P0-6 (external pen test — lead time varies), remediation | 1–3 weeks elapsed |
| 6 | P2 items, observability, runbooks | ongoing / first patch |

Phases 1–4 are internal and can overlap. Phase 5 (external audit) has the longest lead
time — **start procurement now**, in parallel with Phase 1.

---

## 9. Appendix — fixes applied during this review session

For traceability. All within `packages/modules/auth`.

| Finding | Files | Change |
|---|---|---|
| 14 TypeScript errors in `identity-broker` | `useProvisioningQuery.ts`, `useOidcCompliance.ts`, `oidc.service.ts`, `oidc.types.ts`, `PermissionConsentScreen.tsx`, `SCIMConfiguration.tsx`, `useOidcCompliance.test.ts` | TanStack v5 4-arg `onSuccess` signature; added `OIDCRedirectResult`; `client.clientName`; `SCIMConnectionTestResponse.success`; `CreateSCIMTokenDTO.name`; valid SAML DTO in test |
| Legacy `setTimeout` mock screens | `LoginScreen.tsx`, `AdminLoginScreen.tsx` (already deleted); `RegistrationScreen.tsx` | `RegistrationScreen` removed; `/auth/register` repointed to `SignUp`; barrel + route cleaned |
| **HIGH** — `InitiateEmailChange` (user-directory) fake submit | `screens/settings/InitiateEmailChange.tsx` | Wired to `useChangeEmail` → `POST /api/user/change-email`; removed `as any`, fake email fallback |
| **HIGH** — `PasskeyLoginOption` non-functional | `screens/passkey/PasskeyLoginOption.tsx`, `mfa-orchestrator/routes/routes.tsx` | Wired to `usePasskey().loginWithPasskey` (real WebAuthn); sets session; added error UI; wrapped route in `GuestRoute` |
| **MED** — `EmailChangeStatusDashboard` fake resend | `screens/settings/EmailChangeStatusDashboard.tsx` | Resend wired to `useRequestEmailChange`; cancel no longer claims server-side effect |
| **MED** — client-only "GDPR export" | `screens/profile/profile.tsx`, `screens/settings/DeleteAccount.tsx` | Replaced client-side JSON blob with `useExportMutation` → `POST /api/gdpr/export` + redirect to Data Export page |
| **MED** — mocked AI widget (dead code) | `authorization-engine/components/AIChatWidget.tsx` | Deleted |
| **MED** — rotted test suite | `identity-broker/hooks/useOidcCompliance.test.ts` | Fixed `vi.mock` targets and stale key assertions; 8/16 → 16/16 |
| **LOW** — `console.*` in prod paths | `SignOutButton.tsx`, `useSessionGuard.ts`, `form/ChangeAccount.tsx`, `form/ChangeEmail.tsx` | Removed; error path routed through `logger` util |
| **LOW** — stale `@cap/module-admin` comments | `index.ts`, `authorization-engine/screens/index.ts`, `user-directory/screens/admin/organizations/index.ts` | Corrected/removed (that package never existed) |
| **LOW** — `routes: authRouteConfig as any` | `src/index.ts` | Removed the cast (types were already identical) |
| **LOW** — hardcoded dev redirect URI | `platform-cluster/screens/developer/ApplicationDashboard.tsx` | Derived from `window.location.origin` |

**Post-session state:** `tsc --noEmit` on `@cap/module-auth` = 0 errors; unit suite =
221 passed / 3 pre-existing failures (P0-3).
