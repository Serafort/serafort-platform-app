import styled from '@emotion/styled'
import { menuTokens, getNavHeaderCollapsedPaddingInline } from '@cap/theme'
import type { ChildrenType } from '../../types'
import type { VerticalNavContextProps } from '../../contexts/verticalNavContext'
import { useVerticalNav } from '../../contexts/verticalNavContext'
import { verticalNavClasses } from '../../utils/menuClasses'

type StyledNavHeaderProps = {
  isHovered?: VerticalNavContextProps['isHovered']
  isCollapsed?: VerticalNavContextProps['isCollapsed']
  collapsedWidth?: VerticalNavContextProps['collapsedWidth']
  transitionDuration?: VerticalNavContextProps['transitionDuration']
}

const StyledNavHeader = styled.div<StyledNavHeaderProps>`
  padding: ${({ theme }: any) => menuTokens?.vertical?.header?.paddingDefault || '15px'};
  padding-inline-start: ${({ theme }: any) =>
    menuTokens?.vertical?.header?.paddingInlineStart || '20px'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: ${({ transitionDuration }) => `padding-inline ${transitionDuration}ms ease-in-out`};

  ${({ isHovered, isCollapsed, collapsedWidth }) =>
    isCollapsed &&
    !isHovered &&
    `padding-inline: ${getNavHeaderCollapsedPaddingInline(collapsedWidth)};`}
`

const NavHeader = ({ children }: ChildrenType) => {
  // Hooks
  const { isHovered, isCollapsed, collapsedWidth, transitionDuration } = useVerticalNav()

  return (
    <StyledNavHeader
      className={verticalNavClasses.header}
      isHovered={isHovered}
      isCollapsed={isCollapsed}
      collapsedWidth={collapsedWidth}
      transitionDuration={transitionDuration}
    >
      {children}
    </StyledNavHeader>
  )
}

export default NavHeader
