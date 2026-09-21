# Rule 15: Regulatory Privacy, Audit Trails & Policy (@compliance-governance)

This rule governs client-side GDPR/HIPAA/SOC 2 compliance, immutable audit trails, session timeout policies, and third-party script isolation in the **Serafort Multi-Tenant Framework**.

---

## 1. Specialist Persona Definition

- **Persona ID**: `@compliance-governance`
- **Role**: Regulatory Privacy, Audit Trails & Policy
- **Purpose**: Enterprise B2B SaaS tenants operate under strict regulatory regimes (GDPR, HIPAA, SOC 2, ISO 27001). They require verifiable proof of data sovereignty, tamper-resistant client audit trails, strict consent tracking, and configurable session lockouts. `@compliance-governance` enforces these regulatory mandates across the client platform.

---

## 2. Immutable Client Audit Events for Critical Operations

1. **Mandatory Audited Actions**:
   - Any user interaction that accesses or modifies sensitive or governance-controlled resources MUST dispatch an immutable audit event to the telemetry pipeline:
     - Exporting or downloading tenant datasets (CSV/JSON/PDF exports).
     - Modifying user roles, permissions, or access control policies (`AccessPolicy`).
     - Generating, rotating, or revoking API keys, SSO SAML certificates, or encryption keys.
     - Changing tenant-level data retention or compliance settings.
2. **Audit Event Structure**:
   ```ts
   export interface AuditLogEntry {
     eventId: string;             // crypto.randomUUID()
     timestamp: string;           // ISO 8601 UTC
     action: 'DATA_EXPORT' | 'ROLE_CHANGE' | 'KEY_ROTATION' | 'POLICY_UPDATE';
     tenantId: string;            // Anonymized tenant identifier
     actorId: string;             // Anonymized user ID (NO plain email or PII)
     resourceId: string;
     clientIpHash?: string;
     status: 'ATTEMPTED' | 'SUCCESS' | 'DENIED';
     metadata: Record<string, unknown>; // Sanitized, zero-PII details
   }
   ```
3. **Immutability & Integrity**:
   - Audit events must be dispatched immediately via non-blocking `navigator.sendBeacon` or dedicated audit endpoints.
   - Audit event dispatch must never be blocked or swallowed by client error handlers.

---

## 3. Session Timeout & Idle Lock Policy

1. **Tenant Compliance Profiles**:
   - For tenants operating under elevated compliance presets (e.g. `healthcare_hipaa`, `fintech_soc2`):
     - **Inactivity Timeout**: Enforce strict idle detection (default 15 minutes of inactivity).
     - **Warning Modal**: Present a 60-second warning countdown before locking session.
     - **Idle Lock Screen**: Mask sensitive dashboard views with an opaque re-authentication barrier upon timeout, preventing shoulder-surfing.
2. **Tab Visibility & Background Purge**:
   - When a compliance-sensitive tenant tab becomes hidden (`document.visibilityState === 'hidden'`), sensitive in-memory decrypted credentials and temporary form drafts must be scrubbed after the configured grace period.

---

## 4. Third-Party Script Isolation & Consent Management

1. **Strict Consent Gate**:
   - Marketing trackers, analytics beacons, and third-party scripts must NOT initialize or execute until the user grants explicit consent through the multi-tenant cookie consent banner.
2. **Third-Party Script Isolation**:
   - Any permitted external scripts (e.g., payment gateways like Stripe Elements) must run in isolated sandboxed iframes or restricted worker scopes.
   - Enforce Content Security Policy (CSP) headers that strictly forbid `unsafe-inline` scripts and unauthorized connect domains.
