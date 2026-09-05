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
  /*
   * This backdrop is rendered *inside* <StyledVerticalNav> (the drawer
   * <aside>), as a sibling that comes right before StyledVerticalNavContainer
   * (z-index: 10) - not as a page-level sibling of the drawer. Because the
   * aside is itself position: fixed with its own z-index (1200, or +5 while
   * toggled open on a small screen - see StyledVerticalNav), it establishes
   * its own local stacking context: this z-index is only ever compared
   * against that one sibling, never against the navbar or anything else on
   * the page. The whole aside subtree - backdrop included - already sits
   * above the navbar and the rest of the page as a unit, purely by virtue of
   * the aside's own z-index.
   *
   * A value here anywhere close to the *page-level* drawer scale (as a
   * previous version of this file used, reasoning about the navbar) instead
   * beats the sibling container locally and paints the drawer's own content
   * over with the backdrop's dimming tint - the entire drawer, not just the
   * page behind it, reads as dimmed. It only needs to clear that one
   * sibling's z-index of 10.
   */
  z-index: 1;
  background-color: ${({ backdropColor, theme }) =>
    backdropColor || getVerticalNavBackdropColor(theme as any)};
  touch-action: none;
`

export default StyledBackdrop
