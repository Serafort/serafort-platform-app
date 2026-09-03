import styled from '@emotion/styled'
import { menuTokens, getSubmenuPopoutShadow, getTenantThemeEffects } from '@cap/theme'
import type { SubMenuContentProps } from '../components/vertical-menu/SubMenuContent'
import { SurfaceEffectFactory } from '../../utils/buildLayoutSurfaceEffect'

const StyledSubMenuContent = styled.div<SubMenuContentProps>`
  display: none;
  overflow: hidden;
  z-index: ${({ theme }: any) => (theme?.zIndex?.drawer ? theme.zIndex.drawer + 1 : 1201)};
  transition: ${({ transitionDuration }) => `block-size ${transitionDuration}ms ease-in-out`};
  box-sizing: border-box;

  ${({ isCollapsed, level, isPopoutWhenCollapsed, isHovered }) =>
    isCollapsed &&
    level === 0 &&
    !isPopoutWhenCollapsed &&
    !isHovered &&
    `
      block-size: 0 !important;
    `}

  ${({ isCollapsed, level, isPopoutWhenCollapsed, theme }: any) => {
    if (isCollapsed && level === 0 && isPopoutWhenCollapsed) {
      const surfaceEffect = SurfaceEffectFactory.create(getTenantThemeEffects(theme), theme)
      return {
        display: 'block',
        paddingInlineStart: '0px',
        inlineSize: menuTokens.vertical.item.popoutSubmenuInlineSize,
        borderRadius: menuTokens.vertical.item.popoutBorderRadius,
        blockSize: 'auto !important',
        transition: 'none !important',
        backgroundColor: theme?.palette?.background?.paper || '#ffffff',
        boxShadow: getSubmenuPopoutShadow(theme),
        ...surfaceEffect,
      }
    }
    return `
      position: static !important;
      transform: none !important;
    `
  }}

  ${({ browserScroll }) =>
    browserScroll && `overflow-y: auto; max-block-size: 100dvh;`}

  ${({ rootStyles }) => rootStyles};
`

export default StyledSubMenuContent
