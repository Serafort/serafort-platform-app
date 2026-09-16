## 2024-05-24 - Fix reverse tabnabbing vulnerability in window.open
**Vulnerability:** Found multiple instances of `window.open(url, '_blank')` lacking `rel="noopener noreferrer"`.
**Learning:** While modern browsers implicitly add `noopener`, older browsers do not, and the `Referer` header may still be leaked to the newly opened site without `noreferrer`.
**Prevention:** Every external anchor tag using `target="_blank"` MUST declare `rel="noopener noreferrer"` to prevent reverse tabnabbing vulnerabilities.
