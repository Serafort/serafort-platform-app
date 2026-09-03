# `@cap/layout`

## Overview
The `layout` package provides the structural UI chrome and layout templates for the `cap-boilerplate` host application. It wraps domain modules in a cohesive, responsive app shell while remaining decoupled from business logic.

## Architecture & Responsibilities
*   **App Shell Templates:** Exposes standardized wrappers (`VerticalLayout`, `HorizontalLayout`, `BlankLayout`, `PublicLayout`).
*   **Navigation & Chrome:** Contains the Header, Footer, and Sidebar menu components, plus the kbar command palette search.
*   **Theme Integration:** Works closely with `@cap/theme` and the TenantProvider to render multi-tenant, white-labeled UIs. `ThemeBridge` coalesces rapid tenant config changes into a single `requestAnimationFrame` write.
*   **Advanced UI Components:** Houses high-performance components like the **Virtualized React Tables** used across dashboards.

## Key Exports
*   `LayoutWrapper.tsx`: The primary layout-switching component that selects the layout template based on route config.
*   `components/`: Reusable layout building blocks (e.g., Header, Sidebar).
*   `index.ts`: The main entry point for importing layouts into the host app.

## Dependencies
*   Depends on `@cap/platform-core` for hooks like `useTenant` and `useSessionGuard`.
*   Depends on `@cap/theme` for design tokens and styling configurations.

> [!NOTE]
> The package does **not** declare a dependency on specific domain modules like `@cap/module-auth` in its `package.json`; it renders strictly based on configuration passed down from the router. (The coupling report records two transitive edges to `@cap/module-auth` via the monorepo graph, so treat the intent rather than the claim of zero transitive reach as normative.)
