import { styled } from '@mui/material/styles'
import { mainTokens, effectCanvasCss } from '@cap/theme'

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
  // An effect may publish its own ground - neumorphism has to, since its
  // relief only reads when the panel and the canvas behind it are the same
  // colour. Unset for every other effect, leaving the theme's own canvas.
  backgroundColor: `var(--effect-canvas-bg, ${theme.palette.background.default})`,
  // The content area also carries the ambient wash a blur-based effect asks
  // for. Frosted panels sitting on a flat colour blur that flat colour, which
  // looks precisely like not being frosted at all - the wash is what gives the
  // blur something to reveal. It resolves to `none` for every other effect,
  // leaving the canvas the flat colour above.
  ...effectCanvasCss,
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
