# 🔐 CAP Platform Security (Enterprise 2025)

This document outlines the security architecture and developer responsibilities for the Client Application Platform (CAP).

## 1. Core Security Guarantees

### RBAC Enforcement

- **Mechanism:** Strict numeric `Roles` enum validation.
- **Fail-Closed:** All route guards and permission checks default to `Forbidden` if context or roles are missing or malformed.
- **Route Matching:** Never use string-prefix matching (e.g., `pathname.startsWith()`) for route guards. Always use exact segment-aware matching.
- **Developer Rule:** Never use string-based checks (e.g., `role === "admin"`) for sensitive logic.

### Local Storage & Data Obfuscation

- **Engine:** AES-GCM (256-bit) via native Web Crypto API.
- **Key Derivation:** PBKDF2 with 200,000 iterations.
- **Encoding:** Hex (No Base64/atob/btoa to avoid encoding-to-string exploitation).
- **Scope & Limitations:**
  - `localStorage` & `IndexedDB` encryption strictly requires a client build-time key (`VITE_STORAGE_ENCRYPTION_KEY`). The application will intentionally throw a loud error rather than fall back to a hardcoded key if this is missing.
  - > [!IMPORTANT]
  - > **Local Storage Security Model**: Because Vite build-time environment variables are embedded in the compiled client JavaScript bundle, `localStorage` encryption provides local data **obfuscation** against casual inspection. It **does not** constitute a true cryptographic security boundary against client-side inspection or reverse engineering.
  - **Refresh Token Security**: Sensitive session credentials, specifically Refresh Tokens, **MUST NOT** be stored in `localStorage` or JavaScript-accessible memory. Refresh tokens are issued and maintained exclusively via **HttpOnly, SameSite, Secure cookies** handled directly by the browser and verified on the backend.

### Storage Cleanup

- **Forced Logouts:** All logouts and token invalidations strictly use `StorageManager.clearAllUserData()` to comprehensively purge all data from `localStorage`, `sessionStorage`, and `IndexedDB`.

## 2. Using Secure Storage

All storage operations in `@cap/platform-store` are asynchronous and support transparent obfuscated encryption for non-critical user preferences.

```ts
import { localStorageManager } from '@cap/platform-store'

// Save persistent UI state (automatically obfuscated/encrypted)
await localStorageManager.set('my_pref_key', { preferences: 'data' }, true)

// Retrieve and decrypt
const data = await localStorageManager.get<MyType>('my_pref_key', true)
```

## 3. Threat Model & Responsibilities

### Platform Responsibilities (What we handle)

- Local persistence protection (prevents plain-text disk inspection).
- Hardened middleware patterns (prevents client-side state manipulation bypasses).
- Session cookie configuration (HttpOnly, Secure, SameSite) for refresh token lifecycle.

### Developer Responsibilities (What YOU handle)

- **Backend Enforcement & Feature Gating:** The frontend RBAC and `AuthRegistry` UI plugin filtering are strictly for UX. The backend MUST independently verify JWT roles and tenant feature entitlements (e.g., verifying `mfa-totp` is enabled for the tenant) on every API request.
- **XSS Prevention:** Always sanitize user-provided content. Encrypted storage mitigates casual reading but cannot prevent in-memory token extraction under active XSS.
- **No Sensitive Tokens in Storage:** Never write refresh tokens, private keys, or raw credentials to `localStorage` or `sessionStorage`.
- **HTTP Methods:** All state-changing actions and token transmissions (e.g., logout, email verification, password reset) MUST use `POST` requests. NEVER transmit sensitive tokens via `GET` query strings.

## 4. Security Audit Policy

Any modifications to the `encryption.ts`, `secureTokenManager.ts`, or `AdminRoute.tsx` files require mandatory review by the Security Architecture team.
