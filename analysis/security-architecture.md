# Security Architecture & Audit Baseline

This document defines the security boundaries, threat models, and audit baselines for the `cap-boilerplate` monorepo. It serves as the primary reference for OWASP (Application Security Verification Standard v4.0) and CWE (Common Weakness Enumeration) compliance, specifically targeting the `/packages/modules/auth` Identity as a Service (IDaaS) module.

---

## 1. Security Boundaries & Trust Model

The `cap-boilerplate` architecture enforces a strict zero-trust model between the client presentation layer and the domain kernel.

*   **Untrusted Client (UI & Layout):** The `/app` and `/packages/layout` directories operate in an untrusted browser environment. React route guards (`AuthRoute.tsx`, `GuestRoute.tsx`, `AdminRoute.tsx`) exist strictly for UX purposes and graceful degradation. They are **not** security boundaries.
*   **Contract Boundary:** The `/packages/api-contracts` and `/packages/auth-contracts` define the shared request/response and endpoint contracts for the platform. **Note:** today both packages are constants/type-only — `@cap/api-contracts` exports query-key factories and endpoint maps (e.g. `API_ENDPOINTS`, `API_QUERY_KEYS`) with no runtime validation layer (no Zod), so they describe the validation perimeter rather than actively enforcing it. Server-side schema validation is delegated to the backend; see `technical-debt-report.md` / `technical-recommendations.md` §6 for the open MCP-server recommendation that would surface these contracts to tooling.
*   **Trusted Kernel:** The `domain-kernel` within `/packages/modules/auth` contains the core security logic. All authorization assertions, session validations, and cryptographic checks occur here or on the backend services this module communicates with.

---

## 2. OWASP & CWE Audit Matrix

The following matrix maps specific security modules within `/packages/modules/auth` to their corresponding OWASP ASVS categories and CWE identifiers. This matrix must be updated as new audit findings are resolved.

### 2.1. Authentication Core & Credentials

| Target Files | OWASP ASVS | CWE Identifier | Audit Criteria |
| :--- | :--- | :--- | :--- |
| `schema.ts`<br>`ForgotPassword.tsx`<br>`SetNewPasswordScreen.tsx` | **V2.1** Password Security | **CWE-521** (Weak Password)<br>**CWE-256** (Unprotected Storage) | • Enforce server-side password entropy validation.<br>• Ensure resets immediately invalidate prior sessions.<br>• Confirm cleartext passwords are scrubbed from all memory structures and logs. |
| `usePasskey.ts`<br>`passkey.spec.ts` | **V2.8** Authenticator & WebAuthn | **CWE-287** (Improper Auth)<br>**CWE-345** (Insufficient Verification) | • Validate WebAuthn challenge-response origins against strict domain isolation rules.<br>• Verify counter checks to prevent passkey cloning.<br>• Ensure fallback methods do not bypass MFA requirements. |
| `Captcha.tsx`<br>`useAuthQuery.ts`<br>`ResendEmailVerification.tsx` | **V2.2** Anti-Automation | **CWE-307** (Improper Restriction of Attempts) | • Verify rate-limiting on login, MFA, and OTP resend endpoints.<br>• Audit backend CAPTCHA token validation to prevent client-side bypass.<br>• Check for timing attacks in user enumeration (**CWE-208**). |

### 2.2. Session Management & State Integrity

| Target Files | OWASP ASVS | CWE Identifier | Audit Criteria |
| :--- | :--- | :--- | :--- |
| `types/session.ts`<br>`useSignOut.ts`<br>`session.spec.ts` | **V3.1** Session Bindings | **CWE-384** (Session Fixation)<br>**CWE-613** (Insufficient Expiration) | • Confirm session identifiers rotate completely upon state changes (e.g., Guest to Auth).<br>• Verify absolute and sliding session expiration.<br>• Ensure `useSignOut.ts` broadcasts termination via `useSSE.ts` to invalidate all active client instances. |
| `normalizeAuthUser.ts`<br>`store/index.ts` | **V3.4** Token Storage | **CWE-312** (Cleartext Storage)<br>**CWE-922** (Insecure Storage) | • Ensure access tokens are not exposed to XSS via `localStorage`. Prefer `HttpOnly` cookies for session tokens.<br>• Confirm `SameSite` cookies or Anti-CSRF headers are strictly enforced for state-altering requests. |

### 2.3. Authorization, RBAC & API Tokens

| Target Files | OWASP ASVS | CWE Identifier | Audit Criteria |
| :--- | :--- | :--- | :--- |
| `PermissionRegistry.tsx`<br>`RoleDetailView.tsx`<br>`RoleList.tsx` | **V4.1** Access Control Enforcement | **CWE-862** (Missing Authorization)<br>**CWE-863** (Incorrect Authorization) | • Ensure all API contracts enforce authorization independent of client-side state.<br>• Audit role-checking logic against horizontal and vertical privilege escalation (**CWE-269**). |
| `APITokensDashboard.tsx`<br>`CreateAPITokenIPRestrictions.tsx`<br>`MachineIdentityManagement.tsx` | **V4.2** Machine & API Tokens | **CWE-290** (Auth Bypass by Spoofing)<br>**CWE-200** (Data Exposure) | • Validate that raw API tokens are visible only upon initial creation.<br>• Confirm IP restriction logic safely parses CIDR, IPv6, and `X-Forwarded-For` headers without spoofing vulnerabilities. |
| `JoinOrganization.tsx`<br>`DomainVerification.tsx` | **V4.3** Multi-Tenant Isolation | **CWE-639** (Auth Bypass via User-Controlled Key / IDOR) | • Verify strict cross-tenant isolation (Tenant A cannot access Tenant B data).<br>• Ensure domain verification claims are resistant to DNS hijacking and race conditions. |

### 2.4. Federated Identity & Protocol Handlers

| Target Files | OWASP ASVS | CWE Identifier | Audit Criteria |
| :--- | :--- | :--- | :--- |
| `types/saml.ts`<br>`types/scim.ts` | **V2.9** Federated Auth | **CWE-347** (Improper Signature Verification)<br>**CWE-611** (XXE Injection) | • Audit SAML assertion parsing for XML External Entity (XXE) weaknesses.<br>• Verify strict cryptographic signature validation for all incoming SAML responses.<br>• Check SCIM payload validation against schema poisoning. |
| `types/jwks.ts`<br>`types/ssf.ts` | **V14.2** JWKS & Key Integrity | **CWE-327** (Broken Crypto Algorithm) | • Confirm JWKS endpoints enforce strong key algorithms (e.g., RS256/ES256) and explicitly reject `alg: "none"`.<br>• Audit Shared Signals Framework (SSF) validation for processing asynchronous token revocation events. |

---

## 3. Security Verification via Playwright (E2E)

Automated security verification is enforced in CI/CD via the `/app/e2e/` Playwright test suite. The following specs must pass to validate the security boundaries defined above:

*   **`session.spec.ts`**: Verifies session fixation defenses, multi-tab synchronization (SSE revocation), and absolute timeout enforcement.
*   **`mfa.spec.ts` & `passkey.spec.ts`**: Validates multi-factor challenge-response flows, WebAuthn origin checks, and fallback mechanisms.
*   **`password-reset.spec.ts`**: Ensures token expiration, single-use enforcement, and session invalidation post-reset.
*   **`email-verification.spec.ts`**: Confirms that unverified accounts hit proper access control barriers inside the `AuthRoute` middleware.
