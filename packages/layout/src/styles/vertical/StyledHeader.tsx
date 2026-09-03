import { styled, alpha } from '@mui/material/styles'
import {
  headerTokens,
  getHeaderElevationShadow,
  getHeaderBorderInline,
  getHeaderBorderBlockEnd,
  getHeaderBorderFull,
  getFloatingNavbarInlineSize,
  getCompactFloatingMaxInlineSize,
  getHeaderFloatingMask,
} from '@cap/theme'
import type { Theme } from '@mui/material/styles'
import type { CSSObject } from '@emotion/styled'
import { verticalLayoutClasses } from '../../utils/layoutClasses'

type StyledHeaderProps = {
  theme?: Theme
  overrideStyles?: CSSObject
  layoutPadding: string
  compactContentWidth: number
}

const StyledHeader = styled('header')<StyledHeaderProps>(({
  theme,
  layoutPadding,
  compactContentWidth,
  overrideStyles,
}: any) => {
  return {
    minBlockSize: headerTokens?.layout?.minBlockSize || '64px',

    [`&.${verticalLayoutClasses.headerContentCompact}`]: {
      [`&.${verticalLayoutClasses.headerFloating} .${verticalLayoutClasses.navbar}, &.${verticalLayoutClasses.headerDetached} .${verticalLayoutClasses.navbar}, &.${verticalLayoutClasses.headerAttached} .${verticalLayoutClasses.navbar}`]:
        {
          marginInline: headerTokens?.layout?.compactMarginInline || 'auto',
        },

      [`&.${verticalLayoutClasses.headerFloating} .${verticalLayoutClasses.navbar}, &.${verticalLayoutClasses.headerFixed}.${verticalLayoutClasses.headerDetached} .${verticalLayoutClasses.navbar}`]:
        {
          maxInlineSize: getCompactFloatingMaxInlineSize(compactContentWidth, layoutPadding),
        },

      [`.${verticalLayoutClasses.navbar}`]: {
        maxInlineSize: `${compactContentWidth}px`,
      },
    },

    [`&.${verticalLayoutClasses.headerFixed}`]: {
      position: headerTokens?.positioning?.sticky || 'sticky',
      insetBlockStart: headerTokens?.positioning?.insetBlockStart || '0px',
      zIndex: theme?.zIndex?.appBar || 1100,

      [`&:not(.${verticalLayoutClasses.headerBlur}).scrolled.${verticalLayoutClasses.headerAttached}, &:not(.${verticalLayoutClasses.headerBlur}).scrolled.${verticalLayoutClasses.headerDetached} .${verticalLayoutClasses.navbar}`]:
        {
          backgroundColor: theme?.palette?.background?.paper || '#fff',
        },

      [`&.${verticalLayoutClasses.headerDetached} .${verticalLayoutClasses.navbar}`]: {
        boxShadow: getHeaderElevationShadow(theme),
        borderEndStartRadius: `${theme?.shape?.borderRadius || 6}px`,
        borderEndEndRadius: `${theme?.shape?.borderRadius || 6}px`,

        '[data-skin="bordered"] &': {
          boxShadow: headerTokens?.borderedSkin?.boxShadow || 'none',
          borderInline: getHeaderBorderInline(theme),
          borderBlockEnd: getHeaderBorderBlockEnd(theme),
        },
      },

      [`&.${verticalLayoutClasses.headerDetached}, &.${verticalLayoutClasses.headerFloating}`]: {
        pointerEvents: headerTokens?.interaction?.containerPointerEvents || 'none',

        [`& .${verticalLayoutClasses.navbar}`]: {
          pointerEvents: headerTokens?.interaction?.navbarPointerEvents || 'auto',
        },
      },

      [`&.${verticalLayoutClasses.headerBlur}`]: {
        [`&.${verticalLayoutClasses.headerAttached} .${verticalLayoutClasses.navbar}, &.${verticalLayoutClasses.headerDetached} .${verticalLayoutClasses.navbar}, &.${verticalLayoutClasses.headerFloating} .${verticalLayoutClasses.navbar}`]:
          {
            backdropFilter: headerTokens?.glassmorphism?.backdropFilter || 'blur(8px)',
            backgroundColor: alpha(
              theme?.palette?.background?.paper || '#ffffff',
              headerTokens?.glassmorphism?.paperOpacity || 0.85,
            ),
          },

        [`&.${verticalLayoutClasses.headerFloating}`]: {
          '&:before': {
            content: headerTokens?.floatingOverlay?.content || '""',
            position: headerTokens?.floatingOverlay?.position || 'absolute',
            zIndex: headerTokens?.floatingOverlay?.zIndex || -1,
            insetBlockStart: headerTokens?.floatingOverlay?.insetBlockStart || '0',
            insetInline: headerTokens?.floatingOverlay?.insetInline || '0',
            blockSize: headerTokens?.floatingOverlay?.blockSize || '100%',
            background: `linear-gradient(
              ${headerTokens?.floatingOverlay?.gradientAngle || '180deg'},
              ${alpha(theme?.palette?.background?.default || '#ffffff', headerTokens?.floatingOverlay?.stops?.topAlpha || 0.7)} ${headerTokens?.floatingOverlay?.stops?.topPosition || '0%'},
              ${alpha(theme?.palette?.background?.default || '#ffffff', headerTokens?.floatingOverlay?.stops?.midAlpha || 0.4)} ${headerTokens?.floatingOverlay?.stops?.midPosition || '50%'},
              ${alpha(theme?.palette?.background?.default || '#ffffff', headerTokens?.floatingOverlay?.stops?.bottomAlpha || 0)}
            )`,
            backdropFilter: headerTokens?.floatingOverlay?.backdropFilter || 'blur(8px)',
            mask: getHeaderFloatingMask(theme),
          },
        },
      },

      [`&.${verticalLayoutClasses.headerAttached}.scrolled`]: {
        boxShadow: getHeaderElevationShadow(theme),

        '[data-skin="bordered"] &': {
          boxShadow: headerTokens?.borderedSkin?.boxShadow || 'none',
          borderBlockEnd: getHeaderBorderBlockEnd(theme),
        },
      },

      [`&.${verticalLayoutClasses.headerFloating} .${verticalLayoutClasses.navbar}, &:not(.${verticalLayoutClasses.headerFloating}).${verticalLayoutClasses.headerAttached} .${verticalLayoutClasses.navbar}, &:not(.${verticalLayoutClasses.headerFloating}).${verticalLayoutClasses.headerDetached} .${verticalLayoutClasses.navbar}`]:
        {
          transition:
            theme?.transitions?.create?.([
              'box-shadow',
              'border-width',
              'padding-inline',
              'backdrop-filter',
            ]) || 'all 0.2s ease',
        },

      [`&:not(.${verticalLayoutClasses.headerFloating}).${verticalLayoutClasses.headerAttached} .${verticalLayoutClasses.navbar}, &:not(.${verticalLayoutClasses.headerFloating}).${verticalLayoutClasses.headerDetached}.scrolled .${verticalLayoutClasses.navbar}`]:
        {
          paddingInline: headerTokens?.layout?.paddingInline || '1.5rem',
        },
    },

    [`&.${verticalLayoutClasses.headerFloating}`]: {
      paddingBlockStart: headerTokens?.layout?.floatingPaddingBlockStart || '0.75rem',

      [`.${verticalLayoutClasses.navbar}`]: {
        backgroundColor: theme?.palette?.background?.paper || '#ffffff',
        borderRadius: `${theme?.shape?.borderRadius || 6}px`,
        paddingInline: headerTokens?.layout?.paddingInline || '1.5rem',
        boxShadow: getHeaderElevationShadow(theme),

        '[data-skin="bordered"] &': {
          boxShadow: headerTokens?.borderedSkin?.boxShadow || 'none',
          border: getHeaderBorderFull(theme),
        },
      },
    },

    [`&.${verticalLayoutClasses.headerFloating} .${verticalLayoutClasses.navbar}, &.${verticalLayoutClasses.headerFixed}.${verticalLayoutClasses.headerDetached} .${verticalLayoutClasses.navbar}`]:
      {
        inlineSize: getFloatingNavbarInlineSize(layoutPadding),
      },

    [`&:not(.${verticalLayoutClasses.headerFloating}).${verticalLayoutClasses.headerStatic} .${verticalLayoutClasses.navbar}`]:
      {
        paddingInline: headerTokens?.layout?.paddingInline || '1.5rem',
      },

    [`.${verticalLayoutClasses.navbar}`]: {
      position: headerTokens?.positioning?.navbarPosition || 'relative',
      paddingBlock: headerTokens?.layout?.paddingBlock || '0.5rem',
      paddingInline: headerTokens?.layout?.paddingInline || '1.5rem',
      inlineSize: headerTokens?.layout?.fullInlineSize || '100%',
    },

    ...(overrideStyles as any),
  }
})

export default StyledHeader
