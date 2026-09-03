# Component Deep Dive — Theme & Layout Packages

## `@cap/theme`
Per its own README, this is the single source of truth for UI/UX:
- **Design tokens** (`src/types/designTokens.ts` — the `PrimitiveTokens` dictionary; concrete light/dark/Base token sets under `src/assets/themes/`, including the `zIndexScale` definition at `src/assets/themes/definitions/zIndex`)
- **Global styles** via Emotion (`src/styles/GlobalStyles.tsx`)
- **MUI theme overrides & composition** (`src/overrides/`, compiled through `src/utils/composeMuiTheme.ts` / `createBaseMuiTheme.ts`)
- **Tenant-driven dynamic theming context** (`src/context/`) — this is what `useTenant()` (consumed in `app/src/Providers.tsx`) ultimately resolves against
- **Shared styled primitives** (`src/styled/` — e.g. `GlassCard`, `GlassButton`, `AdaptiveCard`, `AdaptiveButton`; glassmorphism effects are a named, first-class theme feature, confirmed by the `effects.glassmorphism` field in the preset config shape)

Presets are declared in a `THEME_PRESETS` dictionary (`src/types/presets.ts`) conforming to a `TenantThemeConfig` shape (`metadata`, `tokens`, `effects`, `preview`), which is how a tenant is mapped to a concrete look-and-feel — supports the multi-tenant white-labeling noted in Phase 1.

Convention: other packages should import tokens directly (`colors`, `zIndexScale`) rather than hardcoding values, and apply them via `@emotion/styled` or MUI's `sx` prop.

> **Runtime theme application:** the actual CSS variable sync from a `TenantThemeConfig` to `:root` is handled by `src/utils/applyThemeVariables.ts`, driven by `ThemeBridge` in `@cap/layout`. `ThemeBridge` coalesces rapid config changes into a single `requestAnimationFrame` write (no per-frame DOM thrash on preset switching) and removes variables that a previous config produced but the new one no longer emits (e.g. `--glass-*`/`--effect-*` on returning to a non-effect preset).

## `@cap/layout`
Provides the structural shell components consumed by `app/src/layout.tsx`:
- `LayoutWrapper` — the actual layout **selector**. Reads `layoutOverride` from the Zustand store (`useAppStore`) and `settings.layout` (vertical/horizontal), and picks one of four render paths:
  - `layoutOverride === 'noLayout'` → renders the bare `noLayout` slot (chrome-free)
  - `layoutOverride === 'admin'` → renders `verticalLayout` or `horizontalLayout` (per `settings.layout`) inside an admin-flavored wrapper (`data-skin`)
  - anything else (including the default `'none'`) → renders `publicLayout`
  - Note: `layoutOverride === 'public'` is explicitly checked and also falls through to the public branch — effectively redundant with the default, but harmless.
- Also handles a **hydration flow**: while `isHydrating` (from `useStateHydration`), it pre-renders the final layout tree invisibly behind a spinner overlay to avoid layout shift/flicker on load, rather than showing a blank loading state.
- `VerticalLayout` / `HorizontalLayout` / `PublicLayout` / `BlankLayout` are the concrete layout shells; `VerticalNavigation` / `HorizontalNavigation` / menu components (`VerticalMenu`, `AdminMenu`, `HorizontalMenu`) render navigation sourced from the merged nav-item registry built by `assembleApp`.

## Key Takeaway for This Codebase
Because `LayoutWrapper`'s default (no override set) is **`publicLayout`**, not the dashboard/vertical layout, route `layout` values must be applied explicitly to get chrome-free or admin-flavored rendering. `LayoutRouteWrapper` (canonical copy at `packages/layout/src/components/wrappers/LayoutRouteWrapper.tsx`) currently only reacts to `layout === 'noLayout'` (setting the override to `'noLayout'` and restoring `'none'` on unmount) and sets `document.title` from the route `label`; `'admin'` is handled by `AdminRoute` itself, and `'vertical'`/`'horizontal'`/`'public'` set no override at all. So:
- Routes declaring `layout: 'noLayout'` (sign-in, verification links, etc.) now render chrome-free correctly.
- Routes relying on `'vertical'`/`'horizontal'` to switch the shell do nothing at runtime and silently fall through to `publicLayout` — the remaining routing gap tracked in `technical-issues.md` and the roadmap.
