import { styled, getTenantThemeEffects } from '@cap/theme'
import type { VerticalNavProps } from '../../components/vertical-menu/VerticalNav'
import { verticalNavClasses } from '../../utils/menuClasses'
import { SurfaceEffectFactory } from '../../../utils/buildLayoutSurfaceEffect'

type StyledVerticalNavContainerProps = Pick<VerticalNavProps, 'width' | 'transitionDuration'>

const StyledVerticalNavContainer = styled('div')<StyledVerticalNavContainerProps>(({ theme, width, transitionDuration }: any) => {
  const surfaceEffect = SurfaceEffectFactory.create(getTenantThemeEffects(theme), theme)

  return {
    position: 'relative',
    blockSize: '100%',
    inlineSize: '100%',
    borderInlineEnd: `1px solid ${theme.palette?.divider || 'rgba(0,0,0,0.12)'}`,
    transitionProperty: 'inline-size, min-inline-size',
    transitionDuration: `${transitionDuration}ms`,
    transitionTimingFunction: 'ease-in-out',
    ...surfaceEffect,

    [`.${verticalNavClasses.root}.${verticalNavClasses.hovered} &, &.${verticalNavClasses.hovered}, &.${verticalNavClasses.expanding}`]: {
      inlineSize: `${width}px`,
      minInlineSize: `${width}px`,
      boxShadow: theme.shadows?.[10] || '0 4px 20px rgba(0,0,0,0.15)',
    },
  }
})

export default StyledVerticalNavContainer
