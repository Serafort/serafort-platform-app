---
name: audit-page-data
description: Test a Serafort screen end to end against the real backend and database, find every value that is empty, wrong, or duplicated, trace each one to its root cause (frontend hook, endpoint, controller, SQL, seed data, migration), fix it, and re-verify in the running app. Use when the user says a page "shows empty / 0 / wrong numbers but the database has data", asks to "test and fix this page", "analyze this screen and fix missing things", or shares a screenshot of a dashboard/overview whose cards or lists look wrong.
---

# Audit a page's data and fix it

The frontend (`@cap/monorepo`, this repo) talks to the AdonisJS service at
`C:\Node.Js\proj\Authentication` through the Vite proxy (`/api` → `:3333`).
A wrong number on screen can come from any layer. **Never guess the layer**:
capture what the page shows, what the API returned, and what the database
holds, and compare all three.

Work on one page at a time. Tools in this folder:

| Tool | What it does |
|---|---|
| `audit-page.mjs <route> --out <dir> [--reload] [--follow]` | Real login, then records visible text, every `/api/*` response (shape summary, secrets redacted), console errors, screenshots. `--follow` opens every in-page link so cards can be compared with their detail screens. Writes `report.md` + `report.json`. |
| `db.mjs "<sql>" [--email e] [--as-app]` | **Read-only** SQL (`BEGIN READ ONLY … ROLLBACK`). `:uid` = the id of `--email`. `--as-app` connects as the app's restricted role. |
| `db.mjs --preset whose\|rls\|columns <table>` | Who owns the rows · RLS flags and policies · real column list. |

Put outputs in the session scratchpad, not the repo. In Git Bash prefix calls
with `MSYS_NO_PATHCONV=1`.

## Step 0 — Preconditions

```bash
netstat -ano | grep LISTENING | grep -E ':(5173|3333) '
```

Both must be up; if not, start them (`run-serafort-app` skill for Vite;
`node ace serve --hmr` in the backend). The backend runs with HMR, so
controller edits hot-reload. If a service-level edit doesn't seem to take, ask
the user before restarting their server.

## Step 1 — Capture

```bash
node .claude/skills/audit-page-data/audit-page.mjs /auth/account --out "$SCRATCH/audit" --reload --follow
```

`--follow` is side-effect free by design: links that look like actions
(`setup`, `delete`, `revoke`, `add`, …) are skipped, and every non-GET API call
is aborted while following (only `/auth/refresh` passes). The report lists
both. Never loosen this to reach a screen: open that one route directly and
say it may write.

Expected noise on every load (not bugs): `404 /api/v1/themes/tenant?orgId=current`,
then `401 /api/v1/auth/me` → `200 /auth/refresh` → `200 /auth/me` (the app's
normal token bootstrap).

Read `report.md` and open the screenshots. For every card, count, list and
status on the page, fill in a row:

| UI element | Shown | API call + returned shape | Detail screen shows | Suspicious? |

Flag anything that is: empty or 0 when data should exist · identical to another
card (two cards reading the same source) · different from the detail screen the
card links to · non-2xx · a console error.

## Step 2 — Trace each suspicious value to its source

Orient with graphify first (`graphify query "<question>"`) — this repo requires
it. Then follow the chain; don't stop at the first plausible layer:

1. **Screen** → which hook feeds the value, and how it normalizes the response
   (`raw.data`, `.accounts`, `.length`, a `?? 1` fallback…).
2. **Hook → service → `ENDPOINTS.*`** (`packages/api-contracts/src/endpoints.ts`).
3. **Route** → `grep` `C:\Node.Js\proj\Authentication\start\routes.ts` for the
   path; note the controller method.
4. **Controller** → read what it actually queries and returns. Trust the code,
   not the method name or doc comment.
5. **Which endpoint actually ran?** Check the API list in `report.md`. Several
   backend features have two implementations (e.g. `sign_in_controller` vs
   `api/v1/api_v1_auth_controller`). Patch the one the app really calls.

## Step 3 — Establish ground truth in the database

