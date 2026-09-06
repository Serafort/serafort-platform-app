# Rule 09: Network Boundary, Server-State Cache & API Contracts

This rule governs asynchronous server-state lifecycle (`@tanstack/react-query`), optimistic updates, request cancellation, runtime schema validation, and contract synchronization in the **Serafort CAP Multi-Tenant Framework**.

---

## 1. Server-State Lifecycle & Cache Management (`@tanstack/react-query`)

1. **Single Source of Truth for Query Keys**:
   - NEVER construct ad-hoc string arrays for query keys (e.g. `['users', id]`).
   - ALWAYS use the centralized query key factories from `@cap/api-contracts` (`API_QUERY_KEYS`):
     ```ts
     import { API_QUERY_KEYS } from '@cap/api-contracts';
     
     const { data } = useQuery({
       queryKey: API_QUERY_KEYS.users.detail(userId),
       queryFn: () => userService.getUser(userId),
       staleTime: 5 * 60 * 1000, // 5 minutes baseline
     });
     ```
2. **Multi-Tenant Cache Isolation**:
   - In multi-tenant systems, queries scoped to a tenant MUST include the `tenantId` in the query key hierarchy (or verify the active tenant context resets the query client).
   - On tenant switch or sign-out, the query cache MUST be wiped cleanly via `queryClient.clear()` to prevent data leakage between tenants.
3. **Stale-Time & Garbage Collection Baselines**:
   - **Static / Reference Data** (roles, permissions, theme presets, country codes): `staleTime: 30 * 60 * 1000` (30 mins), `gcTime: 60 * 60 * 1000` (1 hour).
   - **Standard Operational Data** (user list, tenant settings, widgets): `staleTime: 5 * 60 * 1000` (5 mins).
   - **Real-Time / Dynamic Data** (active alerts, notifications, SSE widget streams): `staleTime: 0` (immediate refetch on focus/mount).

---

## 2. Optimistic UI Mutations & Rollback Protocol

Every mutating operation that updates the UI immediately must implement the 3-step rollback lifecycle:

```ts
const mutation = useMutation({
  mutationFn: updateItem,
  onMutate: async (newItem) => {
    // 1. Cancel in-flight queries to prevent overwrite
    await queryClient.cancelQueries({ queryKey: API_QUERY_KEYS.items.list() });

    // 2. Snapshot previous cache value for rollback
    const previousItems = queryClient.getQueryData(API_QUERY_KEYS.items.list());

    // 3. Optimistically update query cache
    queryClient.setQueryData(API_QUERY_KEYS.items.list(), (old: Item[] = []) => [
      ...old,
      { ...newItem, id: 'temp-id', isOptimistic: true },
    ]);

    return { previousItems };
  },
  onError: (err, newItem, context) => {
    // 4. Rollback to snapshot on error
    if (context?.previousItems) {
      queryClient.setQueryData(API_QUERY_KEYS.items.list(), context.previousItems);
    }
  },
  onSettled: () => {
    // 5. Always refetch to sync with server truth
    queryClient.invalidateQueries({ queryKey: API_QUERY_KEYS.items.list() });
  },
});
```

---

## 3. Race Condition Mitigation & Request Cancellation

1. **AbortController Signals**:
   - Long-running fetches or search queries MUST accept an `AbortSignal` and pass it to the HTTP client:
     ```ts
     export const searchUsers = (query: string, signal?: AbortSignal) =>
       apiClient.get(API_ENDPOINTS.users.search, { params: { query }, signal });
     ```
   - In React Query, pass the provided `signal` directly:
     ```ts
     useQuery({
       queryKey: API_QUERY_KEYS.users.search(term),
       queryFn: ({ signal }) => searchUsers(term, signal),
     });
     ```
2. **Unmount Cleanup**:
   - Prevent state updates on unmounted components by ensuring subscriptions, polling intervals, and SSE streams cleanly disconnect in `useEffect` cleanup return functions.

---

## 4. Runtime Validation & Contract Synchronization

1. **Never Trust Remote JSON Blindly**:
   - TypeScript types alone do not protect against backend payload changes at runtime.
   - Critical API boundaries (auth tokens, permission policies, payment/billing responses) must be parsed through runtime schema validators (Zod / ArkType / Valibot):
     ```ts
     import { z } from 'zod';
     
     export const UserProfileSchema = z.object({
       id: z.string().uuid(),
       email: z.string().email(),
       role: z.string(),
       tenantId: z.string(),
     });
     
     export type UserProfile = z.infer<typeof UserProfileSchema>;
     ```
2. **Deterministic Mocking (MSW)**:
   - For unit tests (Vitest) and e2e tests (Playwright), mock endpoints using Mock Service Worker (MSW) or contract fixtures (`packages/api-contracts/src/__fixtures__`).
   - Tests must NEVER hit live staging backends to ensure deterministic, flake-free CI runs.
