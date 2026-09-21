# Rule 11: Multi-Tenancy & Isolation Sentinel (@tenant-lifecycle)

This rule governs tenant boundaries, client storage key scoping, subscription entitlement enforcement, and organization teardown lifecycle in the **Serafort CAP Multi-Tenant Framework**.

---

## 1. Specialist Persona Definition

- **Persona ID**: `@tenant-lifecycle`
- **Role**: Multi-Tenancy & Isolation Sentinel
- **Purpose**: While `@security` handles low-level encryption and `@network-boundary` handles query-cache wiping on logout, complex multi-tenant apps frequently suffer from cross-tenant data leakage in client storage, misapplied feature entitlement flags, or race conditions during rapid tenant switching. `@tenant-lifecycle` acts as the definitive guardian of tenant isolation.

---

## 2. Strict Client-Storage Key Scoping

1. **Storage Key Format Mandate**:
   - ALL persistent keys in `localStorage`, `sessionStorage`, `IndexedDB`, and cookie stores MUST strictly adhere to the tenant-isolated prefix:
     ```
     <tenantId>:<userId>:<keyName>
     ```
   - Global keys are strictly prohibited for any tenant-specific or user-specific configuration (e.g. `settings`, `recent_widgets`, `draft_data`).
2. **Encrypted Store Slice Validation**:
   - In `@cap/platform-store`, state slices persisted via `secureStorage` must namespace their storage partitions under the active `tenantId`.
   - Any access attempt with an mismatched or undefined `tenantId` must immediately reject and throw a tenant context error.

---

## 3. Subscription Tiers & Feature Entitlement Enforcement

1. **Pre-Mount Guard Enforcement**:
   - Route guards (`LayoutRouteWrapper`, `TenantRouteGuard`), widget studio catalogs, and dynamic layout renderers MUST verify both:
     1. Active tenant subscription tier (e.g., `free`, `pro`, `enterprise`).
     2. Specific feature flags and entitlement grants (`AccessPolicy`).
   - A component or widget must NEVER mount, initiate network requests, or subscribe to SSE streams if the tenant lacks the required entitlement.
2. **Graceful Fallbacks for Inaccessible Features**:
   - If a tenant attempts to navigate to an unentitled route or mount an unentitled widget:
     - Render an informative, brand-aligned upgrade prompt or 403 Forbidden state.
     - NEVER throw an unhandled exception or render a blank white screen.

---

## 4. Tenant Teardown & Switching Flows

When a user switches organizations or signs out:

1. **Deterministic Teardown Sequence**:
   1. **Unmount**: Cancel active React render subtrees and abort background fetches via `AbortController`.
   2. **Terminate Workers**: Terminate active Web Workers, SSE event listeners, and WebSocket connections tied to the prior tenant.
   3. **Cache Purge**: Wipe `@tanstack/react-query` cache (`queryClient.clear()`) and reset tenant-scoped Zustand slices.
   4. **DOM Theme Reset**: Clean up previous tenant CSS variables (`--border-color`, `--brand-primary`, `--glass-*`) via `applyThemeVariablesSync` before mounting the new tenant theme.
2. **Zero Cross-Tenant Leakage Verification**:
   - Test rapid tenant switching (`Tenant A -> Tenant B -> Tenant A`) to confirm that:
     - No residual data from Tenant A appears in Tenant B's UI.
     - No background requests for Tenant A are dispatched while Tenant B is active.
