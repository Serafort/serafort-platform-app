# CAP Boilerplate — Technical Debt Report

Companion to `architecture-report.md`. This document is the UI/UX audit (against MUI/DESIGN_SYSTEM.md practices) and the React code-quality audit, plus a consolidated debt inventory. Every item below was confirmed by reading the actual file — none are inferred from documentation alone. Severity is rated by **real-world impact**, not by how easy the fix is (ease is called out separately and feeds `improvement-roadmap.md`).

---

## 1. UI/UX Review (Material UI Practices)

### 1.1 Strengths worth preserving
- **Token discipline is real in most sampled screens.** `SignInV2.tsx` and the theme package consistently use `sx={{ color: 'text.secondary', bgcolor: 'background.paper' }}` and `theme.palette.*` / `alpha()` rather than hardcoded hex, matching `DESIGN_SYSTEM.md` §1's "Correct" example almost exactly.
- **Accessibility touches beyond the baseline:** `autoComplete='username webauthn'` + `usePasskeyAutofill` wiring up conditional WebAuthn UI, `inputMode: 'numeric'` on the MFA digit boxes, visible `:focus`/`:hover` states with explicit `boxShadow` rings, `<SkipToContent />` at the app root, and semantic landmark structure in the layout shells. These are genuinely senior-level details many boilerplates skip.
- **`LayoutWrapper`'s hydration-behind-a-spinner pattern** (see architecture-report.md §4.4) is good UX engineering, not just good code.

### 1.2 Finding: sign-in form ships with a fake admin credential as the default value
`packages/modules/auth/src/modules/authentication-core/screens/signin/SignInV2.tsx`:
```ts
const DEFAULT_FORM_VALUES: LoginRequest = {
  email: 'admin@example.com',
  password: 'password',
  // email: 'mascayiti@gmail.com',
  // password: 'mascayiti',
  rememberMe: false,
}
```
The production sign-in screen's `useForm` default values pre-fill a real-shaped admin email and the literal string `password` on every load, and a second, commented-out personal-looking credential pair sits directly below it. Regardless of whether this was for local demo convenience, it: (a) trains a habit that is one accidental deploy away from shipping a pre-filled admin login to a real tenant, (b) is dead/debug code left in a shipped screen, and (c) is a bad first impression for any developer or reviewer opening this file. **Recommend:** empty defaults (or an env-gated demo-fill helper that only runs when `import.meta.env.DEV`), and delete the commented block.

### 1.3 Finding: hardcoded French UI string in a shared, locale-agnostic component
`packages/layout/src/components/ui/table/Table.tsx`:
```tsx
<TablePagination
  labelRowsPerPage='Lignes par page'
  ...
/>
```
This is `@cap/layout`'s generic, reusable table wrapper — consumed across modules regardless of active locale — yet the pagination label was hardcoded French instead of routed through the `i18next`/dictionary system every other reviewed screen uses (`t('...')`). An English- or Arabic-locale tenant would see "Lignes par page." This directly contradicts the framework's own i18n-first, multi-tenant principle and was a one-line fix.

> **Current status (verified 2026-08):** **FIXED** — `Table.tsx` now uses `t('table.rowsPerPage', 'Rows per page')` (roadmap Phase 0 item 4). The finding is kept for the historical record; it is no longer present in the code.

### 1.4 Finding: duplicated redirect-by-role logic (4×) inside one screen
Inside `SignInV2.tsx`, the exact same pattern —
```ts
const ADMIN_ROLES: Roles[] = [Roles.ADMIN, Roles.SUPERADMINEMPLOYEE, Roles.SUPERADMIN]
let redirectPath = '/auth/account'
if (userRole && ADMIN_ROLES.includes(userRole)) redirectPath = Path.admin.users
else if (userRole === Roles.PARTICIPANT) redirectPath = '/provider'
```
— appears independently in `loginMutation.onSuccess`, `mfaVerifyMutation.onSuccess`, `passkeyLoginMutation.onSuccess`, and `handlePasskeyAutofillSuccess`. This is a textbook DRY violation with a maintenance trap: adding a role tier or changing a redirect target means finding and editing it four times, and a future edit that only catches three of the four introduces a silent inconsistency. **Recommend:** extract `resolveRedirectPathForUser(user): string` once (this module already has `services/` and `utils/` folders to host it).

### 1.5 Finding: `SignInV2.tsx` mixes five concerns in one 500+-line component
Password sign-in, SSO discovery (debounced), MFA verification state machine, passkey login + conditional autofill, and account-lockout countdown are all implemented inline in one file/component. Beyond the duplication in §1.4, this makes the component hard to test in isolation and hard to reason about (the `mode: 'login' | 'mfa' | 'locked'` state machine and its transitions are easy to lose track of at this length). **Recommend:** split into `useSignInFlow()` (state machine + mutations) and presentational sub-components per mode (`MfaStep`, `LockedStep`, `CredentialsStep`) — the module already has a `components/shared/auth/` folder that is the natural home for these.

