# Rule 05: Modern UI, Design Tokens & Visual Effects

This rule governs Material UI v7 token composition, multi-tenant branding, visual presets, and effect engines in the **Serafort CAP Multi-Tenant Framework**.

---

## 1. Three-Layer Token-Driven Design System

Branding and UI styles must follow the three-tier token hierarchy:

1. **Primitive Tokens**:
   - Raw color values, spacing scales (4pt/8pt), typography rules, border radii, shadows, and z-index definitions.
2. **Semantic Tokens**:
   - Contextual assignments (`--color-primary`, `--color-surface`, `--color-border`, `text.primary`, `background.paper`).
3. **Component Overrides**:
   - Applied via `getComponentOverrides(theme)` in `packages/theme` to ensure standard MUI components (Button, Card, Input, Table, Menu) reflect tenant styles automatically.

### Zero Hardcoded Colors Rule
- Never use hardcoded hex strings (e.g. `#ffffff`, `#1976d2`) or ad-hoc rgb values directly in component `sx` props or styles.
- Always use:
  - `sx={{ color: 'text.secondary', bgcolor: 'background.paper', borderColor: 'divider' }}`
  - Theme palette accessors: `(theme) => theme.palette.primary.main` or `alpha(theme.palette.primary.main, 0.12)`.
  - CSS custom properties: `var(--border-color)`, `var(--glass-blur)`.

---

## 2. Dynamic Visual Effect Engines

The design system supports 15 tenant presets and 6 specialized visual effect generators:

1. **Glassmorphism**:
   - Backdrop blur (`backdropFilter: 'blur(var(--glass-blur, 16px))'`), translucent surface background, and luminous border highlight.
2. **Neumorphism**:
   - Dual light/dark relief shadows computed dynamically via `computeNeumorphismShadows()` based on the surface background luminance.
3. **Bento UI**:
   - High border radius (`borderRadius: '16px'`), modular card groupings, and subtle accent pill tags.
4. **Brutalism & Neo-Brutalism**:
   - High-contrast solid borders (`border: '2px solid var(--brutal-border-color)'`), hard drop-shadows with zero blur (`boxShadow: '4px 4px 0px #000'`).
5. **Organic & Immersive 3D**:
   - Smooth non-standard border curvatures and subtle CSS 3D perspective transforms.

---

## 3. Dark & Light Mode Management

1. **Cookie & Store Synchronization**:
   - Theme mode (`'light'`, `'dark'`, `'system'`) is persisted in the `serafort-settings` cookie and synchronized with the Zustand `SettingsSlice`.
   - When mode is `'system'`, dynamically resolve using the browser's `prefers-color-scheme`.
2. **Contrast Guarantees**:
   - In Dark Mode, surfaces must maintain elevated tone hierarchies (`background.default` vs `background.paper`).
   - Text must satisfy WCAG AA contrast (at least 4.5:1 ratio against background).
