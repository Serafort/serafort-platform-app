---
name: verify-module-backend-wiring
description: Audit one or more @cap/module-auth submodules (packages/modules/auth/src/modules/*) for real backend wiring against the Serafort Authentication service (C:\Node.Js\proj\Authentication), fix any endpoint mismatches, and fill in missing i18n dictionary keys. Use when asked to "wire a module to the backend", check that endpoints are up to date, or fix missing translations in this module.
---

# Verify a module is wired to the Authentication backend

This repo (`@cap/monorepo`, the frontend) talks to a separate AdonisJS 6
service at `C:\Node.Js\proj\Authentication`. Frontend modules live at
`packages/modules/auth/src/modules/<name>/` (e.g. `user-directory`,
`authentication-core`, `identity-broker`, `mfa-orchestrator`,
`session-manager`, `platform-cluster`, `authorization-engine`,
`access-control`, `passwordless-service`, `developer-console`). Each has its
own `services/*.ts`, `hooks/*.ts`, `screens/`, `components/`, and
`data/dictionaries/{en,fr,ar}.json`.

"Wired to the backend" means: every `apiClient.*` call resolves to a route
that actually exists in the Authentication service, uses the right HTTP verb,
sends the fields the backend's validator accepts, and the response is
unwrapped/normalized to match what the backend controller actually returns —
not what looks plausible.

Do this per module, one at a time. Don't batch edits across modules without
verifying each independently — they have unrelated backend surfaces.

## Step 1 — Inventory the module's service calls

```bash
grep -rn "apiClient\.\(get\|post\|put\|patch\|delete\)" packages/modules/auth/src/modules/<name>/services
```

For each call, note the URL (or `ENDPOINTS.*` builder), verb, and the shape
the calling code assumes the response has.

**Prefer `ENDPOINTS`, never hand-write paths.** The single source of truth for
every backend URL is `packages/api-contracts/src/endpoints.ts`
(`export const API_ENDPOINTS`, re-exported as `ENDPOINTS` from
`@cap/platform-core`). If a service file has inline string paths instead of
`ENDPOINTS.foo.bar`, that's already a smell — check whether an `ENDPOINTS`
entry exists for that path and switch to it. This registry is generally
already correct and kept in sync with the backend; hand-written path strings
in a service file are what drift.

A recurring anti-pattern found in `user-directory`'s original
`userDirectory.service.ts` was a "try `/api/v1/user-directory/...`, catch and
fall back to `/api/admin/...`" wrapper. The v1 path was invented and never
existed server-side, so the primary attempt failed on every single call — pure
overhead and noise. If you find this shape, delete the guessed primary path
and call the real endpoint directly.

## Step 2 — Cross-reference against the real backend

The backend route table is `C:\Node.Js\proj\Authentication\start\routes.ts`
(~2700 lines — grep it, don't read it all). For any endpoint whose existence
or shape you're unsure of, read the actual controller in
`C:\Node.Js\proj\Authentication\app\controllers\...` and the Lucid model(s) it
touches in `app\models\...`. Trust the controller's code over the route's
name or any doc comment — read what it actually does with the request and
what it actually returns.

Things that commonly don't match a frontend's assumption:

- **A "list" endpoint most likely returns AdonisJS's `.paginate()` shape**:
  `{ data: [...], meta: { total, perPage, currentPage, lastPage, firstPage,
  ... } }`. A single-resource `show`/`update`/`store` endpoint usually returns
  the model's `.serialize()` output **flat**, not wrapped in `{ data }`.
- **Every JSON response body is passed through
  `app/middleware/camel_case_response_middleware.ts`**, which recursively
  converts snake_case keys to camelCase — including raw `db.from(...).select(...)`
  query results that bypass Lucid models. So a controller doing
  `.select('created_at')` on a raw query still arrives at the frontend as
  `createdAt`. **This does not apply to request query parameters** — those are
  read verbatim by `request.input('some_param')`, so if the controller reads
  `user_id`, the frontend must send `?user_id=`, not `?userId=`.
  Check the specific controller method for the literal string passed to
  `request.input(...)`.
  a. `AdminUsersController.getUserActivityLogs` (the mirror of
     `/api/admin/audit-logs`) is a confirmed example: it reads `user_id`, not
     `userId`.
- **A model's serializer can rename or drop fields.** e.g. `User.serialize()`
  (`app/models/auth/user.ts`) exposes `firstName`/`lastName`/`name` (not the
  underlying `firstname`/`lastname` columns), a computed `mfaEnabled`, and
  only includes `role`/`profile`/`organizationMembers` if the controller
  explicitly `.preload()`ed them — a `findOrFail()` with no preloads gives you
  none of those nested objects even though `index()` on the same model
  might preload them. Check preloads per-method, not per-model.
- **A model may not have the column the frontend DTO assumes.** Check the
  model file directly (`declare xyz: ...`) rather than trusting a DTO/type
  file — DTOs in this codebase are sometimes aspirational and get ahead of
  the schema. When a field genuinely has no backing column anywhere (checked
  the model AND any related model, e.g. `Profile` for a `User`), don't
  fabricate a value or silently pass it in the request body hoping the
  backend uses it — the validator will just drop it. Either wire it to the
  real related column if one exists (e.g. `Profile.company` /
  `.location` / `.website` / `.biography` for a "company" field the `User`
  model itself lacks), or leave it out and say so in a code comment only if
  the omission is non-obvious.
- **Validators (`app/validators/*.ts`, built with `vine.compile`) are the
  actual allow-list for what a `PUT`/`PATCH`/`POST` accepts.** A field the
  frontend sends that isn't in the validator's `vine.object({...})` is
  silently dropped, not an error. Read the validator, not just the
  controller, before assuming a field round-trips.
- **A model's relationship cardinality may be narrower than the DTO
  suggests.** e.g. `User` has exactly one `roleId` (a `belongsTo`, not a
  pivot table) — there is no multi-role assignment for a platform user, even
  though several admin screens render a multi-select "Assigned Roles" field.
  When you find this mismatch, don't rebuild the UI's multi-select; take
  `roleIds[0]` (or equivalent "first selection") in the service layer and
  say so in a comment, unless the user has asked for the UI to change too.
- **A bulk-action endpoint may only support a subset of the actions the
  frontend offers.** `POST /api/admin/users/bulk`
  (`AdminUsersController.bulkAction`) only understands
  `activate|deactivate|ban|restore|reset-mfa` — there is no bulk `suspend` or
  bulk `delete`. For actions the bulk endpoint doesn't support, fall back to
  `Promise.allSettled` over the equivalent single-item endpoint, not to
  silently sending an action string the backend will reject.
- **A status enum on the frontend may not exist as a real backend state.**
  e.g. the directory's `UserStatus` includes `BANNED`, but
  `UserService.deactivateUser`/`suspendUser`/`activateUser`
  (`app/services/auth/user_service.ts`) only ever write `ACTIVE`, `PENDING`,
  or `SUSPENDED` to `users.status` — `PATCH /:id/ban` is a route alias for the
  same `suspend()` controller method, not a distinct status. Map the
  frontend's aspirational states onto what the backend actually persists
  (e.g. treat `PENDING` as the directory's "inactive", and route a `BANNED`
  status change through the `ban` alias) rather than sending a status value
  the validator's enum will reject.

## Step 3 — Fix and verify

- Rewrite the service functions to hit the real endpoint/verb/params, using
  `ENDPOINTS.*` builders.
- Normalize the response with a small mapper function if the backend's raw
  shape differs from the DTO — keep the DTO as the UI-facing contract, don't
  change every screen that consumes it.
- If (and only if) the backend is genuinely missing a small, clearly-scoped
  capability the UI needs (e.g. an update endpoint's validator is missing an
  existing column the UI already collects), it is acceptable to extend the
  **validator and controller** in `C:\Node.Js\proj\Authentication` minimally —
  additive, no migration, mirroring an existing sibling field's handling in
  the same controller. Do not add new database columns/migrations without
  asking first; that's a materially bigger, riskier change than "wiring".
- After any backend edit, run `cd C:\Node.Js\proj\Authentication && npm run
  typecheck` — this codebase has a lot of *pre-existing* unrelated type
  errors (check with `git status`/`git diff` first; do not assume errors you
  see are yours). Confirm no *new* errors appear at the lines/files you
  touched.
- After any frontend edit, run
  `pnpm --filter @cap/module-auth run type-check` from the `boilerplate` root.
- If you can, boot the backend (`cd C:\Node.Js\proj\Authentication && npm run
  dev`, needs the `auth-postgres` and `auth-redis` Docker containers running —
  check `docker ps -a` and `docker start <name>` as needed) and confirm it
  boots without a crash after your change (HMR reload succeeding is a good
  signal). Full end-to-end login-and-click-through may not be possible if an
  unrelated part of the backend is mid-refactor and already broken — if so,
  say that plainly rather than silently skipping verification or claiming it
  passed.
- **Before running `git stash` anywhere in the Authentication repo, run
  `git status` first.** It is a separate, independently-versioned repo that
  may already carry a large amount of unrelated uncommitted work-in-progress
  (this has been observed firsthand: a multi-hundred-file uncommitted diff
  from an in-progress branch). A blind `git stash` stashes *all* of it, not
  just your edit, and popping it back can conflict with anything regenerated
  in between (e.g. `.adonisjs/server/routes.d.ts`, which AdonisJS
  regenerates on typecheck/build — safe to discard and let regenerate,
  distinct from anything hand-written). Prefer `git diff -- <file>` /
  `git stash -- <file>` scoped to just the files you're touching, or avoid
  stashing entirely and just re-read the file before/after.

## Step 4 — Fill in missing i18n

Each module's own dictionaries can be structurally very out of sync with each
other — in `user-directory`, `en.json` had roughly a third of the keys that
`fr.json`/`ar.json` had, because whole sections (organization admin, domain
verification, linked accounts) were only ever translated into French/Arabic
and never written back into English, while other sections existed only in
French/Arabic and were never used anywhere in this module's own code (likely
copied from a shared/sibling dictionary) — those extras are not this
module's problem to fill in on the other side; only add what the code
actually references.

**The only correct source of "missing" is what the module's own code calls**,
not a structural diff between locale files. Compute it:

1. Extract every `t('some.key', 'default text')` call from the module's own
   `.tsx`/`.ts` files (a call with a namespaced dotted key — skip bare
   single-word keys like `t('edit')`, which usually belong to a different
   i18n namespace entirely and aren't part of this module's own dictionary).
   A `node -e` one-off script with a regex like
   `/\bt\(\s*['"]([a-zA-Z0-9_.]+)['"]\s*(?:,\s*['"]([^'"]*)['"])?/g` walking
   the module's files is the fastest way; capture the key and, if present,
   its literal string default (a *template literal* default, e.g.
   `` `Connect ${x}` ``, will not match a plain quote-based regex — check for
   those calls separately, see the interpolation note below).
2. Flatten each of `en.json`/`fr.json`/`ar.json` into dotted paths and diff
   against the extracted key list. A key missing from **all three** needs a
   real English string (usually the code's own default value) plus real
   French and Arabic translations you write — not the same text copy-pasted
   across locales, and not machine-placeholder text. A key missing from
   **only one locale** (commonly English, since French/Arabic sections can be
   fuller) needs just that locale's text, back-derived from the other two if
   no code default exists.
3. Apply the additions with a small script that deep-sets each dotted path
   into the parsed JSON object and re-serializes with
   `JSON.stringify(obj, null, 2) + '\n'` — this preserves existing key order
   and only adds trailing commas where a new sibling key was appended, so the
   diff stays minimal and reviewable. Don't hand-edit hundreds of JSON lines
   directly; script it, then spot-check the diff.
4. Re-run the extraction+diff after applying to confirm zero remaining gaps
   (all three counts — missing-from-all, missing-from-one, and "missing
   somewhere with no code default" — should be zero).

**Dynamic strings** (a `t()` default value built from a JS template literal,
e.g. `` t('key', `Connect ${provider.name}`) ``) are only really translatable
if rewritten to i18next's own interpolation: `t('key', 'Connect {{provider}}',
{ provider: provider.name })`. If you find one, add the dictionary entry using
`{{placeholder}}` syntax in all three locales, then edit the call site to
match — leaving it as a raw template literal means non-English locales will
always render in English regardless of dictionary content, which is a real
(if quiet) i18n bug, not a false positive to ignore.

## Step 5 — Report

Summarize per module: which service calls were pointed at the wrong endpoint
and what they now hit, any backend validator/controller changes made (with
the exact file/lines), and the i18n key counts added per locale. Call out any
module where full endpoint verification wasn't possible (e.g. no equivalent
backend route exists at all and extending the backend was out of scope) so
the person asking knows what's still aspirational versus real.
