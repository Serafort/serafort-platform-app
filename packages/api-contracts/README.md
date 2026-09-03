# `@cap/api-contracts`

## Overview
The `api-contracts` package is a foundational library within the `cap-boilerplate` monorepo. Its primary responsibility is to serve as the single source of truth for all external and internal API interactions.

## Architecture & Responsibilities
*   **Strict Typings:** Provides TypeScript interfaces and `as const` object literals to type-check payloads at the boundaries (pure TypeScript, no runtime validation library).
*   **Request/Response Schemas:** Defines the exact shape of network data expected by the frontend.
*   **Endpoint Definitions:** Maps URLs and HTTP methods to specific contracts via the `API_ENDPOINTS`, `API_QUERY_KEYS`, and `API_CONTRACTS` constants.
*   **Contract-Driven Calls:** Service layers and the platform API client resolve URLs and payload types from `API_CONTRACTS` entries, so URLs never drift between packages.

## Key Exports
*   `API_ENDPOINTS`: Centralized URL constant map (`ENDPOINTS` alias) for every backend endpoint. This is the single source of truth for URL strings.
*   `API_QUERY_KEYS`: React Query key factories (`QUERY_KEYS` alias) for cache invalidation.
*   `API_CONTRACTS`: Typed endpoint registry binding each endpoint's id, HTTP method, path, and request/response payload shapes together.
*   `defineEndpoint`: Factory for creating a typed `EndpointContract`; point its `resolve` builder at the matching `API_ENDPOINTS` entry.
*   `contractType<T>()`: Type-only marker used to attach a payload type to a contract slot without supplying a runtime value.
*   `resolveContractPath`: Resolves a contract's final path (without the base URL) from its path arguments.
*   `types/`: Contains the base TypeScript interfaces for standard API responses, pagination, endpoint contracts, and module contracts.
*   `index.ts`: The central barrel file exporting all validated schemas and types.

## Usage
```ts
import { API_CONTRACTS, resolveContractPath } from '@cap/api-contracts'

// URL flows from the contract, never hand-written at the call site.
const path = resolveContractPath(API_CONTRACTS.admin.users.byId, 42)
// '/api/admin/users/42'

// The platform API client consumes contracts directly for full type safety.
await apiClient.execute(API_CONTRACTS.user.me, [])
```

## Testing
`pnpm --filter @cap/api-contracts test` runs the vitest suite. The tests assert registry invariants: every path is well-formed, contract ids are unique, and every contract's `resolve` output matches its matching `API_ENDPOINTS` entry (no drift between the URL registry and the contracts that reference it).

## Dependencies
This package is a leaf node in the dependency graph: it depends only on `@cap/shared-types` (type-only contracts) and has **zero** React or runtime dependencies, so it can be safely imported by any module, core library, or even external services if published.
