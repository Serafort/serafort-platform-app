# `@cap/module-auth`

## Overview
The `module-auth` package is the enterprise-grade Identity and Access Management (IDaaS) domain module for the platform. It handles everything from session minting to Multi-Factor Authentication (MFA) and route guarding.

## Architecture & Responsibilities
This package follows a strict Domain-Driven / Hexagonal Architecture:

*   **`domain-kernel/`**: Contains the pure domain models, ports, and domain events.
*   **`idaas-facade/`**: The adapter layer that interacts with the underlying external Identity Provider (or blockchain IDaaS).
*   **Authentication Flows:** Manages Login, Register, Passwordless (Magic Links), and Passkey/Device Auth.
*   **Authorization:** Handles IP restrictions for API tokens, Role-Based Access Control (RBAC), and organization joining.

## Key Exports
*   `index.ts`: Exports the `CAPModule` descriptor, defining the auth routes, navigation, and i18n dictionaries for the host application assembly.
*   `plugins/`: Pluggable MFA strategies (e.g., TOTP).
*   Route Guards: `AuthRoute`, `GuestRoute`, and `AdminRoute` wrappers used to protect the application.

## Dependencies
*   Depends on `@cap/platform-core` to dispatch events and read/write session state to the store.
*   Depends on `@cap/platform-store` for the app store and `secureTokenManager`.
*   Depends on `@cap/layout` (route wrappers) and `@cap/theme` (styling).
*   Type contracts come from `@cap/shared-types`.

> [!NOTE]
> Although `@cap/auth-contracts` and `@cap/api-contracts` exist in the workspace and are wired into the Vite aliases (`app/vite.config.ts`), module-auth does **not** currently import either package in source. The domain contracts live directly under this package's `domain-kernel/`/`types/` and `@cap/shared-types`.
