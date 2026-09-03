# `@cap/auth-contracts`

## Overview
The `auth-contracts` package defines the strict boundaries and types for the Identity and Access Management (IDaaS) module. It decouples the authentication implementation (`@cap/module-auth`) from the rest of the workspace.

## Architecture & Responsibilities
*   **Routing Definitions:** Contains the strict path constants and route shapes for authentication pages (e.g., Login, Register, MFA).
*   **Service Contracts:** Defines the interfaces for authentication providers, allowing dependency injection.
*   **Auth Types:** Exports models for Users, Roles, JWT Claims, and Session state.

## Key Exports
*   `routes/`: Route path constants ensuring type-safe navigation to Auth screens.
*   `services/`: Abstract interfaces for the identity provider facade.
*   `types/`: Session, User, and Token types.
*   `index.ts`: The main barrel file exposing contracts to consumers.

## Dependencies
*   Like `api-contracts`, this package is a low-level definition library.
*   Depends on `@cap/shared-types`, `@cap/api-contracts`, and `@cap/platform-store` (per `docs/MODULE_COUPLING_REPORT.md`).

> [!NOTE]
> **Current status (2026-08):** no package imports `@cap/auth-contracts` in source today (afferent coupling `Ca = 0` per `docs/MODULE_COUPLING_REPORT.md`). It is wired into the Vite aliases (`app/vite.config.ts`) and remains the intended contract surface for the auth module, but `@cap/module-auth` currently derives its types from `@cap/shared-types` and its own `domain-kernel/` instead. The decoupling intent in the "Overview" above is architectural, not yet enforced by runtime usage.
