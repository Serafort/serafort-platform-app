# Rule 03: Security & Sentinel Defense

This rule enforces application security, data privacy, vulnerability prevention, and cryptographic integrity across the **Serafort CAP Multi-Tenant Framework**.

---

## 1. Zero PII Logging Mandate

1. **Strictly Prohibited**:
   - Never log user credentials, passwords, session tokens, JWTs, or raw user objects (`console.log(user)` or `console.log(state.auth)`).
   - Never log authorization headers or cookie values.
2. **Safe Diagnostic Logging**:
   - Wrap diagnostic logs in environment guards:
     ```ts
     if (import.meta.env.DEV) {
       console.info('[AuthFlow] Step transitioned:', stepName);
     }
     ```
   - Keep `console.error` and `console.warn` intact for unhandled exception telemetry, but mask sensitive parameters.

---

## 2. Cryptography & Client State Storage

1. **Encrypted Storage (`packages/platform-store`)**:
   - Persisted Zustand store slices must be encrypted with **AES-GCM 256** via the Web Crypto API.
   - Key derivation must use PBKDF2 with at least 200,000 iterations and a secure salt.
2. **Cryptographic PRNG**:
   - Never use `Math.random()` for tokens, keys, session identifiers, or job IDs.
   - Always use `crypto.randomUUID()` or `crypto.getRandomValues()`.

---

## 3. Web & DOM Vulnerability Defenses

1. **Protocol Whitelisting for Dynamic URLs & Widget Actions**:
   - Any dynamic action, user payload, or AI-generated output passed to `window.open`, `window.location.href`, or anchor `href` MUST be validated against safe protocols:
     ```ts
     const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];
     export function isValidUrl(rawUrl: string): boolean {
       try {
         const parsed = new URL(rawUrl, window.location.origin);
         return SAFE_PROTOCOLS.includes(parsed.protocol);
       } catch {
         return false;
       }
     }
     ```
   - Reject `javascript:`, `data:`, or `vbscript:` payloads to prevent DOM XSS.
2. **Tabnabbing & Referrer Leakage**:
   - Every external anchor tag using `target="_blank"` MUST declare `rel="noopener noreferrer"`.
3. **500 Internal Error Masking**:
   - In `api.client.ts`, masking 5xx responses must be unconditional on `status >= 500`.
   - Never expose raw backend stack traces or internal exception details to the user.

---

## 4. Content Security Policy & Security Headers

1. **Vite Dev Server & Production Ingress**:
   - Strictly adhere to the security headers in `app/vite.config.ts` and `app/public/_headers`:
     - `X-Frame-Options: DENY`
     - `X-Content-Type-Options: nosniff`
     - `Referrer-Policy: strict-origin-when-cross-origin`
     - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`
     - `Strict-Transport-Security: max-age=63072000; includeSubDomains`
     - CSP with `default-src 'self'`, `object-src 'none'`, and `frame-ancestors 'none'`.
2. **Dependency Security**:
   - Run production security audits regularly:
     ```bash
     pnpm audit:ci
     ```
   - Ensure git leaks protection via `.gitleaks.toml`.
