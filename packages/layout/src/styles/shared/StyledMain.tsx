import { styled } from '@cap/theme'
import { mainTokens } from '@cap/theme'

/**
 * StyledMain
 * Structural wrapper for main app content area.
 * Structural layout tokens (layoutPadding, compactContentWidth) are supplied
 * dynamically via useLayoutTokens().
 */
type StyledMainProps = {
  isContentCompact: boolean
  layoutPadding: string
  compactContentWidth: number
}

const StyledMain = styled('main', {
  shouldForwardProp: (prop) => !['isContentCompact', 'layoutPadding', 'compactContentWidth'].includes(prop as string),
})<StyledMainProps>(({ theme, isContentCompact, compactContentWidth }: any) => ({
  flexGrow: mainTokens.layout.flexGrow,
  // padding: layoutPadding
  padding: `0px !important`,
  minHeight: mainTokens.layout.minHeight,
  backgroundColor: theme.palette.background.default,
  transition: theme.transitions.create(['padding', 'max-width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(isContentCompact && {
    marginInline: mainTokens.layout.compactMarginInline,
    maxInlineSize: `${compactContentWidth}px`,
  }),
}))

export default StyledMain
