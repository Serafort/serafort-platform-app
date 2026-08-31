import { styled } from '@mui/material/styles'
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
  shouldForwardProp: (prop) =>
    !['isContentCompact', 'layoutPadding', 'compactContentWidth'].includes(prop as string),
})<StyledMainProps>(({ theme, isContentCompact, compactContentWidth }: any) => ({
  flexGrow: mainTokens.layout.flexGrow,
  inlineSize: '100%',
  boxSizing: 'border-box',
  padding: theme.spacing(mainTokens.layout.paddingXs),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(mainTokens.layout.paddingSm),
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(mainTokens.layout.paddingLg),
  },
  minHeight: mainTokens.layout.minHeight,
  backgroundColor: theme.palette.background.default,
  transition: theme.transitions.create(['padding', 'max-width', 'inline-size'], {
    easing: 'ease-in-out',
    duration: mainTokens.layout.transitionDuration,
  }),
  ...(isContentCompact && {
    marginInline: mainTokens.layout.compactMarginInline,
    maxInlineSize: `${compactContentWidth}px`,
  }),
}))

export default StyledMain
