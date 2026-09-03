import { styled } from '@mui/material/styles'
import { getTenantThemeEffects } from '@cap/theme'
import {
  headerTokens,
  getHeaderElevationShadow,
  getHeaderBorderBlockEnd,
  getHeaderBlurStyles,
} from '@cap/theme'
import type { CSSObject } from '@emotion/styled'
import { horizontalLayoutClasses } from '../../utils/layoutClasses'
import { SurfaceEffectFactory } from '../../utils/buildLayoutSurfaceEffect'

type StyledHeaderProps = {
  overrideStyles?: CSSObject
  layoutPadding: string
  compactContentWidth: number
}

const StyledHeader = styled('header')<StyledHeaderProps>(({
  theme,
  layoutPadding,
  compactContentWidth,
  overrideStyles,
}) => {
  const surfaceEffect = SurfaceEffectFactory.create(getTenantThemeEffects(theme), theme)

  return {
    boxShadow: getHeaderElevationShadow(theme),
    ...surfaceEffect,

    '[data-skin="bordered"] &': {
      boxShadow: headerTokens.borderedSkin.boxShadow,
      borderBlockEnd: getHeaderBorderBlockEnd(theme),
    },

    [`&:not(.${horizontalLayoutClasses.headerBlur})`]: {
      backgroundColor: theme.palette.background.paper,
    },

    [`&.${horizontalLayoutClasses.headerBlur}`]: getHeaderBlurStyles(theme),

    [`&.${horizontalLayoutClasses.headerFixed}`]: {
      position: headerTokens.positioning.sticky,
      insetBlockStart: headerTokens.positioning.insetBlockStart,
      zIndex: theme.zIndex.appBar,
    },

    [`&.${horizontalLayoutClasses.headerContentCompact} .${horizontalLayoutClasses.navbar}`]: {
      marginInline: headerTokens.layout.compactMarginInline,
      maxInlineSize: `${compactContentWidth}px`,
    },

    [`& .${horizontalLayoutClasses.navbar}`]: {
      position: headerTokens.positioning.navbarPosition,
      minBlockSize: headerTokens.layout.minBlockSize,
      paddingBlock: headerTokens.layout.paddingBlock,
      paddingInline: layoutPadding,
    },

    ...(overrideStyles as any),
  }
})

export default StyledHeader
