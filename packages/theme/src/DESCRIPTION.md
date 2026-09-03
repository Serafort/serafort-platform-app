# `@cap/theme` Source Description

This document describes the current `src/` layout for `@cap/theme` based on the code that is actually present today.

## Overview

`@cap/theme` is a shared React + MUI theme package for:

- tenant-aware theme configuration
- runtime theme composition
- preset-driven visual styles
- effect-aware styled components
- reusable UI building blocks and wrappers

The package no longer matches the older "tokens/menu/theme" structure described in previous docs. The active implementation is centered around `TenantThemeConfig`, MUI theme composition, and a set of reusable components plus compatibility helpers.

## Runtime Model

At runtime, the package works roughly like this:

1. `TenantThemeProvider` loads the active tenant theme from props, local storage, or the backend.
2. `useDerivedMuiTheme()` combines tenant tokens, app settings, light/dark mode, and base themes.
3. `composeMuiTheme()` creates the final MUI theme and injects component overrides.
4. `DesignSystemProvider` applies the theme through MUI and adds global styles.
5. Styled components and hooks read from the tenant theme and the derived MUI theme.

There are also compatibility shims for consumers that still rely on CSS custom properties. Those live mainly in `utils/applyThemeVariables.ts` and `hooks/useThemeVariables.ts`.

## Top-Level Source Layout

