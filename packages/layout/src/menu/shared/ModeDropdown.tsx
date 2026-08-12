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
import Brightness4 from '@mui/icons-material/Brightness4'
import Brightness7 from '@mui/icons-material/Brightness7'
import Laptop from '@mui/icons-material/Laptop'
import Palette from '@mui/icons-material/Palette'
import Storefront from '@mui/icons-material/Storefront'
import Divider from '@mui/material/Divider'
import type { Mode } from '@cap/shared-types'
import { ThemeModeEnum } from '@cap/shared-types'
import { useSettings } from '@cap/platform-store'
import { zIndexScale, themeEditorStore, widgetMarketplaceStore, DEFAULT_THEME_CONFIG, dropdownTokens, getTenantThemeEffects } from '@cap/theme'
import { useTenant } from '@cap/platform-core'
import { useTranslation } from 'react-i18next'
import { buildLayoutSurfaceEffect } from '../../utils/buildLayoutSurfaceEffect'

const ModeDropdown = () => {
  const [open, setOpen] = React.useState<boolean>(false)
  const [tooltipOpen, setTooltipOpen] = React.useState<boolean>(false)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const { settings, updateSettings } = useSettings()
  const { t } = useTranslation()

  const { theme: tenantTheme } = useTenant()

  const handleOpenThemeBuilder = () => {
    handleClose()
    themeEditorStore.startEditing((tenantTheme as any) || DEFAULT_THEME_CONFIG)
  }

  const handleOpenWidgetMarketplace = () => {
    handleClose()
    widgetMarketplaceStore.openMarketplace()
  }

  const handleClose = () => {
    setOpen(false)
    setTooltipOpen(false)
    setAnchorEl(null)
  }

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    setOpen((prevOpen) => !prevOpen)
  }

  const handleModeSwitch = (mode: Mode) => {
    handleClose()
    if (settings.mode !== mode) {
      updateSettings({ mode })
    }
  }

  const getModeIcon = (): React.JSX.Element => {
    if (settings.mode === ThemeModeEnum.SYSTEM) return <Laptop />
    if (settings.mode === ThemeModeEnum.DARK) return <Brightness4 />
    return <Brightness7 />
  }

  const getModeLabel = (): string => {
    if (settings.mode === ThemeModeEnum.SYSTEM) return t('theme.system')
    if (settings.mode === ThemeModeEnum.DARK) return t('theme.dark')
    return t('theme.light')
  }

  return (
    <React.Fragment>
      <Tooltip
        title={`${t('theme.switchMode')} ${getModeLabel()}`}
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
          aria-label={`${t('theme.switchMode')} ${getModeLabel()}`}
        >
          {getModeIcon()}
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
                  <MenuItem
                    onClick={() => handleModeSwitch(ThemeModeEnum.LIGHT)}
                    selected={settings.mode === ThemeModeEnum.LIGHT}
                    sx={{
                      gap: dropdownTokens.dropdownPopper.itemGap,
                    }}
                  >
                    <Brightness7 sx={{ fontSize: dropdownTokens.dropdownPopper.itemIconFontSize }} />
                    {t('theme.light')}
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleModeSwitch(ThemeModeEnum.DARK)}
                    selected={settings.mode === ThemeModeEnum.DARK}
                    sx={{
                      gap: dropdownTokens.dropdownPopper.itemGap,
                    }}
                  >
                    <Brightness4 sx={{ fontSize: dropdownTokens.dropdownPopper.itemIconFontSize }} />
                    {t('theme.dark')}
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleModeSwitch(ThemeModeEnum.SYSTEM)}
                    selected={settings.mode === ThemeModeEnum.SYSTEM}
                    sx={{
                      gap: dropdownTokens.dropdownPopper.itemGap,
                    }}
                  >
                    <Laptop sx={{ fontSize: dropdownTokens.dropdownPopper.itemIconFontSize }} />
                    {t('theme.system')}
                  </MenuItem>
                  <Divider sx={{ my: 0.5 }} />
                  <MenuItem
                    onClick={handleOpenThemeBuilder}
                    sx={{
                      gap: dropdownTokens.dropdownPopper.itemGap,
                      color: 'primary.main',
                      fontWeight: 600,
                    }}
                  >
                    <Palette sx={{ fontSize: dropdownTokens.dropdownPopper.itemIconFontSize }} />
                    {t('theme.themeBuilder')}
                  </MenuItem>
                  <MenuItem
                    onClick={handleOpenWidgetMarketplace}
                    sx={{
                      gap: dropdownTokens.dropdownPopper.itemGap,
                      color: 'secondary.main',
                      fontWeight: 600,
                    }}
                  >
                    <Storefront sx={{ fontSize: dropdownTokens.dropdownPopper.itemIconFontSize }} />
                    Widget Marketplace
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </React.Fragment>
  )
}

export default ModeDropdown
