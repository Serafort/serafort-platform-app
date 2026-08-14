## 2026-07-28 - [Secure jobId Generation]
**Vulnerability:** Weak PRNG `Math.random` used for `jobId` generation in `module-pipeline.service.ts`
**Learning:** It existed to generate a unique suffix but was not cryptographically secure, which could lead to ID predictability.
**Prevention:** Replaced with `crypto.randomUUID()`.
## 2024-05-18 - [target="_blank" Link Vulnerabilities]\n**Vulnerability:** External links with `target="_blank"` missing `rel="noreferrer"` attribute\n**Learning:** While `noopener` prevents reverse tabnabbing in modern browsers, adding `noreferrer` provides defense in depth by masking the referer URL, which can contain sensitive application context.\n**Prevention:** Always add `rel="noopener noreferrer"` to any anchor tag that uses `target="_blank"`.
