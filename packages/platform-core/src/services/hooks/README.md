# Infrastructure Hooks

This directory contains generic, technical React hooks and React integrations for infrastructure services.

## Canonical hooks in this directory:

- `useApi` - Generic API call wrapper with loading/error states
- `useDebounce` - Debounce values for search, input, etc.
- `useDeduplicatedRequest` - Prevent duplicate concurrent API calls
- `useOptimisticUpdate` - Optimistic UI updates with rollback
- `usePersistentForm` - Form state persistence in localStorage
- `useRouteState` - Preserve state across route navigation
- `useSSE` - Server-Sent Events connection management
- `useTabSync` - Synchronize state across browser tabs

## Directory Convention

| Directory | Purpose | Examples |
|-----------|---------|----------|
| `src/hooks/` | **Domain hooks** - Business logic, user state | `useAuth`, `usePermissions`, `useNavigation` |
| `src/services/hooks/` | **Infrastructure hooks** - Technical utilities | `useDebounce`, `useApi`, `useSSE` |

## When to use which?

**Use `src/hooks/`** when the hook:
- Depends on business domain concepts (users, roles, navigation)
- Uses domain-specific types or stores
- Ties to application feature logic

**Use `src/services/hooks/`** when the hook:
- Is generic/reusable across any application
- Wraps a technical service (API, storage, SSE)
- Provides utility functionality (debounce, deduplication)
