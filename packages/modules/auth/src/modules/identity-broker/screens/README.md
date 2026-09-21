# Identity Broker Screens

SSO (OIDC / SAML / JWKS / SSF) and provisioning (SCIM) screens. All are routed
from `routes/routes.tsx`; paths come from `AppPaths.identity` via `./path.ts`.

- `sso/` admin configuration plus the interactive login / consent / wait flows.
- `provisioning/` directory sync, connector detail, SCIM and sync logs.
