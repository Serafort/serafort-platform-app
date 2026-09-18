## 2024-05-15 - Prevent Stack Trace Leakage on 500 Errors
**Vulnerability:** A logic flaw in `sanitizeErrorMessage` in `api.client.ts` bypassed masking for 5xx errors if they included detailed exception strings or stack traces instead of the exact phrase "internal server error".
**Learning:** Masking 5xx errors requires an unconditional check on the status code `status >= 500`, regardless of the raw error message content. The previous condition `(!str || str.toLowerCase().includes("internal server error"))` accidentally allowed verbose errors to leak through.
**Prevention:** Always mask 500-level errors unconditionally on the client side. Ensure error sanitizer logic defaults to safe masking when a status code indicates an internal failure.

## 2026-07-28 - [Secure jobId Generation]
**Vulnerability:** Weak PRNG `Math.random` used for `jobId` generation in `module-pipeline.service.ts`
**Learning:** It existed to generate a unique suffix but was not cryptographically secure, which could lead to ID predictability.
**Prevention:** Replaced with `crypto.randomUUID()`.

## 2024-05-18 - [target="_blank" Link Vulnerabilities]
**Vulnerability:** External links with `target="_blank"` missing `rel="noreferrer"` attribute
**Learning:** While `noopener` prevents reverse tabnabbing in modern browsers, adding `noreferrer` provides defense in depth by masking the referer URL, which can contain sensitive application context.
**Prevention:** Always add `rel="noopener noreferrer"` to any anchor tag that uses `target="_blank"`.

## 2026-09-02 - [DOM XSS via Dynamic Widget Actions]
**Vulnerability:** Unsanitized user/AI input in `action.payload` being passed directly to `window.open` and `window.location.href` in `DynamicLayoutWidget.tsx`.
**Learning:** Dynamically generated layouts can introduce XSS if event handlers blindly execute string payloads as URLs, allowing `javascript:` URIs.
**Prevention:** Always validate and sanitize URLs against a whitelist of safe protocols (http, https, mailto, tel) before navigating or opening them.

## 2026-09-06 - [Monorepo 6-Tier Import Invariants]
**Architectural Invariant:** Low-tier packages importing from higher-tier packages breaks monorepo modularity and causes circular dependencies.
**Learning:** High-tier modules (e.g. `@cap/module-auth`, `@cap/app`) must depend on low-tier libraries (e.g. `@cap/shared-types`, `@cap/theme`, `@cap/platform-store`), never the reverse.
**Prevention:** Enforce strict 6-tier hierarchy during PR reviews. Prohibit `@cap/layout` from importing `@cap/modules/*` or `@cap/app`.

## 2026-09-06 - [Zero Hardcoded Navigation & Menus]
**Architectural Invariant:** Hardcoding navigation links or route arrays in layout or shell components breaks the dynamic plugin and multi-tenant contribution contract.
**Learning:** Feature capabilities must be contributed dynamically via `CAPModule` contracts (`navItems`, `routes`).
**Prevention:** Verify that `@cap/app` and `@cap/layout` do not contain hardcoded menu arrays. Validate all routes are contributed through module contracts and loaded lazily with `React.lazy()`.

## 2026-09-06 - [Bidirectional LTR and RTL Parity]
**Accessibility & UX Invariant:** Hardcoded directional CSS properties (`left`, `right`, `marginLeft`, `paddingLeft`) cause broken layouts and horizontal overflow in RTL languages (such as Arabic).
**Learning:** All UI components must render identically well in both LTR and RTL.
**Prevention:** Use `stylis-plugin-rtl` or CSS logical properties (`marginInlineStart`, `paddingInlineStart`, `inlineSize`). Directional navigation icons (arrows/chevrons) must be rotated 180 degrees in RTL mode.

## 2026-09-06 - [Zero PII & Credential Logging]
**Security & Privacy Invariant:** `console.log(user)` or logging authorization tokens leaks sensitive personally identifiable information into telemetry streams and browser devtools.
**Learning:** Token payload and user store objects must never be logged.
**Prevention:** Review all logging statements in PRs. Strictly prohibit logging session tokens, credentials, or full user profile objects.

## 2026-09-06 - [Explicit Route Layout Declaration]
**Routing Invariant:** Omitting `layout` on a `ModuleRouteConfig` causes the route to inherit whatever `layoutOverride` was left behind by the prior visited page (layout bleed bug).
**Learning:** Every contributed route must explicitly declare its layout intent (`'admin'`, `'public'`, `'noLayout'`, `'vertical'`, `'horizontal'`).
**Prevention:** Reject route configurations that lack an explicit `layout` property.

## 2026-09-06 - [Cross-Tenant Cache Contamination]
**Multi-Tenant Invariant:** Sharing a single global query cache without tenant-scoping or clearing query cache on tenant-switch leaks cached tenant data across user accounts.
**Learning:** React Query caches persist in memory unless explicitly scoped by tenant key or cleared on auth context changes.
**Prevention:** Wipe query cache via `queryClient.clear()` on sign-out and tenant switch. Ensure query keys include tenant parameters where appropriate.

## 2026-09-06 - [Unvalidated Runtime API Responses]
**Data Integrity Invariant:** Remote backend API responses must never be trusted blindly by the client; schema alterations cause silent runtime crashes.
**Learning:** TypeScript type assertions (`as UserProfile`) do not validate actual JSON payload structure at runtime.
**Prevention:** Parse critical API boundaries (auth, billing, permissions) through runtime schema validators (Zod) before passing to platform stores or state machines.

## 2026-09-06 - [Telemetry PII Leaks in Breadcrumbs]
**Privacy Invariant:** Automated error trackers (Sentry, OpenTelemetry) capture query strings, input state, and URL breadcrumbs that may contain user emails, reset tokens, or passwords.
**Learning:** Error boundaries must sanitize error context and breadcrumb attributes before sending telemetry events.
**Prevention:** Never attach raw user objects, input values, or unmasked query params to error events or telemetry dispatches.


## 2024-05-19 - [target="_blank" Link Vulnerabilities]
**Vulnerability:** External links with `target="_blank"` missing `rel="noopener noreferrer"` attributes.
**Learning:** Adding `noopener` prevents reverse tabnabbing and `noreferrer` masks the referer URL, providing defense in depth. Found missing attributes in `ChangeEmail.tsx` and `SCIMConfiguration.tsx`.
**Prevention:** Always add `rel="noopener noreferrer"` to any anchor tag or component that renders an anchor tag with `target="_blank"`.
