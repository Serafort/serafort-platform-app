import React from 'react'
import { Link } from 'react-router-dom'
import styled from '@emotion/styled'
import { useTheme } from '@mui/material/styles'
import { useVerticalNav } from '../contexts/verticalNavContext'
import type { VerticalNavContextProps } from '../contexts/verticalNavContext'
import { useSettings } from '@cap/platform-store'
import { themeConfig, dropdownTokens } from '@cap/theme'
import { AppPaths, LayoutModeEnum } from '@cap/shared-types'
import VuexyLogo from '../../assets/svg/Logo'
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
  transition: ${({ transitionDuration }) =>
    `margin-inline-start ${transitionDuration}ms ease-in-out, opacity ${transitionDuration}ms ease-in-out`};

  ${({ isHovered, isCollapsed }) =>
    isCollapsed && !isHovered
      ? 'opacity: 0; margin-inline-start: 0;'
      : `opacity: 1; margin-inline-start: ${dropdownTokens?.logo?.marginInlineStart || '12px'};`}
`

const Logo = () => {
  const theme = useTheme()
  // Hooks
  const { isHovered, transitionDuration } = useVerticalNav()
  const { settings } = useSettings()

  // Vars
  const { layout } = settings

  const logoTextRef = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    if (layout !== LayoutModeEnum.COLLAPSED) return

    if (logoTextRef && logoTextRef.current) {
      if (layout === LayoutModeEnum.COLLAPSED && !isHovered) logoTextRef.current?.classList.add('hidden')
      else logoTextRef.current.classList.remove('hidden')
    }
  }, [isHovered, layout])

  return (
    <Box
      data-tut='reactour__logo'
      component={Link}
      to={AppPaths.landing.home}
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <VuexyLogo
        style={{
          fontSize: dropdownTokens.logo.iconFontSize,
          lineHeight: dropdownTokens.logo.iconLineHeight,
          color: theme.palette.primary.main,
        }}
      />
      <LogoText
        ref={logoTextRef}
        isHovered={isHovered}
        isCollapsed={layout === LayoutModeEnum.COLLAPSED}
        transitionDuration={transitionDuration}
      >
        {themeConfig.templateName}
      </LogoText>
    </Box>
  )
}

export default Logo