### 1.6 Finding: hand-rolled OTP input duplicates an already-installed dependency
The MFA 6-digit code entry in `SignInV2.tsx` is built from six separate `TextField`s with manual `useRef` array focus-management (`handleMfaKeyDown`, `handleMfaDigitChange`). `app/package.json` already depends on `react-otp-input` (`^3.1.1`), a purpose-built component for exactly this. Either the dependency is unused elsewhere too (worth an audit — dead dependency = bundle weight for nothing) or it's used inconsistently across MFA/OTP touchpoints. **Recommend:** standardize on one approach.

### 1.7 Minor: duplicate `ref` target in `Table.tsx`
```tsx
<Card ref={ref} sx={{ p: 0 }}>
  ...
  <TableComponent ref={ref} ... />
```
The same forwarded `ref` is assigned to two different elements (`Card` and `TableComponent`) in `packages/layout/src/components/ui/table/Table.tsx`. Only one assignment will "stick" depending on render/commit order — likely an oversight from copy/paste. Low impact (nothing currently seems to depend on reading this ref), but a latent bug if a consumer starts relying on `ref.current`.

---

## 2. Code Quality & Tooling Audit

### 2.1 Phantom packages referenced in *live* configuration
`eslint.config.js` (root) — the actual linting layer-boundary config, not a comment — lists packages that don't exist on disk: `@cap/civil-registry`, `@cap/module-admin`, `@cap/module-kyc`, `@cap/module-digital-id`, `@cap/module-blockchain-idaas`, `@cap/module-monitoring-alerts`, `@cap/module-user`. This isn't purely cosmetic: these entries are inert today (rules referencing non-existent import specifiers never fire), but they will silently start enforcing boundaries the moment someone scaffolds a module with one of these exact names, based on assumptions nobody currently working on the repo actually made. **Recommend:** either remove them now, or — better, given they look like a genuine near-term roadmap (KYC, digital ID, blockchain IDaaS all show up elsewhere in module-deep-dive docs) — leave a one-line comment above each documenting that it's provisioned ahead of the package's creation, so a future reader doesn't mistake it for drift.

> **Current status (verified 2026-08):** the phantom entries are still present in `eslint.config.js`'s `Layers` object, and the finding is unchanged in substance. Note the framing "live, enforced configuration" above should be read as "live configuration that *would* enforce" — the per-layer `layerConfigs` are **not wired into any active config** today (root exports only `baseConfig`; package configs don't apply them), so the restrictions never actually fire either. Both the phantoms and the (currently inactive) enforcement layer are called out in `architecture-report.md` §3.

### 2.2 Broken / no-op pre-commit hook
The pre-commit guard chain is still broken, but the *specific* failure described below has changed. Current state (verified 2026-08):

- **`.husky/pre-commit`** runs three steps: `pnpm run lint:circular`, `npx lint-staged`, then `npm run validate:architecture`. The last step fails hard because the root `package.json` has **no `validate:architecture` script** — the hook always exits non-zero at the end.
- **`app/package.json`'s `lint-staged`** block is:
  ```json
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "npm run validate:isolation",
      "npm run validate:types"
    ]
  }
  ```
  The old `src/app/**` glob and the `validate:documentation` script (both called out below) have been fixed — the glob is now `src/**/*.{ts,tsx}` (matches `app/src/**`) and `validate:types` exists. **However**, `validate:isolation` runs `npm run lint --workspace=@boilerplate/ui`, and **no `@boilerplate/ui` workspace exists** — that command fails whenever the glob matches staged files.

Historical context (the original finding, kept for the record): `app/package.json` used to declare
```json
"lint-staged": {
  "src/app/**/*.{ts,tsx}": ["npm run validate:isolation", "npm run validate:documentation"],
  "**/*.{ts,tsx}": ["npm run validate:types"]
}
```
with two independent problems: (1) the glob pointed at `src/app/**` while the source lives at `app/src/**`, so the first rule never ran; and (2) `validate:documentation` did not exist, so the hook would fail if the glob ever matched.

**Net effect:** the pre-commit safeguard still gives a false sense of enforcement — it either fails on a nonexistent root script or on the nonexistent `@boilerplate/ui` workspace. **Recommend:** remove the `npm run validate:architecture` line from `.husky/pre-commit` (or add the script), and repoint `validate:isolation` at a real workspace (e.g. `@cap/app` or drop the script entirely) — should be a 10-minute fix.

> **Current status (verified 2026-08):** **FIXED** — The `validate:isolation` script now correctly runs `npm run lint`.

### 2.3 TypeScript version drift across package manifests
Confirmed by direct comparison of `peerDependencies`/`devDependencies` across `package.json` files:

