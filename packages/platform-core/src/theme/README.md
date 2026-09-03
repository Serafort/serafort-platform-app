# Theme Module (platform-core)

This module provides **runtime theme composition** for the application.

## Relationship with @cap/theme

| Package | Purpose | Contains |
|---------|---------|----------|
| `@cap/theme` | **Design System** | MUI component overrides, styled variants, design tokens, theme utilities |
| `@cap/platform-core/theme` | **Runtime Composer** | Combines design system with app-specific spacing, shadows, layout config |

### What this module does:
1. Imports `coreOverrides` from `@cap/theme` for MUI component styling
2. Applies app-specific `spacing`, `shadows`, `customShadows`
3. Configures `shape` (border radius values)
4. Sets `zIndex` scale from `@cap/theme`
5. Provides default `mainColorChannels` for theming

### When to make changes:

**Edit `@cap/theme`** when:
- Adding/modifying MUI component overrides
- Changing design tokens (colors, typography)
- Adding new styled variants (Bento, Glass, Neu, etc.)

**Edit `platform-core/theme`** when:
- Adjusting spacing scale for the app
- Customizing shadow depths
- Changing border radius defaults

## Usage

```typescript
import theme from '@cap/platform-core/theme'
import { Settings } from '@cap/platform-core'

const muiTheme = theme(settings, 'light', 'ltr')
```

## See Also
- `packages/theme/src/` - Design system source
- `packages/platform-core/src/configs/themeConfig.ts` - Default theme configuration
