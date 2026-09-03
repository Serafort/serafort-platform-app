// Third-party Imports
import styled from '@emotion/styled'

// Type Imports
import type { RootStylesType } from '../../types'

const StyledHorizontalSubMenuContentWrapper = styled.div<{
  $rootStyles?: RootStylesType['rootStyles']
}>`
  z-index: ${({ theme }: any) => (theme?.zIndex?.drawer ? theme.zIndex.drawer + 1 : 1201)};

  ${({ $rootStyles }) => $rootStyles};
`

export default StyledHorizontalSubMenuContentWrapper
