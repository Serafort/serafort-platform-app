import styled from '@emotion/styled'
import { menuTokens, getSubmenuPopoutShadow } from '@cap/theme'
import type { SubMenuContentProps } from '../../components/horizontal-menu/SubMenuContent'

const StyledHorizontalSubMenuContent = styled.div<SubMenuContentProps>`
  inline-size: ${menuTokens.horizontal.item.popoutSubmenuInlineSize};
  border-radius: ${({ theme }: any) => `${theme?.shape?.borderRadius || 4}px`};
  box-shadow: ${({ theme }: any) => getSubmenuPopoutShadow(theme)};
  outline: none;
  box-sizing: border-box;
  background-color: ${({ theme }: any) => theme?.palette?.background?.paper || '#ffffff'};
  overflow: hidden;

  ${({ browserScroll, top }) =>
    browserScroll && `overflow-y: auto; max-block-size: calc(100dvh - ${top}px);`}
  ${({ $rootStyles }) => $rootStyles};
`

export default StyledHorizontalSubMenuContent
