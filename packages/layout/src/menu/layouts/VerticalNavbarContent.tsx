import React from 'react'
import { useTheme } from '@mui/material/styles'
import classnames from 'classnames'
import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'
import RoleIndicator from '../../components/RoleIndicator'
import { getSearchItems } from '@cap/platform-core'

// Component Imports
import { NavToggle } from '../shared'
import NotificationsDropdown from '../shared/NotificationsDropdown'
import ShortcutsDropdown from '../shared/ShortcutsDropdown'
import LanguageDropdown from '../shared/LanguageDropdown'
import ModeDropdown from '../shared/ModeDropdown'
import NavSearch from '../search'
import UserDropdown from '../shared/UserDropdown'
import Logo from '../../assets/svg/Logo'
import { useVerticalNav } from '../contexts/verticalNavContext'

import { layoutMenuTokens, getNavbarIconButtonHoverBg, LayoutSwitcher } from '@cap/theme'
import { verticalLayoutClasses } from '../../utils/layoutClasses'

const NavbarContent = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const searchItems = getSearchItems()
  // Below the mobile breakpoint the sidebar (and the logo inside its header)
  // renders as a closed off-canvas drawer, so nothing on screen carries the
  // brand mark until a visitor opens it. Surface a compact copy in the
  // navbar itself for that state; above the breakpoint the sidebar's own
  // logo is already visible, so this stays hidden to avoid a duplicate.
  const { isBreakpointReached } = useVerticalNav()

  const shortcuts = React.useMemo(() => {
    return searchItems.slice(0, 6).map((item) => {
      const rawName = item.name || ''
      const cleanNameKey = rawName.replace(/^navigation\./, '')
      const translatedName = t(rawName, {
        defaultValue: t(`navigation.${cleanNameKey}`, { defaultValue: rawName }),
      })

      const rawSection = item.section || ''
      const cleanSectionKey = rawSection.replace(/^navigation\./, '')
      const translatedSection = rawSection
        ? t(rawSection, {
            defaultValue: t(`navigation.${cleanSectionKey}`, { defaultValue: rawSection }),
          })
        : ''

      return {
        url: item.url,
        icon: item.icon || 'tabler-link',
        title: translatedName,
        subtitle: translatedSection,
      }
    })
  }, [searchItems, t])

  return (
    <Box
      className={classnames(verticalLayoutClasses.navbarContent)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: layoutMenuTokens.navbarContent.gap,
        inlineSize: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: layoutMenuTokens.navbarContent.gap,
          // Grows to fill the row between the toggle/logo and the right-side
          // icon cluster, so NavSearch's own flex: 1 has room to stretch into.
          flex: 1,
          minWidth: 0,
        }}
      >
        <NavToggle />
        {isBreakpointReached && <Logo variant='icon' style={{ height: '1.5rem' }} />}
        <NavSearch />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: layoutMenuTokens.navbarContent.actionsGap,
        }}
      >
        <RoleIndicator showLabel={true} size='small' />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: layoutMenuTokens.navbarContent.iconGroupGap,
            '& .MuiIconButton-root': {
              transition: layoutMenuTokens.navbarContent.iconButtonTransition,
              '&:hover': {
                background: getNavbarIconButtonHoverBg(theme),
                transform: layoutMenuTokens.navbarContent.iconButtonHoverTranslateY,
                '& i, & svg': { color: 'primary.main' },
              },
            },
          }}
        >
          <LanguageDropdown />
          <ModeDropdown />
          <LayoutSwitcher />
          <ShortcutsDropdown shortcuts={shortcuts} />
          <NotificationsDropdown notifications={[]} />
        </Box>
        <UserDropdown />
      </Box>
    </Box>
  )
}

export default NavbarContent
