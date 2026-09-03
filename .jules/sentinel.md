## 2024-05-15 - Prevent Stack Trace Leakage on 500 Errors
**Vulnerability:** A logic flaw in `sanitizeErrorMessage` in `api.client.ts` bypassed masking for 5xx errors if they included detailed exception strings or stack traces instead of the exact phrase "internal server error".
**Learning:** Masking 5xx errors requires an unconditional check on the status code `status >= 500`, regardless of the raw error message content. The previous condition `(!str || str.toLowerCase().includes("internal server error"))` accidentally allowed verbose errors to leak through.
**Prevention:** Always mask 500-level errors unconditionally on the client side. Ensure error sanitizer logic defaults to safe masking when a status code indicates an internal failure.
