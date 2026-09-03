import styled from '@emotion/styled'
import { getVerticalNavBackdropColor } from '@cap/theme'
import type { VerticalNavProps } from '../vertical-menu'

type StyledBackdropProps = Pick<VerticalNavProps, 'backdropColor'>

const StyledBackdrop = styled.div<StyledBackdropProps>`
  position: fixed;
  inset-inline-start: 0;
  inset-block-start: 0;
  inset-inline-end: 0;
  inset-block-end: 0;
  z-index: ${({ theme }: any) => (theme?.zIndex?.drawer ? theme.zIndex.drawer - 1 : 1199)};
  background-color: ${({ backdropColor, theme }) => backdropColor || getVerticalNavBackdropColor(theme as any)};
  touch-action: none;
`

export default StyledBackdrop
