# @cap/theme

This package serves as the **single source of truth** for all UI/UX concerns across the boilerplate.

## Overview

It handles:

1. **Design Tokens**: Colors, typography, spacing, shapes, and z-indexes (primitive tokens in `src/types/designTokens.ts`, semantic z-index scale in `src/assets/themes/definitions/zIndex.ts`).
2. **Global Styles**: Global CSS classes defined via Emotion (`src/styles/GlobalStyles.tsx`).
3. **MUI Theme Overrides**: Complete UI styling overrides (`src/overrides/`) and runtime theme composition (`src/utils/composeMuiTheme.ts`).
4. **Theme Configuration Context**: Tenant-driven dynamic theming (`src/context/`).
5. **Shared UI Components**: Complex styling layout constructs like GlassCard or GlassButton.

## Brand Source of Truth

Every brand colour, font and role token in this package is derived from the
**Serafort brand kit** (`serafort_brand/brand-kit/tokens/tokens.json` and
`tokens.css`), transcribed into `src/tokens/brand.ts`:

| Brand kit                          | Lives in                            |
| ---------------------------------- | ----------------------------------- |
| Brand blues + neutrals + semantics | `src/tokens/brand.ts`               |
| Derived 50-950 ramps               | `src/tokens/primitives.ts`          |
| Surface / effect / state roles     | `src/tokens/semantics.ts`           |
| MUI light + dark palettes          | `src/assets/themes/{light,dark}.ts` |
| Tenant default colours             | `src/config/themeConfig.ts`         |
| `serafort` / `serafort-dark`       | `src/types/presets.ts`              |

When the brand kit changes, **edit `src/tokens/brand.ts` first** - the ramps and
role tokens read from it. Only the interpolated in-between ramp stops (which
have no brand-kit equivalent) are hand-authored.

`GlobalStyles` also emits the brand kit's own `--sf-*` custom-property layer on
`:root`, mode-aware, so markup lifted straight from the brand kit renders
on-brand inside the app shell.

Brand assets (favicons, logo lockups, OG image) are served from
`app/public/brand/`; the PWA manifest lives in the `VitePWA` block of
`app/vite.config.ts` and the `<head>` tags in `app/index.html`. Those three plus
`semanticSurfaces.dark.canvas` all carry the ink value `#031433` - keep them in
sync.

## Consuming Design Tokens

All packages (e.g. `platform-core`, `layout`) should import tokens directly from `@cap/theme` and apply them using `@emotion/styled` or MUI's `sx` prop.

**Typescript example:**

```tsx
import { styled } from "@mui/material/styles";
import { colors, zIndexScale } from "@cap/theme";

export const StyledHeader = styled("header")(({ theme }) => ({
  backgroundColor: colors.primary.main, // Direct token import
  zIndex: zIndexScale.layout.header,

  // Or referencing through the MUI theme object
  color: theme.palette.text.primary,
}));
```

## Adding a Preset

To add a new theme preset, open the presets catalog (`src/types/presets.ts` where the `THEME_PRESETS` dictionary lives) and add a configuration conforming to `TenantThemeConfig`:

```ts
export const THEME_PRESETS = {
  "my-custom-preset": {
    metadata: {
      name: "My Preset",
      preset: "my-custom-preset",
    },
    tokens: {
      colors: {
        primary: { value: "#1a73e8" },
        background: { value: "#f4f5f7" },
      },
    },
    effects: {
      glassmorphism: { enabled: true, blur: "10px", opacity: 0.5 },
    },
    preview: {
      primaryColor: "#1a73e8",
      secondaryColor: "#ffffff",
      backgroundColor: "#f4f5f7",
    },
  },
};
```
