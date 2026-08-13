# CAP Boilerplate — Prioritized Improvement Roadmap

Sequenced from `architecture-report.md` and `technical-debt-report.md`. Ordered by **risk-reduction-per-hour**: cheap, high-confidence fixes first; anything touching shared routing/layout logic is sequenced so it's verified in isolation before the next change lands on top of it.

**Status: awaiting approval.** Per the review brief, no implementation should begin until this roadmap is reviewed and approved. The thematic work (search fix, color picker, CSS variable batching) was handled separately from this roadmap.

> **Current status (verified 2026-08):** several Phase 0 items have since landed independently. Per-item status is noted inline below. The approval-gate statement at the bottom ("no code in Phases 0–4 has been written") is **no longer literally true** — see the per-item notes; Phases 1–4 remain unimplemented.

---

## Phase 0 — Zero-risk, high-signal (do first, ~1 hour total)
Pure additions or corrections with no behavioral change to running code.

1. **Run the existing coupling analyzer and commit its output.** `node scripts/analyze-coupling.cjs` → `docs/MODULE_COUPLING_REPORT.md`. Replaces this review's qualitative coupling notes with exact Ce/Ca/instability numbers per package and DDD sub-module. (architecture-report.md §3)
   > **Status: DONE** — `docs/MODULE_COUPLING_REPORT.md` is committed (generated 2026-08-04, 825 files, 11 packages, 76 sub-modules). Regenerate before trusting it for a large refactor.
2. **Fix the pre-commit hook glob and missing script** in `app/package.json` (`src/app/**` → `app/src/**`; add or remove `validate:documentation`). (debt report §2.2)
   > **Status: DONE** — the lint-staged glob was corrected to `src/**/*.{ts,tsx}` and the `validate:isolation` script was updated to use a functional `npm run lint` target.
3. **Delete the hardcoded default sign-in credentials** (and the commented-out second pair) in `SignInV2.tsx`. (debt report §1.2)
   > **Status: NOT DONE** — `DEFAULT_FORM_VALUES` still ships `admin@example.com` / `password`.
4. **Translate `Table.tsx`'s `labelRowsPerPage`** through the existing i18n dictionary system instead of a hardcoded French string. (debt report §1.3)
   > **Status: DONE** — `Table.tsx` uses `t('table.rowsPerPage', 'Rows per page')`.
5. **Annotate `technical-recommendations.md` §1 and §4** as resolved, pointing to `technical-issues.md` #1/#3, so the two docs stop appearing to contradict each other.
   > **Status: DONE (this documentation pass)** — the annotations have been added to both sections.

## Phase 1 — Layout/routing correctness (the core finding, ~0.5–1 day)
This is the highest-impact fix in the review and should land as one coherent change, tested against every route layout value before merging, because it touches the shared routing contract every module depends on.

6. **Decide the intended behavior for `'vertical'`/`'horizontal'` route layouts** — two valid options, pick one:
   - **(a) Retire them:** if `'admin'` (global `settings.layout` choosing vertical/horizontal) is actually meant to cover all authenticated dashboard routes, remove `'vertical'`/`'horizontal'` from the `RouteLayout` union and update `MODULE_DEVELOPMENT_GUIDE.md`'s example to stop showing them as valid per-route values.
   - **(b) Wire them up:** extend `LayoutOverride` (`settingsSlice.ts`) to include `'vertical'`/`'horizontal'` as first-class values, add the corresponding branches in `LayoutWrapper.tsx`, and update `LayoutRouteWrapper`'s effect to set them (not just `'noLayout'`).
   Recommend (a) unless there's a known near-term need for a route to force a specific orientation independent of the tenant's global layout preference — it's the smaller, lower-risk change and it makes the documented contract match reality either way.
