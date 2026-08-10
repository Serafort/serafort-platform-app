import styled from '@emotion/styled'
import { alpha } from '@mui/material/styles'
import {
  headerTokens,
  getHeaderElevationShadow,
  getHeaderBorderInline,
  getHeaderBorderBlockEnd,
  getHeaderBorderFull,
  getFloatingNavbarInlineSize,
  getCompactFloatingMaxInlineSize,
  getHeaderFloatingMask,
  verticalLayoutClasses,
  getTenantThemeEffects,
} from '@cap/theme'
import type { Theme } from '@mui/material/styles'
import type { CSSObject } from '@emotion/styled'
import { SurfaceEffectFactory } from '../../../utils/buildLayoutSurfaceEffect'

type StyledHeaderProps = {
  theme?: Theme
  overrideStyles?: CSSObject
  layoutPadding: number
  compactContentWidth: number
}

const StyledHeader = styled.header<StyledHeaderProps>`
  min-block-size: ${headerTokens.layout.minBlockSize};

  &.${verticalLayoutClasses.headerContentCompact} {
    &.${verticalLayoutClasses.headerFloating}
      .${verticalLayoutClasses.navbar},
      &.${verticalLayoutClasses.headerDetached}
      .${verticalLayoutClasses.navbar},
      &.${verticalLayoutClasses.headerAttached}
      .${verticalLayoutClasses.navbar} {
      margin-inline: ${headerTokens.layout.compactMarginInline};
    }

    &.${verticalLayoutClasses.headerFloating}
      .${verticalLayoutClasses.navbar},
      &.${verticalLayoutClasses.headerFixed}.${verticalLayoutClasses.headerDetached}
      .${verticalLayoutClasses.navbar} {
      max-inline-size: ${({ compactContentWidth, layoutPadding }) =>
        getCompactFloatingMaxInlineSize(compactContentWidth, layoutPadding)};
    }

    .${verticalLayoutClasses.navbar} {
      max-inline-size: ${({ compactContentWidth }) => compactContentWidth}px;
    }

    .${verticalLayoutClasses.navbar} {
      max-inline-size: ${({ compactContentWidth }) => compactContentWidth}px;
    }
  }

  &.${verticalLayoutClasses.headerFixed} {
    position: ${headerTokens.positioning.sticky};
    inset-block-start: ${headerTokens.positioning.insetBlockStart};
    z-index: ${({ theme }) => theme.zIndex.appBar};

    &:not(.${verticalLayoutClasses.headerBlur}).scrolled.${verticalLayoutClasses.headerAttached},
      &:not(.${verticalLayoutClasses.headerBlur}).scrolled.${verticalLayoutClasses.headerDetached}
      .${verticalLayoutClasses.navbar} {
      background-color: ${({ theme }) => theme.palette.background.paper};
    }

    &.${verticalLayoutClasses.headerDetached} .${verticalLayoutClasses.navbar} {
      box-shadow: ${({ theme }) => getHeaderElevationShadow(theme)};

      [data-skin='bordered'] & {
        box-shadow: ${headerTokens.borderedSkin.boxShadow};
        border-inline: ${({ theme }) => getHeaderBorderInline(theme)};
        border-block-end: ${({ theme }) => getHeaderBorderBlockEnd(theme)};
      }
    }
    &.${verticalLayoutClasses.headerDetached} .${verticalLayoutClasses.navbar} {
      border-end-start-radius: ${({ theme }) => `${theme.shape.borderRadius}px`};
      border-end-end-radius: ${({ theme }) => `${theme.shape.borderRadius}px`};
    }

    &.${verticalLayoutClasses.headerDetached}, &.${verticalLayoutClasses.headerFloating} {
      pointer-events: ${headerTokens.interaction.containerPointerEvents};

      & .${verticalLayoutClasses.navbar} {
        pointer-events: ${headerTokens.interaction.navbarPointerEvents};
      }
    }

    &.${verticalLayoutClasses.headerBlur} {
      &.${verticalLayoutClasses.headerAttached},
        &.${verticalLayoutClasses.headerDetached}
        .${verticalLayoutClasses.navbar},
        &.${verticalLayoutClasses.headerFloating}
        .${verticalLayoutClasses.navbar} {
        backdrop-filter: ${headerTokens.glassmorphism.backdropFilter};
        background-color: ${({ theme }) => alpha(theme.palette.background.paper, headerTokens.glassmorphism.paperOpacity)};
      }

      &.${verticalLayoutClasses.headerFloating} {
        &:before {
          content: ${headerTokens.floatingOverlay.content};
          position: ${headerTokens.floatingOverlay.position};
          z-index: ${headerTokens.floatingOverlay.zIndex};
          inset-block-start: ${headerTokens.floatingOverlay.insetBlockStart};
          inset-inline: ${headerTokens.floatingOverlay.insetInline};
          block-size: ${headerTokens.floatingOverlay.blockSize};
          background: ${({ theme }) => `linear-gradient(
            ${headerTokens.floatingOverlay.gradientAngle},
            ${alpha(theme.palette.background.default, headerTokens.floatingOverlay.stops.topAlpha)} ${headerTokens.floatingOverlay.stops.topPosition},
            ${alpha(theme.palette.background.default, headerTokens.floatingOverlay.stops.midAlpha)} ${headerTokens.floatingOverlay.stops.midPosition},
            ${alpha(theme.palette.background.default, headerTokens.floatingOverlay.stops.bottomAlpha)}
          )`};
          backdrop-filter: ${headerTokens.floatingOverlay.backdropFilter};
          mask: ${({ theme }) => getHeaderFloatingMask(theme)};
        }
      }
    }

    &.${verticalLayoutClasses.headerAttached}.scrolled {
      box-shadow: ${({ theme }) => getHeaderElevationShadow(theme)};

      [data-skin='bordered'] & {
        box-shadow: ${headerTokens.borderedSkin.boxShadow};
        border-block-end: ${({ theme }) => getHeaderBorderBlockEnd(theme)};
      }
    }

    &.${verticalLayoutClasses.headerFloating}
      .${verticalLayoutClasses.navbar},
      &:not(.${verticalLayoutClasses.headerFloating}).${verticalLayoutClasses.headerAttached},
      &:not(.${verticalLayoutClasses.headerFloating}).${verticalLayoutClasses.headerDetached}
      .${verticalLayoutClasses.navbar} {
      ${({ theme }) =>
        `transition: ${theme.transitions.create([
          'box-shadow',
          'border-width',
          'padding-inline',
          'backdrop-filter',
        ])}`};
    }
    &:not(.${verticalLayoutClasses.headerFloating}).${verticalLayoutClasses.headerAttached}
      .${verticalLayoutClasses.navbar},
      &:not(
        .${verticalLayoutClasses.headerFloating}
      ).${verticalLayoutClasses.headerDetached}.scrolled
      .${verticalLayoutClasses.navbar} {
      padding-inline: ${headerTokens.layout.paddingInline};
    }
  }

  &.${verticalLayoutClasses.headerFloating} {
    padding-block-start: ${headerTokens.layout.floatingPaddingBlockStart};

    .${verticalLayoutClasses.navbar} {
      background-color: ${({ theme }) => theme.palette.background.paper};
      border-radius: ${({ theme }) => `${theme.shape.borderRadius}px`};
      padding-inline: ${headerTokens.layout.paddingInline};
      box-shadow: ${({ theme }) => getHeaderElevationShadow(theme)};
      ${({ theme }) => SurfaceEffectFactory.create(getTenantThemeEffects(theme), theme)};

      [data-skin='bordered'] & {
        box-shadow: ${headerTokens.borderedSkin.boxShadow};
        border: ${({ theme }) => getHeaderBorderFull(theme)};
      }
    }
  }

  &.${verticalLayoutClasses.headerFloating}
    .${verticalLayoutClasses.navbar},
    &.${verticalLayoutClasses.headerFixed}.${verticalLayoutClasses.headerDetached}
    .${verticalLayoutClasses.navbar} {
    inline-size: ${({ layoutPadding }) => getFloatingNavbarInlineSize(layoutPadding)};
  }

  &:not(.${verticalLayoutClasses.headerFloating}).${verticalLayoutClasses.headerStatic}
    .${verticalLayoutClasses.navbar} {
    padding-inline: ${headerTokens.layout.paddingInline};
  }

  .${verticalLayoutClasses.navbar} {
    position: ${headerTokens.positioning.navbarPosition};
    padding-block: ${headerTokens.layout.paddingBlock};
    padding-inline: ${headerTokens.layout.paddingInline};
    inline-size: ${headerTokens.layout.fullInlineSize};
  }

  ${({ overrideStyles }) => overrideStyles}
`

export default StyledHeader
