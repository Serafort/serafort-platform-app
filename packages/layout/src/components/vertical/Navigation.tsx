import React from 'react'
import classnames from 'classnames'
import { styled, useColorScheme, useTheme, alpha } from '@mui/material/styles'
import type { Mode, SystemMode } from '@cap/shared-types'
import VerticalNav, { NavHeader, NavCollapseIcons } from '../../menu/vertical-menu'
import Logo from '../../assets/svg/Logo'
import { useVerticalNav } from '../../menu/contexts/verticalNavContext'
import { useSettings } from '@cap/platform-store'
import navigationCustomStyles from '../../styles/core/vertical/navigationCustomStyles'
import Close from '@mui/icons-material/Close'
import RadioButtonChecked from '@mui/icons-material/RadioButtonChecked'
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked'

const StyledBoxForShadow = styled('div')(({ theme }) => ({
  top: 60,
  left: -8,
  zIndex: 2,
  opacity: 0,
  position: 'absolute',
  pointerEvents: 'none',
  width: 'calc(100% + 15px)',
  height: theme.mixins.toolbar.minHeight,
  transition: 'opacity .15s ease-in-out',
  background: `linear-gradient( ${theme.direction === 'rtl' ? '95%' : '5%'
    }, ${alpha('#5B30E8', 0.85)} 30%, ${alpha('#5B30E8', 0.5)} 65%, ${alpha('#5B30E8', 0.3)} 75%, transparent)`,
  '&.scrolled': {
    opacity: 1,
  },
}))

const Navigation: React.FC<{
  mode: Mode
  systemMode: SystemMode
  children: (
    scrollMenu: (container: HTMLElement | null, isPerfectScrollbar: boolean) => void,
  ) => React.ReactNode
}> = ({ mode, systemMode, children }) => {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const theme = useTheme()
  const { mode: muiMode, systemMode: muiSystemMode } = useColorScheme()
  const verticalNavOptions = useVerticalNav()
  const { updateSettings, settings } = useSettings()
  const { isCollapsed, isHovered, collapseVerticalNav, isBreakpointReached } = verticalNavOptions
  const isSemiDark = settings.semiDark
  let isDark

  const isServer = typeof window === 'undefined'
  if (isServer) isDark = mode === 'system' ? systemMode === 'dark' : mode === 'dark'
  else isDark = muiMode === 'system' ? muiSystemMode === 'dark' : muiMode === 'dark'

  const scrollMenu = React.useCallback(
    (container: HTMLElement | null, isPerfectScrollbar: boolean) => {
      if (!container) return

      const target = isBreakpointReached || !isPerfectScrollbar ? container : container

      if (target.scrollTop > 0) {
        if (!isScrolled) setIsScrolled(true)
      } else {
        if (isScrolled) setIsScrolled(false)
      }
    },
    [isBreakpointReached, isScrolled],
  )

  React.useEffect(() => {
    if (settings.layout === 'collapsed') collapseVerticalNav(true)
    else collapseVerticalNav(false)
  }, [settings.layout, collapseVerticalNav])

  return (
    // Sidebar Vertical Menu
    <VerticalNav
      customStyles={navigationCustomStyles(verticalNavOptions, theme)}
      collapsedWidth={71}
      backgroundColor={theme.palette.background.paper}

      // The following condition adds the data-mui-color-scheme='dark' attribute to the VerticalNav component
      // when semiDark is enabled and the mode or systemMode is light
      {...(isSemiDark &&
        !isDark && {
        'data-mui-color-scheme': 'dark',
      })}
    >
      {/* Nav Header including Logo & nav toggle icons  */}
      <NavHeader>
        <Logo />
        {!(isCollapsed && !isHovered) && (
          <NavCollapseIcons
            lockedIcon={
              <RadioButtonChecked
                sx={{
                  fontSize: '1.25rem',
                  lineHeight: '1.75rem',
                }}
              // className='text-xl'
              />
            }
            unlockedIcon={
              <RadioButtonUnchecked
                sx={{
                  fontSize: '1.25rem',
                  lineHeight: '1.75rem',
                }}
              // className='text-xl'
              />
            }
            closeIcon={
              <Close
                sx={{
                  fontSize: '1.25rem',
                  lineHeight: '1.75rem',
                }}
              // className='text-xl'
              />
            }
            onClick={() =>
              updateSettings({
                layout: !isCollapsed ? 'collapsed' : 'vertical',
              })
            }
          />
        )}
      </NavHeader>
      <StyledBoxForShadow className={classnames({ scrolled: isScrolled })} />
      {children(scrollMenu)}
    </VerticalNav>
  )
}

export default Navigation
