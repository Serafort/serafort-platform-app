# Jules Playbook — Autonomous Review & Maintenance SOP

This playbook defines the standard operating procedure for **Jules** when performing autonomous code reviews, bug fixes, dependency updates, and maintenance tasks across the **Serafort CAP Multi-Tenant Monorepo**.

---

## 1. Automated PR Review Checklist

When reviewing any Pull Request or change set, Jules must systematically audit against the following gates:

### Gate 1: Monorepo Architecture & Package Boundaries
- [ ] Does any lower-tier package import from a higher-tier package? (e.g. `@cap/layout` importing `@cap/modules/*` or `@cap/app`).
- [ ] Does the change introduce circular dependencies? (Check `pnpm lint:circular`).
- [ ] Are any menus or routes hardcoded in layout or shell components? All routes and navigation items must be declared in `CAPModule` contracts.
- [ ] Are all screen components wrapped in `React.lazy()`?
- [ ] Does every added route explicitly declare its `layout` intent (`'admin'`, `'public'`, `'noLayout'`, `'vertical'`, `'horizontal'`)?

### Gate 2: Code Quality & Type Discipline
- [ ] Are there any instances of `any`? (Flag `as any`, `(data as any)`, `error: any`). Use strict interfaces from `@cap/shared-types`.
- [ ] Does the package pass `pnpm -r run type-check` with 0 errors?
- [ ] Is any component exceeding 300 lines without separation of concerns? Look for opportunities to extract custom hooks and sub-components.
- [ ] Are there any demo credentials left in default values?

### Gate 3: Security & Privacy Defense
- [ ] Is there any PII or credential logging? Check for `console.log(user)`, `console.log(token)`, or auth header logs.
- [ ] Are external links (`target="_blank"`) protected with `rel="noopener noreferrer"`?
- [ ] Are dynamic URLs or action payloads sanitized against whitelisted protocols (`http:`, `https:`, `mailto:`, `tel:`) to prevent `javascript:` XSS?
- [ ] Is `crypto.randomUUID()` used instead of `Math.random()` for IDs?
- [ ] Are 500-level backend errors sanitized in client error handlers?

### Gate 4: Modern UI, Cognitive UX & 4 UI States
- [ ] Are colors hardcoded as hex values? (Colors must use `theme.palette.*`, `alpha()`, or CSS custom properties).
- [ ] Does the screen implement all **4 UI States**: Idle/Empty, Loading, Success, Error?
- [ ] Do touch/click targets respect Fitts's Law (>=44×44px, inputs minHeight 48px)?
- [ ] Are primary actions visually isolated (Von Restorff Effect)?

### Gate 5: Accessibility (WCAG 2.2 AA) & Bidirectional (LTR & RTL) Parity
- [ ] Does the component render correctly in **both LTR and RTL**?
  - Uses `stylis-plugin-rtl` or logical CSS properties (`marginInlineStart`, `paddingInlineStart`, `inlineSize`).
  - Directional icons (arrows, chevrons) flip in RTL mode.
- [ ] Is there any hardcoded text string? All user-facing strings must use `t('key', 'default')`.
- [ ] Are interactive elements keyboard accessible with visible focus rings?
- [ ] Does every page have a single `<h1>` and semantic landmarks (`<main>`, `<nav>`, `<header>`)?

### Gate 6: Network, Server-State Cache & Telemetry Audit
- [ ] Are React Query keys using centralized factories from `API_QUERY_KEYS` (`@cap/api-contracts`) instead of arbitrary strings?
- [ ] Do optimistic mutations implement the 3-step rollback pattern (`onMutate` snapshot → `onError` rollback → `onSettled` invalidation)?
- [ ] Is `AbortSignal` propagated for long-running or cancelable fetch requests?
- [ ] Are critical API response payloads validated at runtime using Zod schemas?
- [ ] Does telemetry strictly exclude PII, credentials, and unmasked query parameters?
- [ ] Are independent widgets and module chunks wrapped in React `ErrorBoundary` containers?

---


## 2. Standard Validation Commands

Jules should execute these commands to validate changes:

```bash
# Type checking
pnpm -r run type-check

# Circular dependency verification
pnpm lint:circular

# Security audit
pnpm audit:ci

# Build compilation
pnpm --filter @cap/app run build
```
