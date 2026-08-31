# Production Readiness Runbook — Authentication & Boilerplate

**Scope:** `boilerplate/` monorepo (`@cap/app` + `@cap/module-auth` and its dependency packages) and the `Authentication/` AdonisJS backend it talks to.
**Companion docs:** [production-launch-readiness.md](production-launch-readiness.md) (gap analysis / verdict), [auth-audit.md](auth-audit.md) (module audit), [improvement-roadmap.md](improvement-roadmap.md) (architecture cleanup), [security-architecture.md](security-architecture.md) (mandated gates).
**Created:** 2026-08-31

---

## 0. How to use this document

Each step has: **Goal → Commands → Fix work → Acceptance → Owner → Estimate**.

- A step is **done** only when its Acceptance line is objectively true (a command exits `0`, a check is green, a document is signed).
- Phases 1–6 are internal and overlap. **Phase 7 (external pen test) has the longest lead time — kick it off on Day 0, in parallel with everything else.**
- Do not skip Phase 4. A light audit of one module previously surfaced two dead user-facing flows and a fake "GDPR export"; the base rate on unreviewed code here is high.
- "Green" everywhere means: run on a clean checkout of the release branch, Node ≥ 24, `pnpm@10.32.1`, with `pnpm install --frozen-lockfile` already run.

### Ownership legend

| Role | Responsible for |
|---|---|
| **FE** | Frontend / `@cap/app` + packages |
| **BE** | `Authentication/` AdonisJS service |
| **DevOps** | CI, environments, secrets, edge config |
| **SecOwner** | Security sign-off, pen-test vendor, risk acceptance |
| **QA** | E2E suite, load/smoke tests |

---

## 1. Current state snapshot (2026-08-31)

Verified against the working tree this date.

