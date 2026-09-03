import { styled } from '@cap/theme'
import {
  footerTokens,
  getFooterElevationShadow,
  getFooterBorderBlockStart,
  getFooterDetachedBorderedStyles,
  getFooterZIndex,
} from '@cap/theme'
import type { CSSObject } from '@emotion/styled'
import { verticalLayoutClasses } from '../../utils/layoutClasses'

type StyledFooterProps = {
  overrideStyles?: CSSObject
  layoutPadding: string
  compactContentWidth: number
}

const StyledFooter = styled('footer')<StyledFooterProps>(({ theme, layoutPadding, compactContentWidth, overrideStyles }) => ({
  [`&.${verticalLayoutClasses.footerContentCompact}`]: {
    [`&.${verticalLayoutClasses.footerDetached}`]: {
      marginInline: footerTokens.layout.compactMarginInline,
      maxInlineSize: `${compactContentWidth}px`,
    },

    [`&.${verticalLayoutClasses.footerAttached} .${verticalLayoutClasses.footerContentWrapper}`]: {
      marginInline: footerTokens.layout.compactMarginInline,
      maxInlineSize: `${compactContentWidth}px`,
    },
  },

  [`&.${verticalLayoutClasses.footerFixed}`]: {
    position: footerTokens.positioning.sticky,
    insetBlockEnd: footerTokens.positioning.insetBlockEnd,
    zIndex: getFooterZIndex(theme),

    [`&.${verticalLayoutClasses.footerAttached}, &.${verticalLayoutClasses.footerDetached} .${verticalLayoutClasses.footerContentWrapper}`]: {
      backgroundColor: theme.palette.background.paper,
    },

    [`&.${verticalLayoutClasses.footerDetached}`]: {
      pointerEvents: footerTokens.interaction.containerPointerEvents,
      paddingInline: layoutPadding,

      [`& .${verticalLayoutClasses.footerContentWrapper}`]: {
        pointerEvents: footerTokens.interaction.contentPointerEvents,
        boxShadow: getFooterElevationShadow(theme),
        borderStartStartRadius: `${theme.shape.borderRadius}px`,
        borderStartEndRadius: `${theme.shape.borderRadius}px`,

        '[data-skin="bordered"] &': getFooterDetachedBorderedStyles(theme),
      },
    },

    [`&.${verticalLayoutClasses.footerAttached}`]: {
      boxShadow: getFooterElevationShadow(theme),

      '[data-skin="bordered"] &': {
        boxShadow: footerTokens.borderedSkin.boxShadow,
        borderBlockStart: getFooterBorderBlockStart(theme),
      },
    },
  },

  [`& .${verticalLayoutClasses.footerContentWrapper}`]: {
    paddingBlock: footerTokens.layout.paddingBlock,
    paddingInline: layoutPadding,
  },

  ...(overrideStyles as any),
}))

export default StyledFooter
