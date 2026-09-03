import styled from '@emotion/styled'
import type { CSSObject } from '@emotion/styled'
import { menuClasses } from '../../utils/menuClasses'
import { menuButtonStyles } from './menuButtonStyles'

type StyledVerticalMenuItemProps = {
  $level: number
  $disabled?: boolean
  $isCollapsed?: boolean
  $isPopoutWhenCollapsed?: boolean
  $buttonStyles?: CSSObject
  $menuItemStyles?: CSSObject
  $rootStyles?: CSSObject
}

const StyledVerticalMenuItem = styled.li<StyledVerticalMenuItemProps>`
  position: relative;
  ${({ $menuItemStyles }) => $menuItemStyles};
  ${({ $rootStyles }) => $rootStyles};

  > .${menuClasses.button} {
    ${({ $level, $disabled, $isCollapsed, $isPopoutWhenCollapsed }) =>
      menuButtonStyles({
        level: $level,
        disabled: $disabled,
        isCollapsed: $isCollapsed,
        isPopoutWhenCollapsed: $isPopoutWhenCollapsed,
      })};
    ${({ $buttonStyles }) => $buttonStyles};
  }
`

export default StyledVerticalMenuItem
