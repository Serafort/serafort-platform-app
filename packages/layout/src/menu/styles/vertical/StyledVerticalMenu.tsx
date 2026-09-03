// Third-party Imports
import { styled } from '@cap/theme'

// Type Imports
import type { MenuProps } from '../../components/vertical-menu/Menu'

// Util Imports
import { menuClasses } from '../../utils/menuClasses'

const StyledVerticalMenu = styled('nav')<Pick<MenuProps, 'rootStyles'>>`
  & > ul > :first-of-type {
    margin-block-start: 0;
  }
  &.${menuClasses.root} {
    ${({ rootStyles }: Pick<MenuProps, 'rootStyles'>) => rootStyles}
  }
`

export default StyledVerticalMenu
