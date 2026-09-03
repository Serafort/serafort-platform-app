import React from 'react'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import classnames from 'classnames'
import { useTranslation } from 'react-i18next'
import { horizontalLayoutClasses, layoutMenuTokens, getNavbarIconButtonHoverBg } from '@cap/theme'
import HorizontalNavToggle from '../../components/horizontal/NavToggle'
import { useHorizontalNav } from '../contexts/horizontalNavContext'
import LanguageDropdown from '../shared/LanguageDropdown'
import ModeDropdown from '../shared/ModeDropdown'
import ShortcutsDropdown from '../shared/ShortcutsDropdown'
import NotificationsDropdown from '../shared/NotificationsDropdown'
import NavSearch from '../search'
import UserDropdown from '../shared/UserDropdown'
import Logo from '../shared/Logo'
import RoleIndicator from '../../components/RoleIndicator'
import { getSearchItems } from '@cap/platform-core'

const NavbarContent = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const { isBreakpointReached } = useHorizontalNav()
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
      className={classnames(horizontalLayoutClasses.navbarContent)}
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
        }}
      >
        <HorizontalNavToggle />
        {/* Hide Logo on Smaller screens */}
        {!isBreakpointReached && <Logo />}
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: layoutMenuTokens.navbarContent.actionsGap,
        }}
      >
        <NavSearch />
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
