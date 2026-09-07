import React from 'react'
import {
  ClickAwayListener,
  Fade,
  IconButton,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Tooltip,
} from '@mui/material'
import Translate from '@mui/icons-material/Translate'
import { i18n as i18nConfig, getAvailableLocales } from '@cap/shared-types'
type Locale = (typeof i18nConfig)['locales'][number]
import { useTranslation } from 'react-i18next'
import { useSettings } from '@cap/platform-store'
import { zIndexScale, dropdownTokens, getTenantThemeEffects } from '@cap/theme'
import { buildLayoutSurfaceEffect } from '../../utils/buildLayoutSurfaceEffect'

const LANGUAGE_NATIVE_MAP: Record<string, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
}

const LanguageDropdown = () => {
  const [open, setOpen] = React.useState<boolean>(false)
  const [tooltipOpen, setTooltipOpen] = React.useState<boolean>(false)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const { t, i18n } = useTranslation()
  const { settings } = useSettings()

  // Dynamically derive language list from platform-core i18n registry
  const availableLanguages = React.useMemo(() => {
    const locales =
      typeof getAvailableLocales === 'function'
        ? getAvailableLocales()
        : (i18nConfig.locales as readonly Locale[])

    return locales.map((langCode) => ({
      langCode: langCode as Locale,
      langName: t(`language.${langCode}`, {
        defaultValue: LANGUAGE_NATIVE_MAP[langCode] || String(langCode).toUpperCase(),
      }),
    }))
  }, [t])

  const handleClose = () => {
    setOpen(false)
    setTooltipOpen(false)
    setAnchorEl(null)
  }

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    setOpen((prevOpen) => !prevOpen)
  }

  const handleLangCode = (langCode: Locale) => {
    i18n.changeLanguage(langCode)
    handleClose()
  }

  return (
    <React.Fragment>
      <Tooltip
        title={t('language.selectLanguage')}
        onOpen={() => setTooltipOpen(true)}
        onClose={() => setTooltipOpen(false)}
        open={open ? false : tooltipOpen}
        PopperProps={{ className: 'capitalize' }}
      >
        <IconButton
          onClick={handleToggle}
          sx={{
            color: 'text.primary',
          }}
          aria-label={t('language.selectLanguage')}
        >
          <Translate />
        </IconButton>
      </Tooltip>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-start'
        anchorEl={anchorEl}
        sx={{
          minInlineSize: dropdownTokens.dropdownPopper.minInlineSizeSmall,
          marginBlockStart: dropdownTokens.dropdownPopper.marginBlockStart,
          zIndex: zIndexScale.dropdown,
        }}
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-start' ? 'left top' : 'right top',
            }}
          >
            <Paper
              className='animate-scale-in'
              sx={(theme: any) => ({
                borderRadius: dropdownTokens.dropdownPopper.paperBorderRadius,
                overflow: 'hidden',
                ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
                ...(settings.skin === 'bordered'
                  ? { border: '1px solid ' + theme.palette.divider, boxShadow: 'none' }
                  : {}),
              })}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList onKeyDown={handleClose}>
                  {availableLanguages.map((locale) => (
                    <MenuItem
                      key={locale.langCode}
                      onClick={() => handleLangCode(locale.langCode)}
                      selected={i18n.language === locale.langCode}
                      sx={{
                        fontWeight: i18n.language === locale.langCode ? 600 : 400,
                      }}
                    >
                      {locale.langName}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </React.Fragment>
  )
}

export default LanguageDropdown