```text
src/
|-- index.ts
|-- assets/
|-- components/
|-- config/
|-- context/
|-- hooks/
|-- overrides/
|-- store/
|-- styled/
|-- styles/
|-- types/
|-- utils/
|-- declarations.d.ts
|-- test-setup.ts
`-- DESCRIPTION.md
```

## Directory Guide

### `index.ts`

The package entry point re-exports most of the public API:

- all theme types
- menu class definitions and typography helpers from `assets/themes/definitions`
- hooks, utils, styled components, styles, assets, and components
- tenant theme providers and hooks
- theme exports from `assets/themes`
- third-party style wrappers like `AppReactApexCharts`

It intentionally does not export a legacy `components/menu` surface.

### `assets/`

Static theme resources and presentational assets.

Important parts:

- `assets/themes/`
  - exports legacy base themes: `BaseTheme`, `lightTheme`, `darkTheme`
  - exports palette primitives
  - exports `ThemeProvider` and `ModeChanger`
  - exports definitions such as `typography`, `zIndex`, and `menuClasses`
  - exports theme type augmentation from `types/theme.ts`
- `assets/svg/`
  - React SVG components: `Logo`, `Keyboard`, `PaperIcon`, `Rocket`
- `assets/images/` and `assets/fonts/`
  - bundled media assets

Notable detail:

- `assets/themes/Base.ts` is explicitly marked deprecated and retained for backward compatibility.
- `assets/themes/definitions/userTheme.ts` is a stub for custom MUI theme extension and is also legacy-oriented.

### `types/`

This is the real contract layer of the package.

Key files:

- `designTokens.ts`
  - defines primitive color, spacing, radius, typography, shadow, transition, and z-index tokens
- `effects.ts`
  - defines the effect system:
    - `standard`
    - `glass`
    - `neu`
    - `brutalism`
    - `bento`
    - `organic`
    - `immersive`
- `componentStyles.ts`
  - per-component style strategy such as `global`, `glass`, or `brutalism`
- `presets.ts`
  - defines preset ids and the `THEME_PRESETS` catalog
- `menu.ts`
  - menu-related type definitions
- `index.ts`
  - defines `TenantThemeConfig`, context state/action types, CSS variable maps, and `DEFAULT_THEME_CONFIG`

`DEFAULT_THEME_CONFIG` is the main default source of truth for tenant theming.

### `context/`

Context management for tenant theme state.

- `TenantThemeContext.tsx`
  - stores the active tenant theme
  - prop-driven tenant theme context and state management
  - exposes granular hooks:
    - `useTenantThemeState`
    - `useTenantThemeStatus`
    - `useTenantThemeActions`
  - also exposes the legacy combined `useTenantThemeContext`
- `DesignSystemProvider.tsx`
  - wraps `TenantThemeProvider`
  - applies the derived MUI theme
  - injects `CssBaseline` and `GlobalStyles`

### `hooks/`

Hooks that connect tenant config to runtime styling.

- `useTenantTheme`
  - high-level helper around the tenant theme context
  - can apply presets, reset to default, and save
- `useDerivedMuiTheme`
  - derives the final MUI theme from tenant tokens, settings, and system dark mode
- `useComponentEffectConfig`
  - resolves the effective effect config for a specific component slot
- `useComponentStyle`
  - returns the configured style rule for a component slot
- `useThemeVariables`
  - deprecated compatibility hook that mirrors tenant tokens to CSS variables
- `useThemeCustomizer`
  - exposes granular theme mutation helpers used by the Theme Editor screen

### `utils/`

Core theme transformation and compatibility helpers.

Important utilities:

- `composeMuiTheme.ts`
  - builds the final MUI theme from platform settings and `TenantThemeConfig`
  - merges in component overrides from `overrides/`
- `mergeTheme.ts`
  - preset application
  - theme creation from partial objects
  - validation helpers
- `computeEffects.ts`
  - computes style values for neumorphism, glass, brutalism, bento, organic, and immersive effects
- `themeObjectStyles.ts`
  - reads component-level style config from the MUI theme object
- `applyThemeVariables.ts`
  - CSS variable generation and application helpers for consumers that still use CSS custom properties
  - shared by `useThemeVariables` and `ThemeBridge`
  - exports `flattenAppliedVariables` / `applyVariableDiff`, which coalesce rapid config changes into a single write and remove variables a previous config produced but the new one no longer emits

### `overrides/`

Global MUI component overrides assembled by `overrides/index.ts`.

Current override groups:

- `MuiMenu.ts`
- `MuiLayout.ts`
- `MuiTable.ts`

These are attached inside `composeMuiTheme()`.

### `config/`

Static platform configuration defaults.

- `themeConfig.ts`
  - defines the default `ThemeConfig` (navbar/footer behavior, layout component positions, color palettes, shape/border-radius, typography, shadows) used as the base for MUI theme composition

### `store/`

Lightweight external stores for theme editor interactions.

- `themeEditorStore.ts`
  - `useSyncExternalStore`-based store holding the Theme Editor draft state (`isEditing`, `draftConfig`)
  - mirrors draft token values to CSS variables (`--mui-palette-*`, `--border-color`, `--border-radius`) for live preview

### `styled/`

Effect-aware styled components.

Exports:

- `GlassCard`, `GlassButton`
- `NeuCard`, `NeuButton`
- `BrutalismCard`, `BrutalismButton`
- `BentoCard`, `BentoButton`
- `OrganicCard`, `OrganicButton`
- `ImmersiveCard`, `ImmersiveButton`
- `AdaptiveCard`, `AdaptiveButton`, `AdaptiveInput`

This folder is one of the clearest public surfaces in the package: it gives consumers ready-made effect variants without requiring them to manually compute style objects.

### `styles/`

Global styling helpers and themed wrappers.

Exports:

- `GlobalStyles`
- `GlobalZIndexStyles`
- `StepperWrapper`
- wrapper components for:
  - ApexCharts
  - Recharts
  - react-dropzone
  - react-toastify

Notable detail:

- `styles/horizontal/` and `styles/vertical/` currently exist as directories but are empty.

### `components/`

MUI base wrappers and shared theme-level widgets.

Publicly exported from `components/index.ts`:

- MUI component extensions (`./mui`)
- `Copyright`
- `AdaptiveLogo`

*Note: General-purpose UI components like `DropZone`, `PhoneInput`, and virtualized tables reside in `@cap/layout` (and will be moved to `@cap/ui`).*

### `DESCRIPTION.md`

This file is documentation only and is not part of the runtime package.

## Preset System

The package ships a fairly large preset catalog in `types/presets.ts`.

Examples include:

- `default`
- `flat-design`
- `material-design`
- `neumorphism`
- `glassmorphism`
- `pure-brutalism`
- `minimalism`
- `dark-ui`
- `cyberpunk-hud`
- `liquid-organic`
- `retro-y2k`
- `immersive-3d`
- `neo-brutalism`
- `modern-skeuomorphic`
- `godlio-premium`

Presets can override:

- token values
- global effect mode
- effect configuration
- component-level style mappings

`useTenantTheme()` and `mergeTheme.ts` are the main entry points for applying them.

## Public API Summary

The most important public surfaces in the current source tree are:

- `TenantThemeProvider`
- `DesignSystemProvider`
- `useTenantThemeContext`
- `useTenantThemeState`
- `useTenantThemeStatus`
- `useTenantThemeActions`
- `useTenantTheme`
- `useDerivedMuiTheme`
- `composeMuiTheme`
- `THEME_PRESETS`
- `DEFAULT_THEME_CONFIG`
- the styled effect component family
- shared UI components from `components/`
- asset/theme exports from `assets/themes/`

## Current Shape vs. Older Documentation

The previous description was outdated in several ways:

- it referenced folders that do not exist now, such as `tokens/`, `menu/`, and a top-level `theme/`
- it described only glass and neumorphism, but the code now supports several additional effect modes
- it implied a broader exported component surface than the package currently exposes
- it did not reflect the current provider flow based on `TenantThemeConfig` and `composeMuiTheme()`

## Practical Takeaway

If you are navigating this package today, treat it as a tenant-theme engine plus a shared UI toolkit:

- `types/`, `context/`, `hooks/`, `utils/`, and `store/` define the theme model
- `assets/themes/`, `config/`, and `overrides/` define the MUI integration layer
- `styled/`, `styles/`, and `components/` provide reusable UI primitives

That is the current structure represented by the code under `src/`.
