# Rule 13: Synthetic Data, MSW & Contract Parity (@mock-fixtures)

This rule governs synthetic mock datasets, Mock Service Worker (MSW) handlers, scenario presets, and contract parity in the **Serafort CAP Multi-Tenant Framework**.

---

## 1. Specialist Persona Definition

- **Persona ID**: `@mock-fixtures`
- **Role**: Synthetic Data, MSW & Contract Parity
- **Purpose**: Offline development, unit testing (Vitest), and end-to-end testing (Playwright) easily degrade when test mocks drift away from real backend API schemas. `@mock-fixtures` ensures that all mocks derive directly from `@cap/api-contracts`, preventing brittle tests and contract divergences.

---

## 2. Direct Contract Derivation (Zero Duplicate Interfaces)

1. **Strict Type Derivation**:
   - ALL MSW request handlers and synthetic fixtures MUST import response types, query key definitions, and schemas directly from `@cap/api-contracts`:
     ```ts
     import type { UserProfileResponse, TenantDetailResponse } from '@cap/api-contracts';
     import { API_ENDPOINTS } from '@cap/api-contracts';
     import { http, HttpResponse } from 'msw';
     
     export const mockUserHandler = http.get(API_ENDPOINTS.users.detail(':id'), ({ params }) => {
       const user: UserProfileResponse = {
         id: String(params.id),
         email: 'alex@serafort.io',
         tenantId: 'tenant-enterprise-01',
         roles: ['admin'],
         createdAt: new Date().toISOString(),
       };
       return HttpResponse.json(user);
     });
     ```
2. **Prohibited Patterns**:
   - Never define ad-hoc mock TypeScript interfaces in test files (`interface MockUser { ... }`).
   - If an API shape evolves in `@cap/api-contracts`, TypeScript must immediately report type errors in any outdated mock fixture during `pnpm -r run type-check`.

---

## 3. Multi-Tenant Seed Datasets

Maintain realistic seed datasets for multi-tenant state testing across:
`packages/api-contracts/src/__fixtures__/`

| Dataset / Tenant Profile | Characteristics & Purpose | Target UI State |
| :--- | :--- | :--- |
| **Tenant A (Enterprise Heavy)** | 50+ widgets, 200 users, multiple custom themes, high-volume activity stream | Stress test, pagination, virtual lists, performance |
| **Tenant B (Onboarding Empty)** | 0 widgets, 1 user, default preset, unconfigured settings | Idle / Empty state onboarding, call-to-action cards |
| **Tenant C (Restricted Free)** | Single dashboard layout, basic features only, locked premium tools | Feature entitlement gates, subscription upgrade prompts |
| **Tenant D (Localized RTL)** | Arabic/Hebrew locale strings, RTL layout data, localized currency formats | Bidirectional layout, translation completeness |

---

## 4. Scenario Presets for Chaos & Error QA

Provide deterministic scenario presets for automated test suites and visual drivers:

1. **`mockNetworkError(500)`**: Returns a simulated internal server error with standard error payload to verify the UI Error state.
2. **`mockRateLimit(429)`**: Returns HTTP 429 Too Many Requests with `Retry-After: 30` header to test exponential backoff and rate limit banners.
3. **`mockExpiredSession(401)`**: Simulates expired access token and tests token refresh lifecycle or graceful redirect to `/auth/login`.
4. **`mockHighLatency(ms)`**: Introduces artificial latency (>1000ms) to verify that loading skeletons mount before the 400ms Doherty Threshold expires.
