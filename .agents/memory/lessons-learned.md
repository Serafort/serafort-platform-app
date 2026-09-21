# Lessons Learned & Agent Memory Bank

This living document captures critical system discoveries, tricky edge cases, hydration race conditions, and architectural insights. All 17 specialist agents consult this file during the **Plan** stage and contribute to it during the **Remember** stage of the 7-step engineering loop.

---

## Index of Recorded Lessons

| ID | Domain | Topic / Finding | Discovered / Resolved |
| :--- | :--- | :--- | :--- |
| **LL-001** | Visual QA & Shell | Authenticated Shell Hydration Race & White Veil (`--shell`) | August 2026 |
| **LL-002** | Theme & Design | Status Color Tenantization & Variant Derivation | August 2026 |
| **LL-003** | Layout & Routing | Single Canonical `LayoutRouteWrapper` & Layout Defaulting | August 2026 |
| **LL-004** | Tooling & Vite | Outdated Dep Optimizer Cache False Positives | August 2026 |
| **LL-005** | Routing & Linting | Path-Shaped Literals Bypassing Route Parity (`lint:routes`) | August 2026 |
| **LL-006** | Multi-Tenancy | Tenant-Prefixed Storage Scoping (`tenantId:userId:key`) | September 2026 |
| **LL-007** | Visual QA & Tooling | Git Bash MSYS Path Mangling (`MSYS_NO_PATHCONV=1`) | September 2026 |

---

## Detailed Records

### LL-001: Authenticated Shell Hydration Race & White Veil (`--shell`)
- **Specialist Personas**: `@visual-qa`, `@e2e-journey`, `@architect`
- **Symptom**: Screenshots taken naively on `/dashboard` return pure blank white images even though elements exist in DOM.
- **Root Cause**: `/dashboard` mounts behind a `visibility: hidden` veil plus an opaque white `MuiBackdrop` at z-index 1400 for ~2.5 seconds while dynamic modules hydrate. Without an active backend, the auth guard fails and unmounts after ~2.5s.
- **Remediation**: Always pass `--shell` to `driver.mjs`. It holds auth calls open (~10s) and injects a stylesheet that strips the veil and hides the backdrop with zero sleeps.

### LL-002: Status Color Tenantization & Variant Derivation
- **Specialist Personas**: `@theme-artisan`, `@quality`
- **Symptom**: Customizing `error.main` alone in theme presets produced mismatched `light`/`dark` variants.
- **Root Cause**: Formerly only `primary`/`secondary` derived variants via `lighten()`/`darken()`.
- **Remediation**: `derivePaletteColorGroup(main, token?)` now tokenizes all 6 palette groups (`primary`, `secondary`, `error`, `warning`, `success`, `info`), honoring explicitly authored tokens or computing variants with `lighten()`/`darken()`.

### LL-003: Single Canonical `LayoutRouteWrapper`
- **Specialist Personas**: `@architect`, `@flow-state`
- **Symptom**: Duplicate `LayoutRouteWrapper.tsx` existed in `@cap/platform-core` and `@cap/layout` and drifted out of sync.
- **Root Cause**: Refactor left duplicate wrapper behind.
- **Remediation**: Deleted platform-core copy. The single canonical implementation is at `packages/layout/src/components/wrappers/LayoutRouteWrapper.tsx`. Do not reintroduce a second copy.

### LL-004: Outdated Dep Optimizer Cache False Positives
- **Specialist Personas**: `@release-dx`, `@quality`
- **Symptom**: `The requested module does not provide an export named 'default'` on files that plainly have `export default`.
- **Root Cause**: Vite optimizer cache (`app/node_modules/.vite`) became stale during multi-package edits.
- **Remediation**: Stop dev server, run `rm -rf app/node_modules/.vite`, and restart.

### LL-005: Path-Shaped Literals Bypassing Route Parity (`lint:routes`)
- **Specialist Personas**: `@e2e-journey`, `@flow-state`, `@architect`
- **Symptom**: Dead links like hardcoded `navigate('/provider')` landed users on 404 screens without failing unit tests.
- **Root Cause**: Unit tests checked parity between `AppPaths` and registered routes, but missed hardcoded string literals in navigation calls.
- **Remediation**: Added `scripts/check-route-literals.mjs` (`pnpm lint:routes`) to enforce that every navigation destination comes from `AppPaths`.

### LL-006: Tenant-Prefixed Storage Scoping (`tenantId:userId:key`)
- **Specialist Personas**: `@tenant-lifecycle`, `@security`
- **Symptom**: Rapid tenant switching carried state or theme preferences across tenant boundaries.
- **Root Cause**: Persistent keys in `localStorage` or `secureStorage` lacked tenant namespaces.
- **Remediation**: Enforce `<tenantId>:<userId>:<keyName>` key scoping across all persistent storage adapters.

---

### LL-007: Git Bash MSYS Path Mangling (`MSYS_NO_PATHCONV=1`)
- **Specialist Personas**: `@visual-qa`, `@e2e-journey`, `@architect`
- **Symptom**: All `/admin/*` visual-QA runs produce screenshots of the landing page instead of the intended admin screen. Timeouts or blank images are returned, and the route appears to never mount.
- **Root Cause**: Git Bash / MSYS2 rewrites every CLI argument beginning with `/` into a Windows absolute path before passing it to Node.js (e.g. `/auth/login` becomes `C:/Program Files/Git/auth/login`). The driver therefore navigates to `http://localhost:5173C:/Program Files/Git/admin/...` which 404s and falls back to the landing page.
- **Remediation**: Always prefix driver commands with `MSYS_NO_PATHCONV=1` in Git Bash:
  ```bash
  MSYS_NO_PATHCONV=1 node .claude/skills/run-serafort-app/driver.mjs shot /admin/users out.png
  MSYS_NO_PATHCONV=1 node .claude/skills/run-serafort-app/admin-driver.mjs shot /admin/users out.png
  ```
  The drivers also contain a defensive regex normaliser (`/^[A-Za-z]:[\\\\\\//]/`) that converts a mangled path back to `'/'` as a last resort, but `MSYS_NO_PATHCONV=1` is the authoritative fix. PowerShell and cmd do not require it.

---

## Agent Improvement Log Template

When adding a new lesson:
```markdown
### LL-[Number]: [Concise Title]
- **Specialist Personas**: [@persona1, @persona2]
- **Symptom**: [What went wrong or was observed]
- **Root Cause**: [Underlying architectural or runtime explanation]
- **Remediation**: [How to fix it, and what rule/test/assertion was updated to prevent recurrence]
```
