import React from 'react'
import { Link } from 'react-router-dom'
import styled from '@emotion/styled'
import { useVerticalNav } from '../contexts/verticalNavContext'
import type { VerticalNavContextProps } from '../contexts/verticalNavContext'
import { useSettings } from '@cap/platform-store'
import { themeConfig, dropdownTokens } from '@cap/theme'
import { AppPaths, LayoutModeEnum } from '@cap/shared-types'
import SerafortLogo from '../../assets/svg/Logo'
import type { LogoVariant } from '../../assets/svg/Logo'
import { Box } from '@mui/material'

type LogoTextProps = {
  isHovered?: VerticalNavContextProps['isHovered']
  isCollapsed?: VerticalNavContextProps['isCollapsed']
  transitionDuration?: VerticalNavContextProps['transitionDuration']
}

const LogoText = styled.span<LogoTextProps>`
  font-size: ${({ theme }: any) => dropdownTokens?.logo?.fontSize || '1.375rem'};
  line-height: ${({ theme }: any) => dropdownTokens?.logo?.lineHeight || '1.455'};
  font-weight: ${({ theme }: any) => dropdownTokens?.logo?.fontWeight || 700};
  letter-spacing: ${({ theme }: any) => dropdownTokens?.logo?.letterSpacing || '0.25px'};
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  transition: ${({ transitionDuration }) =>
    `margin-inline-start ${transitionDuration}ms ease-in-out, opacity ${transitionDuration}ms ease-in-out`};

  ${({ isHovered, isCollapsed }) =>
    isCollapsed && !isHovered
      ? 'display: none; opacity: 0; margin-inline-start: 0;'
      : `display: inline-block; opacity: 1; margin-inline-start: ${dropdownTokens?.logo?.marginInlineStart || '12px'};`}
`

type LogoProps = {
  /**
   * The horizontal navbar has no adjacent brand text elsewhere on the page
   * (unlike the vertical nav header, which needs the wordmark to identify
   * the app), so it drops the text and lets the icon mark alone - sized up
   * slightly since it's no longer sharing the row with a label - stand as
   * the brand mark.
   */
  showText?: boolean
  iconHeight?: string
  /** Forwarded to the brand-kit SerafortLogo: 'icon' (default) or the full
   * 'lockup' (mark + wordmark baked into the image, ~5.5:1 aspect ratio). */
  variant?: LogoVariant
}

const Logo = ({ showText = true, iconHeight, variant = 'icon' }: LogoProps) => {
  // Hooks
  const { isHovered, isCollapsed, transitionDuration } = useVerticalNav()

  const logoTextRef = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    if (logoTextRef && logoTextRef.current) {
      if (isCollapsed && !isHovered) logoTextRef.current?.classList.add('hidden')
      else logoTextRef.current.classList.remove('hidden')
    }
  }, [isHovered, isCollapsed])

  return (
    <Box
      data-tut='reactour__logo'
      component={Link}
      to={AppPaths.landing.home}
      sx={{
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <SerafortLogo
        variant={variant}
        style={{
          // The mark is an image, so drive it by height; `iconLineHeight` is the
          // row height the navbar reserves for it.
          height: iconHeight || dropdownTokens.logo.iconLineHeight,
          width: 'auto',
          flexShrink: variant === 'lockup' ? 1 : 0,
        }}
      />
      {showText && (
        <LogoText
          ref={logoTextRef}
          isHovered={isHovered}
          isCollapsed={isCollapsed}
          transitionDuration={transitionDuration}
        >
          {themeConfig.templateName}
        </LogoText>
      )}
    </Box>
  )
}

export default Logo