7. **Consolidate the two `LayoutRouteWrapper` implementations into one**, exported from `@cap/layout` (the more complete/commented copy), and have `packages/platform-core/src/assembly/index.tsx` import that one instead of maintaining its own. Delete `packages/platform-core/src/components/LayoutRouteWrapper.tsx` and its duplicate `RouteLayout` type export.
8. **Fill in the missing `layout` declarations** in `user-directory/routes/routes.tsx` and `session-manager/routes/routes.tsx` so every route in those files makes an explicit choice — eliminates the layout-bleed scenario in architecture-report.md §4.2.
9. **Add a regression test** (the modules already have `vitest` set up) asserting: for each declared `RouteLayout` value, `layoutOverride` in the store ends up in the expected state after mount, and resets correctly on unmount/navigation-away. This is what should have caught findings A and C, and will prevent a re-regression.

## Phase 2 — Config & type-safety cleanup (~0.5 day)
10. **Pin one TypeScript version range at the workspace root**; remove per-package overrides in `theme`, `platform-core`, `layout` unless justified.
11. **Resolve or annotate the phantom packages** in `eslint.config.js`'s `Layers` object (debt report §2.1) — either delete the unused entries or add a one-line "provisioned ahead of package creation" comment.
12. **Replace the `layout?: any` field** in `routeHelpers.tsx`'s `createAuthRoute` options with the real `RouteLayout` type now that Phase 1 has settled what that type is.
13. **Audit and fix the other flagged `any` sites** in `SignInV2.tsx` (mutation error handlers, role casts, `import.meta` env access) — check whether `env.d.ts` is actually in this package's `tsconfig.json` include path first, since the `import.meta` cast suggests it may not be.

## Phase 3 — Theme completeness (~0.25 day, isolated/low-risk)
14. **Extend `error`/`warning`/`success`/`info` to derive `light`/`dark`/opacity variants from their tenant token** the same way `primary`/`secondary` already do in `composeMuiTheme.ts` — small, additive, no breaking change to the `TenantThemeConfig` shape.
15. **Confirm whether `mergeDeep` in `mergeTheme.ts` is dead code**; remove if so, or add a unit test if it turns out to be used on tenant-supplied JSON.
16. **Add one clarifying paragraph to `DESIGN_SYSTEM.md`** explaining the `stylis-plugin-rtl` physical-property-flip strategy so the "always use logical properties" guidance doesn't read as contradicted by the actual codebase.

## Phase 4 — Component-level UI/UX & quality (~1–2 days, non-urgent)
17. **Extract `resolveRedirectPathForUser()`** out of `SignInV2.tsx`'s four duplicated call sites.
18. **Split `SignInV2.tsx`** into a `useSignInFlow()` hook plus `CredentialsStep`/`MfaStep`/`LockedStep` presentational components.
19. **Standardize MFA/OTP entry** on the already-installed `react-otp-input` (or confirm a deliberate reason it isn't used here and drop the dependency if genuinely unused elsewhere).
20. **Fix the duplicate `ref` assignment** in `Table.tsx` (`Card` vs. `TableComponent`).

---

## What's explicitly out of scope for this roadmap
Everything in `technical-recommendations.md` §6/§7 (MCP server for API contracts, granular OAuth token scopes, CSP headers, service-worker cache restrictions, dependency-audit CI) is still valid, unclaimed work — it wasn't re-litigated here because this review's brief was architecture/theme/layout/UI/code-quality, and those items are already tracked with clear rationale in that document. Recommend triaging them into this same phase structure once Phases 0–2 land, since Phase 2's config cleanup (CI-adjacent) is a natural place to pick up "Automated Supply Chain Dependency Auditing" next.

---

## Approval gate
**As of the original review, no code in Phases 0–4 had been written.** Confirm which phases (all, some, or a re-ordered subset) to proceed with, and confirm the Phase 1 direction — retire `'vertical'`/`'horizontal'` (6a) vs. wire them up (6b) — since that decision shapes several of the Phase 1 changes.

> **Current status:** the layout/routing items (6–9), config cleanup (10–13), theme completeness (14–16), and component-level work (17–20) remain **unimplemented**. Only the Phase 0 documentation/verification items marked DONE above have landed (and the Phase 3 item 16 doc clarification was added in the same documentation pass). The Phase 1 decision (6a vs 6b) is still open.
