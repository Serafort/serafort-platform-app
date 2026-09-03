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
