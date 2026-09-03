# @cap/theme

This package serves as the **single source of truth** for all UI/UX concerns across the boilerplate.

## Overview
It handles:
1. **Design Tokens**: Colors, typography, spacing, shapes, and z-indexes (primitive tokens in `src/types/designTokens.ts`, semantic z-index scale in `src/assets/themes/definitions/zIndex.ts`).
2. **Global Styles**: Global CSS classes defined via Emotion (`src/styles/GlobalStyles.tsx`).
3. **MUI Theme Overrides**: Complete UI styling overrides (`src/overrides/`) and runtime theme composition (`src/utils/composeMuiTheme.ts`).
4. **Theme Configuration Context**: Tenant-driven dynamic theming (`src/context/`).
5. **Shared UI Components**: Complex styling layout constructs like GlassCard or GlassButton.

## Consuming Design Tokens
All packages (e.g. `platform-core`, `layout`) should import tokens directly from `@cap/theme` and apply them using `@emotion/styled` or MUI's `sx` prop.

**Typescript example:**
```tsx
import { styled } from '@mui/material/styles';
import { colors, zIndexScale } from '@cap/theme';

export const StyledHeader = styled('header')(({ theme }) => ({
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
  'my-custom-preset': {
    metadata: {
      name: 'My Preset',
      preset: 'my-custom-preset'
    },
    tokens: {
      colors: {
        primary: { value: '#1a73e8' },
        background: { value: '#f4f5f7' }
      }
    },
    effects: {
      glassmorphism: { enabled: true, blur: '10px', opacity: 0.5 }
    },
    preview: {
      primaryColor: '#1a73e8',
      secondaryColor: '#ffffff',
      backgroundColor: '#f4f5f7'
    }
  }
}
```
