import type { Settings } from '@cap/shared-types'
import { styled } from '@mui/material/styles'
import { KBarAnimator } from 'kbar'
import { SurfaceEffectFactory } from '../../utils/buildLayoutSurfaceEffect'
import { searchTokens, getTenantThemeEffects } from '@cap/theme'

type StyledKBarAnimatorProps = {
  skin: Settings['skin']
  isSmallScreen: boolean
}

const StyledKBarAnimator = styled(KBarAnimator)<StyledKBarAnimatorProps>(({ theme, skin, isSmallScreen }: any) => {
  const surfaceEffect = SurfaceEffectFactory.create(getTenantThemeEffects(theme), theme)

  return {
    '& > div': {
      inlineSize: searchTokens.animator.desktopInlineSize,
      maxInlineSize: searchTokens.animator.desktopMaxInlineSize,
      blockSize: searchTokens.animator.desktopBlockSize,
      maxBlockSize: searchTokens.animator.desktopMaxBlockSize,
      borderRadius: `${theme.shape.borderRadius * 2}px`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[4],
      ...surfaceEffect,

      ...(isSmallScreen && {
        minBlockSize: searchTokens.animator.mobileMinBlockSize,
        maxBlockSize: searchTokens.animator.mobileMaxBlockSize,
        minInlineSize: searchTokens.animator.mobileMinInlineSize,
        maxInlineSize: searchTokens.animator.mobileMaxInlineSize,
        borderRadius: 0,
      }),

      ...(skin === 'bordered' && {
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
      }),
    },

    '& #kbar-listbox': {
      paddingInline: searchTokens.animator.listboxPaddingInline,

      '& [id^="kbar-listbox-item"]': {
        insetInlineStart: searchTokens.animator.listboxItemInset,
        inlineSize: searchTokens.animator.listboxItemWidth,
      },
    },
  }
})

export default StyledKBarAnimator