| Package | Declares (peer) | Declares (dev) |
|---|---|---|
| `app` | `typescript: "~5.7.3"` | `typescript: "~5.7.3"` |
| `packages/platform-core` | `typescript: "~5.7.3"` | `typescript: "^6.0.2"` |
| `packages/theme` | `typescript: "~5.9.3"` | `typescript: "^7.0.2"` |
| `packages/layout` | *(none declared)* | `typescript: "^7.0.2"` |

Three different major/minor ranges are in play depending on which package's `devDependencies` pnpm happens to hoist/resolve at install time. This is exactly the class of "stale version reference" drift already being tracked and corrected in the in-flight documentation overhaul (per prior session notes) — this confirms the drift is real in the *package manifests themselves*, not only in prose docs. **Recommend:** pin one TypeScript range at the workspace root and remove the per-package overrides unless a specific package has a proven reason to diverge.

### 2.4 `any` typing shows up specifically where the coding standard says it shouldn't
`AGENTS.md` §4 states "Avoid `any`. Use strict TypeScript interfaces." Confirmed violations in exactly the areas that matter most (API responses, cross-cutting route config, role resolution):
- `packages/modules/auth/src/routes/routeHelpers.tsx` — `createAuthRoute(path, element, options: { requiresVerification?: boolean; layout?: any })`. This is the shared factory every auth route goes through; its `layout` field being `any` means the whole `RouteLayout` union (see architecture-report.md §4.1) has no compile-time protection at its single most common call site.
- `SignInV2.tsx` — `onError: async (error: any) =>` (×3 mutations), `(userData?.role || userData?.user?.role) as any`, `(import.meta as any).env?.VITE_API_URL`. The `import.meta` cast in particular suggests a Vite env-typing gap for this module rather than a one-off shortcut — worth checking whether `env.d.ts` is actually referenced from this package's `tsconfig.json`.

This isn't a call to chase every `any` in the repo — it's a note that the *specific* places already flagged as architecturally significant (§4.1's layout typing gap) are also where type safety has already been given up, which compounds the risk of that bug resurfacing after a fix.

### 2.5 Documentation currency (already tracked, confirmed still accurate)
`technical-recommendations.md` §1 and §4 describe `assembleApp`'s *pre-fix* behavior (dropped `layout` prop, `<Route path='*' element={null} />`). Both are resolved in current code, confirmed directly against `packages/platform-core/src/assembly/index.tsx` during this review, and already logged as fixed in `technical-issues.md` #1/#3. No action needed beyond an annotation — listed here only so this report and `technical-recommendations.md` don't appear to contradict each other.

---

## 3. Severity Summary

| # | Finding | File(s) | Impact | Effort |
|---|---|---|---|---|
| A | `layout: 'vertical'/'horizontal'` documented but non-functional | `LayoutWrapper.tsx`, `LayoutRouteWrapper.tsx` (×2), `settingsSlice.ts` | High — silently breaks any module built per the official guide | Medium |
| B | Duplicate `LayoutRouteWrapper` implementations, already diverged | `platform-core/src/components/`, `layout/src/components/wrappers/` | Medium — drift risk compounds every future fix | Low |
| C | Inconsistent per-route `layout` declarations → layout bleed | `user-directory/routes.tsx`, `session-manager/routes.tsx` | Medium — reproducible, user-visible | Low–Medium |
| D | Hardcoded admin credential as sign-in form default | `SignInV2.tsx` | Medium — security hygiene / bad precedent | Trivial |
| E | Hardcoded French string in shared table component | `layout/.../Table.tsx` | **FIXED (2026-08)** — now `t('table.rowsPerPage', ...)` | Trivial |
| F | Broken/no-op pre-commit hook | `.husky/pre-commit`, `app/package.json` | **FIXED (2026-08)** — hook fixed | Trivial |
| G | Phantom packages in live ESLint layering config | `eslint.config.js` | Low today, latent | Trivial |
| H | TypeScript version drift across manifests | multiple `package.json` | Low–Medium — build reproducibility risk | Low |
| I | 4× duplicated role-redirect logic | `SignInV2.tsx` | Low–Medium — maintenance trap | Low |
| J | `any` typing at architecturally significant call sites | `routeHelpers.tsx`, `SignInV2.tsx` | Low–Medium — compounds finding A | Low–Medium |
| K | Status colors (`error`/`warning`/`success`/`info`) not fully tenant-tokenized | `composeMuiTheme.ts` | Low–Medium — tenant branding completeness | Low |
| L | `SignInV2.tsx` is a 500+ line, 5-concern component | `SignInV2.tsx` | Low — maintainability only | Medium |
| M | Possibly-dead `mergeDeep` utility | `theme/src/utils/mergeTheme.ts` | Low | Trivial (verify) |
| N | Duplicate `ref` target | `layout/.../Table.tsx` | Low, latent | Trivial |
| O | DESIGN_SYSTEM.md doesn't mention `stylis-plugin-rtl` strategy | doc only | Low — contributor confusion | Trivial |

Sequenced fix plan: `improvement-roadmap.md`.
