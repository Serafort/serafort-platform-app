import { styled } from '@mui/material/styles'
import { effectSurfaceBackground } from '@cap/theme'
import type { VerticalNavProps } from '../../components/vertical-menu/VerticalNav'

type StyledVerticalNavBgColorContainerProps = Pick<VerticalNavProps, 'backgroundColor'>

const StyledVerticalNavBgColorContainer = styled('div')<StyledVerticalNavBgColorContainerProps>(
  ({ backgroundColor }: any) => ({
    position: 'relative',
    blockSize: '100%',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    overflowX: 'hidden',
    // This is the innermost sidebar layer, so it is the one that carries the
    // active effect: a backdrop-filter here blurs the page behind the whole
    // drawer rather than the container immediately behind it. Without an
    // effect selected --effect-bg is unset and the caller's colour stands, as
    // it always did.
    ...effectSurfaceBackground(backgroundColor || 'transparent'),
  }),
)

export default StyledVerticalNavBgColorContainer
