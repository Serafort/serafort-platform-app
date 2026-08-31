# CAP Tenant Theme & Effect System

This document outlines the design token architecture, theme compilation pipeline, tenant branding customization, and visual effect generation system in `@cap/theme`.

---

## 1. Overview

The theme system allows multi-tenant applications to adopt completely distinct visual identities without duplicating component code.

### Supported Design Languages & Styles
- **Material Design**: Standard elevation, clear hierarchy, subtle shadows.
- **Glassmorphism**: Translucent frosted glass panels, backdrop blurs, luminous borders.
- **Liquid Glass**: Multi-layer specular highlights, inner refraction shadows, saturated backdrop blurs.
- **Neumorphism (Soft UI)**: Dual inner/outer soft shadows, relief optics.
- **Bento UI**: High border radius, grid-aligned card containers.
- **Pure Brutalism & Neo-Brutalism**: Thick solid black borders, hard offset shadows, high contrast.
- **Minimalist**: High negative space, crisp typography, clean lines.
- **Dark UI / Obsidian**: Sophisticated OLED dark mode with neon accents.
- **Liquid Organic**: Fluid, asymmetrical border radii and soft blurs.
- **Immersive 3D**: Multi-layered depth projections and spatial perspectives.

---

## 2. Token Architecture

Theme configuration is defined by `TenantThemeConfig`:

```ts
export interface TenantThemeConfig {
  id?: string;
  organizationId: string;
  name: string;
  preset?: ThemePresetId;
  tokens: PrimitiveTokens;
  effects: EffectConfig;
  components: ComponentStyles;
  version: string;
}
```

### 1. Primitive Tokens (`PrimitiveTokens`)
- `colors`: Primary, secondary, background, surface, text, textMuted, border, success, warning, error, info. Each color supports value, light, dark, and HSL values.
- `spacing`: Scale from `xs` (0.25rem) to `2xl` (3rem).
- `borderRadius`: Scale from `none` (0) to `full` (9999px).
- `typography`: `fontFamily` (sans, mono), `fontSize` (`xs` to `4xl`), `fontWeight`, `lineHeight`.
- `shadows`: Elevation scale from `xs` to `xl`.

---

## 3. Theme Compilation Pipeline

Theme generation is driven by `composeMuiTheme()`:

1. **Preset / Tenant Token Merge**: Default primitive tokens are merged with tenant-specific overrides.
2. **Palette Resolution**: Status colors and primary/secondary colors are expanded. Status color variants (light, dark, opacities) are calculated dynamically via MUI color manipulation functions (`lighten`, `darken`).
3. **Typography Composition**: Merges custom font families (e.g. Inter, JetBrains Mono) with heading and body specifications.
4. **Component Overrides**: Applies component-level override rules (`getComponentOverrides`) for MUI Buttons, Cards, Inputs, Tables, and Menus based on current tenant settings.
5. **CSS Variable Bridge**: `applyThemeVariablesSync()` flattens token values into CSS custom properties (`--color-primary`, `--radius-md`, `--glass-blur`, etc.) injected into document root. In the shell, `ThemeBridge` coalesces rapid config changes (e.g. preset switching) into a single `requestAnimationFrame` write and removes variables a previous config emitted but the new one no longer produces (e.g. `--glass-*`/`--effect-*` on returning to a non-effect preset).

---

## 4. System Mode & Dark Mode Resolution

The theme system resolves theme mode dynamically:
- `'light'`: Forces light palette.
- `'dark'`: Forces dark palette.
- `'system'`: Monitors system OS preference via `window.matchMedia('(prefers-color-scheme: dark)')` and updates automatically when the OS mode changes.

---

## 5. Theme Tokens, 4 Key UI Principles & Laws of UX Alignment

The `@cap/theme` design token pipeline is engineered directly against core visual principles and foundational psychological heuristics (see [`laws_of_ux.md`](./laws_of_ux.md) for the complete reference):

### 4 Key Principles Guiding UI in Token Composition
- **Visual Hierarchy**: Guiding the eye to the most important information first via layered typography tokens (`fontSizes`, `fontWeights`) and surface elevation scales.
- **Contrast**: Making elements legible and distinct from one another using computed color variants and WCAG-compliant palette pairs.
- **Alignment**: Creating visual order to reduce the user's mental effort with consistent 4px/8px spacing scales and automatic RTL property flipping.
- **Proximity**: Grouping related elements to indicate shared function through cohesive component overrides and card containers.

### Psychological Heuristics Mapping
- **Aesthetic-Usability Effect**: High-fidelity theme presets and visual effects (liquid glass, neumorphism, bento) foster user confidence and perceived reliability.
- **Doherty Threshold (<400ms)**: Transition tokens and `ThemeBridge` DOM synchronization are bounded to <300ms / 60fps single-frame execution.
- **Von Restorff Effect**: Semantic color tokens enforce strong visual distinction between default surface actions and primary/critical highlights.
- **Law of Similarity & Common Region**: Component override composition ensures consistent shape, typography, and card boundaries across all dynamically assembled feature modules.


