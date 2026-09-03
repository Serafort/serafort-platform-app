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

// Definition Imports
import { verticalLayoutClasses, layoutMenuTokens, getNavbarIconButtonHoverBg } from '@cap/theme'

const NavbarContent = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const searchItems = getSearchItems()

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
        ? t(rawSection, { defaultValue: t(`navigation.${cleanSectionKey}`, { defaultValue: rawSection }) })
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: layoutMenuTokens.navbarContent.gap }}>
        <NavToggle />
        <NavSearch />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: layoutMenuTokens.navbarContent.actionsGap }}>
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
          <ShortcutsDropdown shortcuts={shortcuts} />
          <NotificationsDropdown notifications={[]} />
        </Box>
        <UserDropdown />
      </Box>
    </Box>
  )
}

export default NavbarContent