```bash
node .claude/skills/audit-page-data/db.mjs --preset whose passkey_credentials
node .claude/skills/audit-page-data/db.mjs "select count(*) from linked_accounts where user_id = :uid"
node .claude/skills/audit-page-data/db.mjs --preset rls passkey_credentials
node .claude/skills/audit-page-data/db.mjs "select ..." --as-app
cd C:/Node.Js/proj/Authentication && node ace migration:status | grep pending
```

"The database has data" is a claim to verify, not a conclusion. Ask:
**whose** rows are they · are they **visible to the app role** (RLS) · does the
table have the **columns the model writes** · is the controller's query
**filtering on the right column/predicate**.

## Known root causes in this codebase

Check these first; each one has happened.

| Symptom | Root cause | Where |
|---|---|---|
| Card empty; DB "has data" | Seed data attached to random factory users (`08_comprehensive_fake_data_seeder`), not the demo accounts | `--preset whose` |
| Two cards show the same number | Both count the same table; `auth_access_tokens` holds both the SPA's 15-min login tokens (`INTERNAL_SPA_TOKEN_NAME`) and real personal access tokens | controller query |
| Card ≠ its detail screen | Count endpoint uses a different predicate from the list endpoint; reuse the list's service (e.g. `sessionService.getList`) | `users_controller.securityStatus` |
| Activity/audit feed always empty | `AuditLogService.log` / `AuditService.log` **swallow errors**; an insert fails silently (a model column missing in the DB → pending migration) | `migration:status`, `--preset columns audit_logs` |
| Login never shows up in sessions/activity | The login path the SPA uses didn't call `sessionService.onSignInSuccess` / write an audit row | `api_v1_auth_controller.login`, `api_v1_mfa_controller.totpVerify` |
| Rows exist but the app sees none | RLS policy keyed on `app.current_tenant_id` / `organization_id`; you queried as superuser | `--preset rls`, re-run with `--as-app` |
| Card flashes 0, then fills | Tile's `valueLoading` doesn't cover the query feeding it | screen component |
| Value is right but reads wrong | Response shape drift (object vs scalar, `role` as record) — normalize in the screen, fix the type | hook / `api.types.ts` |

To find a swallowed error, reproduce the write yourself: run the same
`INSERT` **as the app role inside a transaction you roll back**, or call the
endpoint with `curl` and immediately query the table.

## Step 4 — Decide, then fix

- **Ask the user before** anything that writes data or schema: running
  pending migrations, changing or adding seed data, deleting rows. State what
  the change touches and whether it can be reverted (a migration's `down()`,
  how many rows a backfill updates). Read-only queries need no permission.
- If a value is **correct** (e.g. MFA really is off for this user), say so. Don't
  "fix" it into showing something else.
- Fix at the root: backend query/controller first, frontend only for real
  frontend bugs. Keep one constant for shared magic values (like the SPA token
  name) and reuse existing services rather than re-deriving predicates.
- New seed data goes in a **new idempotent seeder**
  (`database/seeders/NN_*.ts`, create only when the account has none), run with
  `node ace db:seed --files <file>`. Re-running the big fake-data seeder
  duplicates rows. Write audit rows through `AuditChainService.append` so the
  hash chain stays valid.
- Follow this repo's rules from `CLAUDE.md`: no `any`, i18n every string, MUI
  tokens, no PII/tokens in logs or audit metadata.

## Step 5 — Verify in the running app

1. Re-run `audit-page.mjs … --reload --follow` **with a fresh login** (login-time
   fixes only show on a new login). Every card must match its detail screen, all
   calls must be 2xx, and there must be no new console errors.
2. Re-query the DB to confirm writes (sessions, audit rows, row hashes present).
3. Tests and types, scoped to what you touched:
   - frontend: `pnpm --filter @cap/module-auth exec vitest run <area>`,
     `pnpm --filter @cap/module-auth run type-check`
   - backend: `node ace test --files <spec>`; `npx tsc --noEmit | grep <your files>`.
     The backend has many pre-existing type errors, so filter to your files and
     tell the user which failures were already there.
4. `graphify update .` in `boilerplate` after code edits.

## Report

Tell the user, per UI element: what it showed, why it was wrong (root cause
with file links), what changed, and what it shows now. State what was verified
in the browser versus only in tests. List anything you did to their database
(migrations run, seeders run), anything left unfixed, and pre-existing failures
you saw but didn't cause. Don't commit unless asked.
