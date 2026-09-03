# cap-boilerplate

Welcome to the **cap-boilerplate** monorepo, a highly modular, domain-driven decentralized identity and digital services platform. This project serves as the definitive architecture for building secure, scalable React applications with strict module isolation and enterprise-grade Identity and Access Management (IDaaS).

---

## 🏛️ Project Overview

This workspace uses a **Monorepo** architecture leveraging `pnpm` workspaces. It cleanly separates the host application shell from shared platform utilities and vertical domain modules.

### Monorepo Structure

*   **Host Application (`/app`)**: The main entry point (Vite-based) that orchestrates, mounts, and serves dynamic domain modules.
*   **Shared Platform Packages (`/packages/`)**:
    *   `shared-types`: Zero-dependency TypeScript types, domain entities, and API contracts.
    *   `platform-core`: Utilities, hooks, and core business logic.
    *   `platform-store`: State management (hydration, secure storage).
    *   `layout`: The dedicated UI layout package (App shell, sidebar, templates).
    *   `theme`: Global styles and design tokens.
    *   `api-contracts` & `auth-contracts`: Strict API and Auth type boundaries.
*   **Domain Modules (`/packages/modules/`)**:
    *   `auth`: Enterprise-grade Identity and Access Management (IDaaS), MFA, Passkey, Passwordless.
    *   `landing`: Public landing pages.
    *   `theme`: Tenant branding and theme preset editor.

## 🛠️ Tech Stack

*   **Core:** React 19, TypeScript
*   **Build Tool:** Vite
*   **Routing:** React Router v7
*   **Styling & UI:** Material UI (MUI) v7, Virtualized React Tables
*   **PWA:** Workbox for offline support and service workers
*   **Testing:** Playwright for E2E testing, Vitest for unit testing
*   **Package Management:** `pnpm` workspaces

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
*   Node.js (v20.19+ or v22.12+)
*   pnpm (v9.x or higher)

### Setup & Installation

1.  **Install Dependencies:** Run this from the root directory to link workspaces and install dependencies.
    ```bash
    pnpm install
    ```

2.  **Configure Local Tenants (Required for Local Dev):** This platform supports multi-tenancy. Update your local hosts file (requires Admin/root):
    ```bash
    node scripts/setup-tenants.js
    ```

3.  **Run Development Server:**
    ```bash
    pnpm run dev
    ```
    Open your browser to `http://tenant1.localhost:5173` (plain `http://localhost:5173` works too when the tenants script hasn't been applied).

---

## 🧪 Testing

We rely on **Playwright** for robust End-to-End (E2E) integration tests, specifically for our critical security and authentication flows.

### Running E2E Tests

1.  **Execute the Test Suite:**
    ```bash
    pnpm run test:e2e
    ```
2.  **Auth Module Testing:**
    The E2E suite contains dedicated workflows testing our **IDaaS integration**:
    *   Passkey and Device Authentication flows.
    *   Multi-Factor Authentication (MFA) enforcement.
    *   Passwordless login links and token exchanges.
    *   Role-based route guarding (`GuestRoute`, `AuthRoute`, `AdminRoute`).

### Code Quality & Audits

*   **Linting:** `pnpm run lint`
*   **Security Audits:** `pnpm run audit:ci` checks dependencies for known vulnerabilities.
*   **Circular Dependency Check:** `pnpm run lint:circular` (madge) — also wired into the pre-commit hook.
*   **Coupling Analysis:** `node scripts/analyze-coupling.cjs` writes real Ce/Ca/instability metrics to `docs/MODULE_COUPLING_REPORT.md` and verifies architectural boundaries between packages.
