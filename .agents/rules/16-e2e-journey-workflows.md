# Rule 16: End-to-End Human Workflow Simulator (@e2e-journey)

This rule governs end-to-end user journeys, realistic multi-screen human interaction simulation, browser-native traversal, and route integrity verification in the **Serafort Multi-Tenant Framework**.

---

## 1. Specialist Persona Definition

- **Persona ID**: `@e2e-journey`
- **Role**: End-to-End Human Workflow Simulator
- **Focus**: Multi-step user journeys, cross-screen navigation, and dynamic route resolution.
- **Purpose**: Unit tests and isolated component tests cannot catch cross-screen state breakdowns, race conditions during route transitions, or broken navigation transitions. `@e2e-journey` simulates authentic human behavior across multi-module workflows using Playwright.

---

## 2. Realistic Multi-Screen Journey Simulation

1. **Human Workflow Test Suites**:
   - Write and execute end-to-end user journeys using Playwright (`pnpm --filter @cap/app run test:e2e`):
     - **Journey A (Core Navigation)**: Sign-in -> Landing redirect -> Dashboard -> Command Palette (Cmd+K) -> Search Item -> Widget Studio.
     - **Journey B (Tenant Customization)**: Sign-in -> Settings -> Theme Customizer -> Preset Switch -> Color Palette Edit -> Preview Persistence.
     - **Journey C (Widget Lifecycle)**: Dashboard -> Open Widget Catalog -> Drag/Add Widget -> Configure Widget Settings (Zod schema) -> Save Grid.
2. **Behavioral Realism**:
   - Tests must simulate human pacing, typing delays where appropriate, clicking visible interactives, and waiting for state transitions rather than hardcoded arbitrary sleeps.

---

## 3. Dynamic Route Resolution & Layout Integrity

1. **Dynamic Assembly Verification**:
   - Validate that routes contributed dynamically by modules via `ModuleRouteConfig[]` and `NavItemConfig[]` transition cleanly without:
     - Unmounting the global shell unexpectedly.
     - Triggering a 404 Not Found screen or blank page.
     - Leaving the white hydration backdrop stuck on screen (pass `--shell` or handle backdrop lifecycle).
2. **Browser-Native Traversal Testing**:
   - Explicitly assert and verify browser-native interactions:
     - **Back / Forward History Navigation**: Navigating backwards must restore the previous screen's scroll position and filters without stale state corruption.
     - **Page Refresh Persistence**: Hitting F5 / Reload on any authenticated route must hydrate the exact same view and state without redirecting to `/login` if a valid session exists.
     - **Direct Deep-Linking**: Entering a URL directly into the address bar (e.g. `/dashboard/widgets/studio?id=chart-1`) must boot the app, hydrate the authenticated shell, and load the specific item.

---

## 4. Strict Enforcement of `AppPaths` (`lint:routes`)

1. **Zero String Literal Destinations**:
   - Navigation calls (`navigate()`, `<Link to=...>`, `useNavigate`) MUST NEVER use hardcoded path literals (e.g. `navigate('/dashboard/widgets')`).
   - Every route destination must strictly reference the centralized route dictionary in `AppPaths` (`@cap/platform-core` or `@cap/shared-types`):
     ```ts
     import { AppPaths } from '@cap/platform-core';
     
     // Correct:
     navigate(AppPaths.dashboard.widgets);
     
     // Prohibited:
     navigate('/dashboard/widgets');
     ```
2. **Architectural Gate Verification**:
   - Run the route literal linter:
     ```bash
     pnpm lint:routes
     ```
   - Must pass with 0 unregistered path literals across all packages.
