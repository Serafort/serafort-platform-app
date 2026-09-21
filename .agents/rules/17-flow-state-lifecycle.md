# Rule 17: Cross-Screen Context & State Guardian (@flow-state)

This rule governs cross-screen data handoffs, URL query parameter state persistence, lazy-load `<Suspense>` feedback, unmount cleanup lifecycles, and inter-module state transitions in the **Serafort Multi-Tenant Framework**.

---

## 1. Specialist Persona Definition

- **Persona ID**: `@flow-state`
- **Role**: Cross-Screen Context & State Guardian
- **Focus**: Data persistence between screens, multi-step form handoffs, and URL parameter integrity.
- **Purpose**: Passing transient state invisibly through global memory stores creates subtle bugs: users cannot bookmark or share links, browser refreshes lose working context, and memory leaks contaminate subsequent screens. `@flow-state` ensures clean, resilient screen handoffs.

---

## 2. URL State Prioritization & Zero-PII Discipline

1. **Shareable & Bookmarkable Screen State**:
   - Screen filters, pagination indexes, search queries, active tab IDs, and selected entity IDs MUST be persisted in URL query parameters (`useSearchParams`) rather than buried in memory-only Zustand state.
   - A user who shares or bookmarks a URL must land on the identical view configuration.
2. **Strict Zero-PII Mandate on URLs**:
   - URLs are recorded in browser history, server logs, proxies, and referrer headers.
   - NEVER place PII, emails, session tokens, passwords, or sensitive customer details into URL search params or paths.
   - Use opaque, non-enumerable UUIDs or IDs (`?id=7f4b3...` or `?tab=security`).

---

## 3. `<Suspense>` Skeleton Transitions & Doherty Threshold (<400ms)

1. **Loading Feedback for Lazy Chunks**:
   - Because all route screen components are wrapped in `React.lazy()`, route transitions fetch chunk bundles over the network.
   - Every route boundary MUST provide a tailored `<Suspense>` fallback (matching page-level skeleton or spinner) rather than a jarring blank flash.
2. **Doherty Threshold Compliance**:
   - The skeleton fallback MUST mount within 100ms of route navigation if the chunk is not already cached, keeping the perceived latency well under the 400ms Doherty Threshold.
   - Avoid cumulative layout shift (CLS < 0.1) when swapping the skeleton with the loaded chunk: skeletons must match the exact height and layout geometry of the target screen.

---

## 4. Screen Unmount Cleanup & Cache Isolation

1. **Lifecycle Teardown Audit**:
   - When a user navigates away from a screen, any page-specific Zustand state or temporary form draft MUST be evaluated:
     - Unfinished form wizards: persist draft to tenant-prefixed storage if intended, or explicitly reset.
     - Ephemeral search queries and modal states: reset on unmount.
2. **No Stale Context Bleed**:
   - Ensure React Query caches or local stores do not bleed obsolete entity data into the next screen.
   - When opening an entity detail screen (`/users/123` followed by `/users/456`), ensure the previous entity's details do not flicker before the new entity data arrives (use placeholder or loading state).

---

## 5. Inter-Module Handoff & 4 UI States Consistency

When a user flow spans two independent modules (e.g. `@cap/module-auth` handoff to `@cap/module-dashboard`, or `@cap/module-dashboard` launching `@cap/module-widget-studio`):

1. **Consistent 4 UI States Across Boundaries**:
   - **Idle/Empty**: Both modules show clear empty states if data is absent.
   - **Loading**: Skeletons match layout style and theme tokens across the boundary.
   - **Success**: Status feedback (toasts, alerts) persists across redirect if needed.
   - **Error**: Errors occurring at the boundary (e.g., token handshake, widget manifest load) render clean, actionable error states with recovery paths.
2. **Contract Safety**:
   - Data passed across module boundaries must strictly conform to contracts defined in `@cap/shared-types` or `@cap/api-contracts`.
