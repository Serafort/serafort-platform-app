import { styled } from '@cap/theme'
import {
  footerTokens,
  getFooterElevationShadow,
  getFooterBorderBlockStart,
  getFooterZIndex,
} from '@cap/theme'
import type { CSSObject } from '@emotion/styled'
import { horizontalLayoutClasses } from '../../utils/layoutClasses'

type StyledFooterProps = {
  overrideStyles?: CSSObject
  layoutPadding: string
  compactContentWidth: number
}

const StyledFooter = styled('footer')<StyledFooterProps>(({ theme, layoutPadding, compactContentWidth, overrideStyles }) => ({
  [`&.${horizontalLayoutClasses.footerFixed}`]: {
    position: footerTokens.positioning.sticky,
    insetBlockEnd: footerTokens.positioning.insetBlockEnd,
    zIndex: getFooterZIndex(theme),
    backgroundColor: theme.palette.background.paper,
    boxShadow: getFooterElevationShadow(theme),

    '[data-skin="bordered"] &': {
      boxShadow: footerTokens.borderedSkin.boxShadow,
      borderBlockStart: getFooterBorderBlockStart(theme),
    },
  },

  [`&.${horizontalLayoutClasses.footerContentCompact} .${horizontalLayoutClasses.footerContentWrapper}`]: {
    marginInline: footerTokens.layout.compactMarginInline,
    maxInlineSize: `${compactContentWidth}px`,
  },

  [`& .${horizontalLayoutClasses.footerContentWrapper}`]: {
    paddingBlock: footerTokens.layout.paddingBlock,
    paddingInline: layoutPadding,
  },

  ...(overrideStyles as any),
}))

export default StyledFooter