| Area | State | Evidence |
|---|---|---|
| Release branch | 🟢 `main` clean, hardening branch merged (PR #1, `24ac9a9`) | `git status` clean |
| `@cap/module-auth` type-check | 🟢 0 errors | prior session |
| MFA always-success mock | 🟢 removed — `verifyMfaCode` is a real `apiClient.post` | [mfa.service.ts:242](../packages/modules/auth/src/modules/mfa-orchestrator/services/mfa.service.ts#L242) |
| Demo credentials in sign-in | 🟢 gated behind `import.meta.env.DEV` | `useSignInFlow.ts` |
| Auth EventBus unit tests | 🟢 fixed (plan A2) | [ci.yml](../.github/workflows/ci.yml) baseline table |
| Multi-tenant `X-Tenant-Id` propagation | 🟢 wired FE + backend middleware | [production-launch-readiness.md](production-launch-readiness.md) §6 |
| RBAC fails closed | 🟢 `PermissionCheckerService` | [production-launch-readiness.md](production-launch-readiness.md) §6 |
| Circular deps | 🟢 0 cycles | `pnpm run lint:circular` |
| **CI pipeline** | 🔴 exists but every job except `circular` is `continue-on-error` and RED | [ci.yml](../.github/workflows/ci.yml) |
| **Monorepo type-check (all pkgs)** | 🔴 `module-landing` / `module-theme` errors | ci.yml baseline |
| **Lint (all pkgs)** | 🔴 ~5.9k prettier/CRLF + real issues in 7 pkgs | ci.yml baseline |
| **Build (`@cap/app`)** | 🔴 `tsc -b` unused-symbol errors in `module-auth`/`module-theme`/`theme` | ci.yml baseline |
| **Unit tests (all pkgs)** | 🔴 `api-contracts` (1) + `app` (2) + `module-theme` suite + `layout` unhandled | ci.yml baseline |
| **E2E vs. live backend** | 🔴 scaffold only; backend checkout + webServer paths not wired in CI | ci.yml baseline; [playwright.config.ts](../app/playwright.config.ts) |
| Non-auth modules audited | 🔴 `dashboard`, `landing`, `theme`, `widget-studio` not reviewed | [production-launch-readiness.md](production-launch-readiness.md) §2 |
| `Authentication/` backend audited | 🔴 only tenant middleware reviewed | [production-launch-readiness.md](production-launch-readiness.md) §2 |
| Third-party pen test / threat model | 🔴 no evidence | [security-architecture.md](security-architecture.md) |
| Prod env contract verified | 🔴 not confirmed against a real deploy | this doc §6 |
| `as any` density in `@cap/module-auth` | 🟡 ~230 occurrences | [production-launch-readiness.md](production-launch-readiness.md) §P1-1 |

**Verdict: NOT READY.** Internal work ≈ 6–10 working days. External pen test ≈ 2–4 weeks elapsed and is a hard gate.

---

## 2. Phase 0 — Prerequisites (Day 0, ~half day)

### Step 0.1 — Cut the release branch
- **Goal:** a single, stable target for all Phase 1–6 work.
- **Commands:**
  ```bash
  cd boilerplate
  git checkout main && git pull
  git checkout -b release/auth-v1
  git status            # must be clean
  pnpm install --frozen-lockfile
  ```
- **Acceptance:** `release/auth-v1` exists, `git status` clean, install succeeds with the committed lockfile.
- **Owner:** DevOps · **Est:** 15 min

### Step 0.2 — Freeze scope
- **Goal:** no new features land on `release/auth-v1`. Only fixes traceable to a step in this runbook or a filed ticket.
- **Fix work:** announce the freeze; branch-protect `release/auth-v1` (see Step 2.3).
- **Acceptance:** written freeze notice; branch protection on.
- **Owner:** DevOps + Eng lead · **Est:** 30 min

### Step 0.3 — Start external pen-test procurement (do not wait)
- **Goal:** vendor engaged now so Phase 7 is not the critical path.
- **Fix work:** see Phase 7, Step 7.1 — send the RFP today.
- **Acceptance:** vendor shortlist contacted; SOW in draft.
- **Owner:** SecOwner · **Est:** 2 h to send; days to contract

### Step 0.4 — Stand up a staging environment
- **Goal:** a production-shaped target for E2E, smoke, load, and pen testing — never localhost.
- **Fix work:**
  - Deploy `Authentication/` to staging (its own DB, Redis, secrets).
  - Deploy `@cap/app` static build to the same edge platform intended for prod (Netlify / Cloudflare Pages / etc. so `app/public/_headers` is honoured).
  - Wire real DNS + TLS.
- **Acceptance:** `https://staging.<domain>` serves the app; `https://api.staging.<domain>/health` returns 200; `_headers` visible in the response.
- **Owner:** DevOps · **Est:** 1 day (can overlap Phase 1)

---

## 3. Phase 1 — Get the tree green (Days 1–3)

Run every sub-step from `boilerplate/`. Fix, commit in coherent units, re-run. The CI file's own baseline table names the culprits — use it as the checklist.

### Step 1.1 — Monorepo type-check
- **Goal:** `pnpm -r run type-check` exits `0` across all 14 packages.
- **Command:**
  ```bash
  pnpm -r run type-check
  ```
- **Fix work (known offenders):**
  - `packages/modules/landing` — `tsconfig` pulls in `@cap/module-auth` internals; narrow its `tsconfig` `include`/`references` so it only sees public entrypoints (plan A5).
  - `packages/modules/theme` — 3× `TS2554` (wrong arg count) in `useThemeQuery` types (plan A5/B3).
  - Do **not** silence with `// @ts-expect-error` or `as any`; fix the contract.
- **Acceptance:** command exits `0`; no package prints errors.
- **Owner:** FE · **Est:** 1 day

### Step 1.2 — Lint + formatting + line endings
- **Goal:** `pnpm -r run lint` exits `0`.
- **Commands:**
  ```bash
  # one-time EOL normalisation
  git config core.autocrlf false
  # ensure .gitattributes enforces LF for code
  printf '* text=auto eol=lf\n' >> .gitattributes   # if not already present
  pnpm -w exec prettier --write "**/*.{ts,tsx,js,cjs,json,md,yml,yaml}"
  git add --renormalize .
  pnpm -r run lint
  ```
- **Fix work:**
  - The ~5.9k errors are overwhelmingly `prettier/prettier` CRLF — the renormalise above clears them.
  - Then triage the **real** lint issues remaining in the 7 flagged packages (unused vars, `no-explicit-any` in new code, missing hook deps). Fix, don't disable rules repo-wide.
  - Land the EOL commit **first and alone** so the diff is reviewable.
- **Acceptance:** `pnpm -r run lint` exits `0`; `.gitattributes` enforces `eol=lf`.
- **Owner:** FE · **Est:** 0.5–1 day

### Step 1.3 — Production build
- **Goal:** `pnpm --filter @cap/app run build` (`tsc -b && vite build`) exits `0`.
- **Command:**
  ```bash
  pnpm --filter @cap/app run build
  ```
- **Fix work:** `TS6133` unused symbols in `module-auth`, `module-theme`, `theme` — delete the dead imports/locals (they are leftovers from the hardening refactor). This unblocks after Step 1.1.
- **Acceptance:** build exits `0`; `app/dist/` produced; no `tsc -b` errors.
- **Owner:** FE · **Est:** 2–4 h

### Step 1.4 — Unit tests
- **Goal:** `pnpm -r run test` exits `0`.
- **Command:**
  ```bash
  pnpm -r run test
  ```
- **Fix work — per failing suite:**
  | Suite | Action |
  |---|---|
  | `packages/api-contracts` (1 fail) | triage; fix or delete if asserting removed behavior |
  | `@cap/app` (2 fails) | triage; likely env-dependent — see `VITE_STORAGE_ENCRYPTION_KEY` note below |
  | `packages/modules/theme` (whole suite) | fix after Step 1.1 lands the `useThemeQuery` types |
  | `packages/layout` (unhandled rejection) | add the missing `await`/`act()` or mock; unhandled rejections fail CI |
  - Ensure test env sets `VITE_STORAGE_ENCRYPTION_KEY` (a 32-byte hex) and `VITE_API_URL` — a missing key previously threw across a whole file via `emitGlobalNotification`. Put them in `app/vitest.setup.ts` / `.env.test`.
- **Acceptance:** `pnpm -r run test` exits `0`; **zero** unhandled rejections in output.
- **Owner:** FE · **Est:** 1 day

### Step 1.5 — Circular dependencies (already green — keep it)
- **Command:**
  ```bash
  pnpm run lint:circular
  ```
- **Acceptance:** `0` circular dependencies (currently true).
- **Owner:** FE · **Est:** 5 min (verify only)

### Step 1.6 — Dependency / CVE audit
- **Goal:** no known high/critical CVEs shipped.
- **Command:**
  ```bash
  pnpm run audit:ci          # pnpm audit --audit-level=high
  ```
- **Fix work:** upgrade or `pnpm.overrides`-pin vulnerable transitive deps; document any accepted advisory with justification.
- **Acceptance:** `audit:ci` exits `0`, or every remaining advisory has written risk acceptance from SecOwner.
- **Owner:** FE + SecOwner · **Est:** 2–4 h

---

## 4. Phase 2 — Make CI blocking (Day 3, ~2 h)

### Step 2.1 — Promote jobs to blocking
- **Goal:** [ci.yml](../.github/workflows/ci.yml) enforces every gate on every PR.
- **Fix work:** once Phase 1 is green on `release/auth-v1`, delete the `continue-on-error: true` line from each job: `type-check`, `lint`, `build`, `unit`, `e2e` (e2e after Phase 3). `circular` is already blocking.
- **Acceptance:** a PR that breaks any gate cannot be merged.
- **Owner:** DevOps · **Est:** 30 min

### Step 2.2 — Add a coverage gate
- **Goal:** prevent silent test-coverage regressions.
- **Fix work:** add a job running `pnpm --filter @cap/app run test:coverage` with a `vitest` `coverage.thresholds` floor (start at current measured %, ratchet up; target ≥ 80% per `CLAUDE.md`).
- **Acceptance:** coverage job present and blocking; threshold committed in `vitest.config`.
- **Owner:** FE + DevOps · **Est:** 2 h

### Step 2.3 — Branch protection
- **Goal:** `release/auth-v1` (and `main`) require green CI + review.
- **Fix work:** GitHub → Settings → Branches → require status checks (`type-check`, `lint`, `build`, `unit`, `circular`, `e2e`, `coverage`), require 1–2 reviews, no force-push, no self-merge for release branches.
- **Acceptance:** protection rules visible; a test PR is blocked until checks pass.
- **Owner:** DevOps · **Est:** 20 min

---

## 5. Phase 3 — E2E against the real backend (Days 3–5)

The suite in [app/e2e/](../app/e2e/) covers `signin`, `signup`, `mfa`, `passkey`, `session`, `password-reset`, `email-verification`, plus `auth.setup.ts`. All real authentication is the `Authentication/` service's job — nothing is validated until this runs green against it.

### Step 3.1 — Wire the backend into CI
- **Goal:** the `e2e` job checks out and runs `Authentication/` with MySQL + Redis service containers.
- **Fix work in [ci.yml](../.github/workflows/ci.yml):**
  - The job already declares `mysql:9.5` + `redis:7` services and a checkout of `Serafort/serafort-auth-service` into `Authentication/`. Provision the read-scoped PAT/deploy key as `secrets.AUTH_SERVICE_REPO_TOKEN` (plan B2).
  - Align the backend env with `Authentication/.env.test` (DB host/port/creds, `APP_KEY`, `VITE_API_URL=http://localhost:3333/api`).
  - Fix the `webServer` paths in [playwright.config.ts](../app/playwright.config.ts) — it hard-codes `cd ../../Authentication && npm run dev`; confirm that resolves in the CI checkout layout (backend at repo-root `Authentication/`, frontend is the workspace).
  - `node ace migration:run --force && node ace db:seed` before the suite.
- **Acceptance:** CI `e2e` job spins up both servers, migrates + seeds, runs Playwright, uploads the report artifact.
- **Owner:** DevOps + BE · **Est:** 1 day

### Step 3.2 — Run the full suite green
- **Goal:** every spec passes against a freshly-migrated, seeded backend (locally first, then CI).
- **Commands (local):**
  ```bash
  # terminal 1
  cd Authentication && cp .env.test .env && node ace migration:run --force && node ace db:seed && npm run dev
  # terminal 2
  cd boilerplate && pnpm --filter @cap/app run test:e2e
  ```
- **Fix work:** file a ticket per failure. Expect the silent-defect class here (screens that compile + render but call nothing / the wrong endpoint) — previously `InitiateEmailChange` and `PasskeyLoginOption` were only caught this way. Also verify the three duplicate sign-up screens (`SignUp`, `SignUpV2`, `/auth/register`) — pick one, redirect the rest (P1-3).
- **Acceptance:** `pnpm --filter @cap/app run test:e2e` exits `0` locally **and** in CI; zero `.only`, zero skipped auth specs.
- **Owner:** QA + FE · **Est:** 1–2 days

### Step 3.3 — Cross-browser
- **Goal:** chromium + firefox projects both green (config already defines them).
- **Acceptance:** both projects pass in CI.
- **Owner:** QA · **Est:** 2 h

---

## 6. Phase 4 — Audit the unreviewed surface (Days 4–9, parallel with Phase 3)

**Method for every target:** static read + `grep` for `setTimeout(` fake submits, `TODO`/`FIXME`/`mock`/`Simulate`, hardcoded hosts (`localhost`, `127.0.0.1`, `:3333`, `:5173`), hardcoded keys/secrets/JWKS, `as any` in `onError`/`onSuccess`/`catch`, unguarded `console.*` on prod paths, `window.alert`/`confirm`. Then `type-check` + `test` for that package.

### Step 4.1 — `packages/modules/dashboard`
- **Acceptance:** every screen calls a real hook/service; no fake timers; type-check + tests green; findings ticketed & fixed or risk-accepted.
- **Owner:** FE · **Est:** 0.5 day

### Step 4.2 — `packages/modules/landing`
- **Acceptance:** as 4.1; plus its `tsconfig` no longer reaches into `@cap/module-auth` internals (ties to Step 1.1).
- **Owner:** FE · **Est:** 0.5 day

### Step 4.3 — `packages/modules/theme` + `packages/theme`
- **Acceptance:** as 4.1; `useThemeQuery` types fixed; `mergeDeep` in `mergeTheme.ts` proven used (with a test) or removed.
- **Owner:** FE · **Est:** 0.5 day

### Step 4.4 — `packages/modules/widget-studio` (AI integration — highest risk)
- **Goal:** the Gemini / OpenRouter integration is safe to expose.
- **Checks:**
  - No API keys in client bundle or committed env — keys must be server-proxied.
  - Prompt-injection surface: user input never concatenated into a system prompt without guarding; output rendered safely (no `dangerouslySetInnerHTML` on model output).
  - Cost bounds: request size/rate caps, model allow-list, per-tenant quota.
  - No unbounded retries / loops.
- **Acceptance:** keys server-side only; input/output sanitised; rate + cost caps in place; type-check + tests green.
- **Owner:** FE + BE + SecOwner · **Est:** 1 day

### Step 4.5 — `packages/platform-core` + `packages/platform-store`
- **Goal:** assembly, config resolution, storage obfuscation, SSE, and the API client are sound.
- **Checks:**
  - [api.client.ts](../packages/platform-store/src/services/api/api.client.ts) already throws on unset / non-HTTPS `VITE_API_URL` in prod — keep that; confirm the shared-worker client (`api.shared-worker.ts`) has the same guard and the same `X-Tenant-Id` attachment.
  - `VITE_STORAGE_ENCRYPTION_KEY` is offline-cache obfuscation only (it is inlined into the bundle — see `app/.env.example`); confirm nothing treats it as real crypto, and it is per-environment + rotated.
  - Tenant context stays in sync across login / logout / switch / impersonation.
- **Acceptance:** guards confirmed on both clients; no secret misuse; type-check + tests green.
- **Owner:** FE · **Est:** 0.5 day

### Step 4.6 — `@cap/module-auth` residual items (from [auth-audit.md](auth-audit.md) / P1)
- `UserActivityTimeline.tsx` — wire to `useActivityTimeline` or remove (currently hardcoded 5 fake rows).
- `SAMLConfigDashboard.tsx` / `SSFConfiguration.tsx` — replace hardcoded fake signing keys / JWKS URL with real data flows before exposing federation admin UI.
- `identity-broker` test files (`useSAMLQuery`, `useJWKSQuery`, `useSCIMQuery`, `useSSFQuery`, `useProvisioningQuery`) — audit for the "mocks the wrong module" pattern that rotted `useOidcCompliance.test.ts`.
- `PermissionCheckerService` — fail closed when a non-super-admin carries a tenant/org target but has no resolved `tenantId`; prefer real permission records over synthesising `${resource}:*` from a role string ([authorization.service.ts](../packages/modules/auth/src/modules/authorization-engine/src/services/authorization.service.ts) ~L194–231).
- `EmailChangeStatusDashboard` "Cancel Request" — needs a real `DELETE /api/user/change-email/:id` endpoint + wiring (P2, can be first-patch).
- i18n coverage check for hardcoded English in `user-directory` screens.
- **Acceptance:** each item fixed, ticketed-as-P2, or risk-accepted in writing.
- **Owner:** FE · **Est:** 1–2 days

### Step 4.7 — `Authentication/` backend full review
- **Goal:** the service that performs all authentication is audited.
- **Checks:**
  - **AuthN:** password hashing (argon2id params), login throttling / lockout, credential-stuffing protection, timing-safe compares.
  - **AuthZ:** every protected route has a guard; tenant/org membership enforced server-side on every tenant-scoped query (not just middleware resolution); no IDOR on `:id` params.
  - **Sessions/tokens:** refresh-token **rotation** + reuse detection; logout revokes server-side; access-token TTL short; `tid` claim generated and validated.
  - **Cookies:** `HttpOnly`, `Secure`, `SameSite=Lax|Strict` on all session/refresh cookies.
  - **Input validation:** VineJS/validator on every request body; no raw query string interpolation; ORM parameterised throughout.
  - **Secrets:** `APP_KEY` and all secrets from env/secret-manager, never committed; check `Authentication/.env` is git-ignored and not in history.
  - **Rate limiting:** global + per-route on auth endpoints, password reset, email verification, MFA verify, passkey challenge.
  - **CSPRNG:** all tokens/reset codes/step-up tokens from `node:crypto` (a prior finding: synced-user passwords were `Math.random()` — see [.jules/sentinel.md](../.jules/sentinel.md)). Grep the whole backend for `Math.random`.
  - **CORS:** explicit origin allow-list (staging + prod), `credentials: true`, no `*`.
  - **Logging:** no secrets/tokens/PII in logs; audit trail for auth decisions.
  - **GDPR:** `POST /api/gdpr/export` actually produces a server-generated export (the frontend now calls it — confirm the backend honours it and doesn't leak cross-tenant data).
- **Commands:**
  ```bash
  cd Authentication
  grep -rn "Math.random" app/
  git log --all -p -- .env .env.production 2>/dev/null | head   # secrets in history?
  node ace list:routes                                           # enumerate + check guards
  npm test
  ```
- **Acceptance:** written audit note per check; all HIGH/CRITICAL fixed; `npm test` green; no `Math.random` on credential paths; no secrets in git history.
- **Owner:** BE + SecOwner · **Est:** 2–3 days

---

## 7. Phase 5 — Production environment & config hardening (Days 8–10)

### Step 5.1 — Frontend env contract
- **Goal:** the prod build fails safe if misconfigured.
- **Checklist (per environment):**
  | Var | Requirement |
  |---|---|
  | `VITE_API_URL` | set, **HTTPS**, points at the prod API origin (client already throws otherwise) |
  | `VITE_API_PREFIX` | matches backend (`/api`) |
  | `VITE_STORAGE_ENCRYPTION_KEY` | 32-byte hex, **unique per environment**, rotated, stored in secret manager |
  | `VITE_TENANT_ID` | correct default tenant |
  | `VITE_DEV_LOGIN_EMAIL` / `_PASSWORD` | **blank / absent** in prod (compiled out, but verify) |
  | `NODE_ENV` | `production` |
- **Command:**
  ```bash
  pnpm --filter @cap/app run build
  grep -rE "admin@example|localhost:3333|127.0.0.1:5173|VITE_DEV_LOGIN" app/dist/ && echo "LEAK" || echo "clean"
  ```
- **Acceptance:** build succeeds only with valid values; `grep` over `app/dist/` finds no dev host, no demo creds, no dev-login vars.
- **Owner:** DevOps + FE · **Est:** 2 h

### Step 5.2 — Edge security headers
- **Goal:** `app/public/_headers` (or the platform equivalent) is actually served in prod.
- **Fix work:**
  - If the host is not Netlify/Cloudflare Pages, replicate the full header set (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP, CORP) in that platform's config.
  - Replace `connect-src 'self' https:` with the **explicit** API origin(s).
  - If the anti-FOUC inline scripts in `index.html` can be externalised or hashed, drop `script-src 'unsafe-inline'`.
- **Command:**
  ```bash
  curl -sI https://staging.<domain>/ | grep -iE "content-security-policy|strict-transport|x-frame|x-content-type|referrer-policy|permissions-policy|cross-origin"
  ```
- **Acceptance:** every header present on a real staging response; `connect-src` is origin-specific; test at <https://securityheaders.com> scores A.
- **Owner:** DevOps · **Est:** 3 h

### Step 5.3 — Backend runtime config
- **Checklist:** TLS terminated with a valid cert; HSTS on the API too; cookie flags (Step 4.7) confirmed on live responses; CORS allow-list = staging + prod only; rate limiter backed by Redis (not in-memory) so it works across instances; DB connection pool sized; secrets from the secret manager.
- **Command:**
  ```bash
  curl -sI https://api.staging.<domain>/api/auth/session | grep -iE "set-cookie|strict-transport|access-control"
  ```
- **Acceptance:** `Set-Cookie` shows `HttpOnly; Secure; SameSite`; CORS echoes only allowed origins; HSTS present.
- **Owner:** BE + DevOps · **Est:** 3 h

### Step 5.4 — Token lifecycle end-to-end
- **Goal:** verify on staging, by hand + a spec:
  1. Login → access + refresh issued.
  2. Access token expires → silent refresh → new access token; **refresh token rotates**.
  3. Reuse of an old refresh token → session revoked, user forced to re-login (reuse detection).
  4. Logout → backend session gone; protected call 401; graceful redirect to sign-in.
- **Acceptance:** all 4 verified on staging; a Playwright spec covers 1, 2, 4.
- **Owner:** BE + QA · **Est:** 0.5 day

---

## 8. Phase 6 — Observability, rollback, runbooks (parallel, Days 4–10)

### Step 6.1 — Error + performance monitoring
- **Fix work:** wire Sentry (or equivalent) in `@cap/app` and `Authentication/`; propagate a request ID across FE → BE; dashboard auth-failure rate, 5xx rate, p95 latency.
- **Acceptance:** a thrown error in staging appears in the tool with request-ID correlation; auth-failure-rate alert configured.
- **Owner:** FE + BE + DevOps · **Est:** 1 day

### Step 6.2 — Performance budget
- **Commands:**
  ```bash
  pnpm --filter @cap/app run build:analyze
  pnpm --filter @cap/app run size          # size-limit
  pnpm --filter @cap/app run lighthouse:ci
  ```
- **Targets (`CLAUDE.md`):** initial load < 500 KB, Lighthouse > 90, build < 30 s.
- **Fix work:** confirm MUI is tree-shaken (per-path imports), routes are code-split, `manualChunks` effective.
- **Acceptance:** `size` passes its limits; Lighthouse CI ≥ 90 performance; numbers recorded in this doc.
- **Owner:** FE · **Est:** 0.5 day

### Step 6.3 — Rollback plan (rehearsed)
- **Fix work:** document + **practice** on staging: redeploy previous frontend build; roll back backend release; roll back / forward-fix a DB migration; feature-flag or config to disable a broken auth method (password / magic-link / passkey / SSO) without a full deploy.
- **Acceptance:** a dry-run rollback on staging completed and timed; steps written down.
- **Owner:** DevOps + BE · **Est:** 0.5 day

### Step 6.4 — Incident runbook
- **Contents:** how to reset a locked account; revoke all sessions for a user/tenant; rotate `VITE_STORAGE_ENCRYPTION_KEY` / `APP_KEY` / signing keys; disable a compromised OIDC/SAML client; on-call rota + escalation (Technical Lead → CTO; Security Architect → CISO per `CLAUDE.md`).
- **Acceptance:** runbook reviewed by on-call engineers; linked from the ops channel.
- **Owner:** DevOps + SecOwner · **Est:** 0.5 day

### Step 6.5 — Load / concurrency smoke of tenant resolution
- **Fix work:** k6/Artillery against staging: concurrent logins across multiple tenants; assert no cross-tenant data bleed, stable p95, rate limiter holds.
- **Acceptance:** target RPS sustained; zero cross-tenant leakage; error rate < 1%.
- **Owner:** QA + DevOps · **Est:** 0.5 day

---

## 9. Phase 7 — External security validation (start Day 0; ~2–4 weeks elapsed)

Mandated by [security-architecture.md](security-architecture.md) and `CLAUDE.md` ("third-party audit firm contracted", "penetration test pass rate: 100%", "threat-model workshop completed").

### Step 7.1 — Contract the vendor (Day 0)
- **Fix work:** send RFP/SOW: scope = `@cap/app` + `Authentication/` + tenant isolation + OIDC/SAML federation; grey-box; staging + source access; retest included.
- **Acceptance:** signed SOW; test window booked; staging + creds handed over.
- **Owner:** SecOwner · **Est:** 2 h + procurement lead time

### Step 7.2 — Threat-model workshop
- **Fix work:** run a STRIDE/attack-tree session on the auth + tenant model; record assets, trust boundaries, threats, mitigations, residual risk.
- **Acceptance:** threat-model doc committed to `analysis/`; action items ticketed.
- **Owner:** SecOwner + FE + BE · **Est:** 1 day

### Step 7.3 — OWASP Top 10 self-review (before the vendor starts)
- **Fix work:** walk ASVS L2 auth + session + access-control controls; fix the cheap wins so the pen test finds fewer criticals.
- **Acceptance:** checklist completed; criticals fixed.
- **Owner:** SecOwner + FE + BE · **Est:** 1 day

### Step 7.4 — Pen test + remediation + retest
- **Acceptance:** vendor's final report shows **zero** critical and **zero** high open; all remediations retested and confirmed by the vendor; report filed with SecOwner.
- **Owner:** SecOwner (all teams remediate) · **Est:** 1–2 weeks elapsed + remediation

---

## 10. Phase 8 — Go / No-Go

Launch requires **every box** checked. P1/P2 items may be waived only with a written, signed risk acceptance from SecOwner (template in Appendix C).

```
INTERNAL — ENGINEERING
[ ] 1.1  pnpm -r run type-check ......................... exit 0
[ ] 1.2  pnpm -r run lint .............................. exit 0 ; .gitattributes eol=lf
[ ] 1.3  pnpm --filter @cap/app run build .............. exit 0
[ ] 1.4  pnpm -r run test .............................. exit 0 ; 0 unhandled rejections
[ ] 1.5  pnpm run lint:circular ........................ 0 cycles
[ ] 1.6  pnpm run audit:ci ............................. exit 0 or signed acceptance
[ ] 2.1  CI: type-check/lint/build/unit/e2e all BLOCKING (no continue-on-error)
[ ] 2.2  Coverage gate present + blocking (floor committed)
[ ] 2.3  Branch protection on release/auth-v1 + main

E2E
[ ] 3.1  CI e2e job runs Authentication/ + MySQL + Redis, migrate + seed
[ ] 3.2  Full Playwright auth suite green locally AND in CI (0 skipped/only)
[ ] 3.3  chromium + firefox projects green

AUDITS (findings fixed or risk-accepted)
[ ] 4.1  dashboard        [ ] 4.2  landing        [ ] 4.3  theme/theme
[ ] 4.4  widget-studio (AI keys server-side, injection-safe, cost-capped)
[ ] 4.5  platform-core / platform-store (API-client guards, no secret misuse)
[ ] 4.6  module-auth residual (activity timeline, SAML/SSF fixtures, authz fail-closed)
[ ] 4.7  Authentication/ backend full review — 0 HIGH/CRIT open ; no Math.random on creds ; no secrets in history

PROD CONFIG
[ ] 5.1  Frontend env contract verified ; app/dist/ has no dev host / demo creds
[ ] 5.2  Edge security headers live on staging ; connect-src origin-specific ; securityheaders.com = A
[ ] 5.3  Backend TLS/HSTS ; cookies HttpOnly+Secure+SameSite ; CORS allow-list ; Redis-backed rate limit
[ ] 5.4  Token lifecycle (issue / rotate / reuse-detect / logout) verified on staging

OBSERVABILITY & OPS
[ ] 6.1  Error + perf monitoring live with request-ID correlation + auth-failure alert
[ ] 6.2  size-limit passes ; Lighthouse CI perf >= 90 ; build < 30s
[ ] 6.3  Rollback rehearsed on staging + documented
[ ] 6.4  Incident runbook reviewed by on-call
[ ] 6.5  Load/concurrency smoke: no cross-tenant bleed ; error rate < 1%

EXTERNAL SECURITY
[ ] 7.2  Threat-model workshop done ; doc committed
[ ] 7.3  OWASP ASVS L2 self-review done ; criticals fixed
[ ] 7.4  Pen test: 0 critical / 0 high open ; remediations retested by vendor

SIGN-OFF
[ ] SecOwner sign-off (security gates + accepted risks)
[ ] Eng lead sign-off (CI green on release/auth-v1, tag cut)
[ ] DevOps sign-off (prod env, secrets, rollback)
[ ] Product sign-off (scope)
```

---

## 11. Suggested schedule

| Day | Track A (FE) | Track B (BE/DevOps) | Track C (Sec) |
|---|---|---|---|
| 0 | Cut `release/auth-v1`, scope freeze | Stand up staging | **Send pen-test RFP**, book workshop |
| 1–2 | 1.1 type-check, 1.2 lint | Staging finish, CI backend wiring (3.1) | Threat-model workshop (7.2) |
| 3 | 1.3 build, 1.4 unit, 1.6 audit | 2.1–2.3 CI blocking + branch protection | OWASP self-review (7.3) |
| 4–5 | 3.2 E2E green, 4.1–4.3 module audits | 4.7 backend audit begins | — |
| 6–7 | 4.4 widget-studio, 4.5 platform-core, 4.6 module-auth | 4.7 backend audit finishes, 5.3 | (vendor engaged) |
| 8–9 | 5.1 env, 6.2 perf budget | 5.2 headers, 5.4 tokens, 6.1 monitoring | — |
| 10 | 4.6 residual cleanup | 6.3 rollback drill, 6.4 runbook, 6.5 load | — |
| ~2–4 wks | remediation | remediation | **7.4 pen test + retest** |
| after 7.4 | Phase 8 Go/No-Go | | |

Internal readiness (Phases 1–6): **~10 working days**. Gate to launch: **Phase 7.4 pass**.

---

## Appendix A — Command quick reference

```bash
# from boilerplate/
pnpm install --frozen-lockfile
pnpm -r run type-check
pnpm -r run lint
pnpm --filter @cap/app run build
pnpm -r run test
pnpm run lint:circular
pnpm run audit:ci
pnpm --filter @cap/app run test:e2e
pnpm --filter @cap/app run build:analyze
pnpm --filter @cap/app run size
pnpm --filter @cap/app run lighthouse:ci

# backend, from Authentication/
cp .env.test .env
node ace migration:run --force
node ace db:seed
node ace list:routes
npm test
```

## Appendix B — Key files

| File | Why it matters |
|---|---|
| [.github/workflows/ci.yml](../.github/workflows/ci.yml) | the gate; has an honest per-job baseline table |
| [app/playwright.config.ts](../app/playwright.config.ts) | E2E; hard-codes `../../Authentication` webServer path |
| [app/e2e/](../app/e2e/) | 8 auth specs + setup |
| [app/.env.example](../app/.env.example) | frontend env contract |
| [app/public/_headers](../app/public/_headers) | edge security headers (Netlify/CF format) |
| [packages/platform-store/src/services/api/api.client.ts](../packages/platform-store/src/services/api/api.client.ts) | throws on unset/non-HTTPS `VITE_API_URL` in prod |
| [packages/modules/auth/src/modules/authorization-engine/src/services/authorization.service.ts](../packages/modules/auth/src/modules/authorization-engine/src/services/authorization.service.ts) | RBAC; fail-closed soft spots ~L194–231 |
| [packages/modules/auth/src/modules/mfa-orchestrator/services/mfa.service.ts](../packages/modules/auth/src/modules/mfa-orchestrator/services/mfa.service.ts) | MFA/step-up; CSPRNG fallbacks |
| [.jules/sentinel.md](../.jules/sentinel.md) | prior security findings + learnings |

## Appendix C — Risk acceptance template

```
RISK ACCEPTANCE
ID:              RA-<n>
Runbook step:    <e.g. 4.6 — PermissionCheckerService tenantId fail-closed>
Description:     <what is not fixed>
Exploit / impact: <realistic worst case>
Compensating controls: <what limits it today>
Expiry:          <date — must be revisited / fixed by>
Accepted by:     <SecOwner name>  Date: <>
Countersigned:   <Eng lead>       Date: <>
```
