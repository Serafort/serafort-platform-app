import styled from '@emotion/styled'
import type { VerticalNavState } from '../../contexts/verticalNavContext'
import type { VerticalNavProps } from '../../components/vertical-menu/VerticalNav'
import { horizontalNavClasses, menuClasses, verticalNavClasses } from '../../utils/menuClasses'

type StyledVerticalNavProps = VerticalNavProps &
  Pick<VerticalNavState, 'isBreakpointReached' | 'collapsing' | 'expanding' | 'transitionDuration'>

const StyledVerticalNav = styled('aside')<StyledVerticalNavProps>`
  ${({ scrollWithContent }: StyledVerticalNavProps) =>
    !scrollWithContent &&
    `
    position: sticky;
    inset-block-start: 0;
    block-size: 100dvh;
  `}
  z-index: ${({ theme }: { theme?: any }) => theme?.zIndex?.drawer || 1200};

  /* Transition */
  transition-property: inline-size, min-inline-size, margin-inline-start, inset-inline-start;
  transition-duration: ${({ transitionDuration }: StyledVerticalNavProps) =>
    `${transitionDuration}ms`};
  transition-timing-function: ease-in-out;

  /* Width & Min Width & Margin */
  inline-size: ${({ width }: StyledVerticalNavProps) => `${width}px`};
  min-inline-size: ${({ width }: StyledVerticalNavProps) => `${width}px`};
  &.${verticalNavClasses.collapsed} {
    inline-size: ${({ collapsedWidth }: StyledVerticalNavProps) => `${collapsedWidth}px`};
    min-inline-size: ${({ collapsedWidth }: StyledVerticalNavProps) => `${collapsedWidth}px`};
  }

  &.${verticalNavClasses.collapsing}, &.${verticalNavClasses.expanding} {
    pointer-events: none;
  }

  /* Collapsed & Toggled */
  &.${verticalNavClasses.breakpointReached} {
    position: fixed;
    block-size: 100%;
    inset-block-start: 0;
    inset-inline-start: ${({ width }: StyledVerticalNavProps) => `-${width}px`};
    z-index: ${({ theme }: { theme?: any }) =>
      theme?.zIndex?.drawer ? theme.zIndex.drawer + 5 : 1205};
    margin: 0;
    &.${verticalNavClasses.collapsed} {
      inset-inline-start: -${({ collapsedWidth }: StyledVerticalNavProps) => `${collapsedWidth}px`};
    }
    &.${verticalNavClasses.toggled} {
      inset-inline-start: 0;
    }
  }

  ${({ width, isBreakpointReached }: StyledVerticalNavProps) =>
    !isBreakpointReached &&
    `
    &.${verticalNavClasses.toggled} {
      margin-inline-start: -${width}px;
    }
  `}

  &.${horizontalNavClasses.root} .${menuClasses.root} > ul {
    flex-direction: column;
    align-items: stretch;
  }

  /* User Styles */
  ${({ customStyles }: StyledVerticalNavProps) => customStyles}
`

export default StyledVerticalNav
