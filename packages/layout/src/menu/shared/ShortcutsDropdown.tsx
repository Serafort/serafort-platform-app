import React, { ReactNode, useCallback, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Avatar,
  Box,
  Button,
  ClickAwayListener,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Popper,
  Select,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material'
import type { Theme } from '@mui/material/styles'

import PerfectScrollbar from 'react-perfect-scrollbar'
import GridView from '@mui/icons-material/GridView'
import Add from '@mui/icons-material/Add'
import CalendarToday from '@mui/icons-material/CalendarToday'
import FilePresent from '@mui/icons-material/FilePresent'
import Person from '@mui/icons-material/Person'
import People from '@mui/icons-material/People'
import DesktopWindows from '@mui/icons-material/DesktopWindows'
import Settings from '@mui/icons-material/Settings'
import LinkIcon from '@mui/icons-material/Link'
import { useSettings } from '@cap/platform-store'
import { buildLayoutSurfaceEffect } from '../../utils/buildLayoutSurfaceEffect'
import { themeConfig, zIndexScale, dropdownTokens, getTenantThemeEffects } from '@cap/theme'
import { i18n as i18nConfig, getSearchItems } from '@cap/platform-core'

export type ShortcutsType = {
  url: string
  icon: string | ReactNode
  title: string
  subtitle: string
}

const getLocalizedUrl = (url: string, locale: string): string => {
  if (!locale) return url
  return locale === i18nConfig.defaultLocale ? url : `/${locale}${url}`
}

const getShortcutIcon = (icon: string | ReactNode): ReactNode => {
  if (typeof icon !== 'string') return icon

  if (icon === 'tabler-calendar') return <CalendarToday fontSize='small' />
  if (icon === 'tabler-file-dollar') return <FilePresent fontSize='small' />
  if (icon === 'tabler-user') return <Person fontSize='small' />
  if (icon === 'tabler-users-group') return <People fontSize='small' />
  if (icon === 'tabler-device-desktop-analytics') return <DesktopWindows fontSize='small' />
  if (icon === 'tabler-settings') return <Settings fontSize='small' />

  return <LinkIcon fontSize='small' />
}

const ScrollWrapper = ({ children, hidden }: { children: ReactNode; hidden: boolean }) => {
  if (hidden) {
    return <Box sx={{ overflowX: 'hidden', maxBlockSize: dropdownTokens.shortcuts.maxBlockSize }}>{children}</Box>
  } else {
    return (
      <PerfectScrollbar
        options={{ wheelPropagation: false, suppressScrollX: true }}
        style={{ maxBlockSize: dropdownTokens.shortcuts.maxBlockSize }}
      >
        {children}
      </PerfectScrollbar>
    )
  }
}

const ShortcutsDropdown = ({ shortcuts }: { shortcuts: ShortcutsType[] }) => {
  // States
  const [open, setOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [addedShortcuts, setAddedShortcuts] = useState<ShortcutsType[]>([])
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedSearchItem, setSelectedSearchItem] = useState<string>('')
  const [customTitle, setCustomTitle] = useState('')
  const [customUrl, setCustomUrl] = useState('')

  const shortcutsList = useMemo(() => {
    return [...addedShortcuts, ...shortcuts]
  }, [addedShortcuts, shortcuts])

  const searchItems = useMemo(() => getSearchItems(), [])

  // Hooks
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const { settings } = useSettings()
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  const handleToggle = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
    setOpen((prevOpen) => !prevOpen)
  }, [])

  const handleOpenAddDialog = (e: React.MouseEvent) => {
    e.stopPropagation()
    setAddDialogOpen(true)
  }

  const handleAddShortcut = () => {
    if (!customTitle || !customUrl) return
    const found = searchItems.find((s) => s.url === customUrl || s.id === selectedSearchItem)
    const newShortcut: ShortcutsType = {
      url: customUrl,
      icon: found?.icon || 'tabler-link',
      title: customTitle,
      subtitle: customUrl,
    }
    setAddedShortcuts((prev) => [newShortcut, ...prev])
    setCustomTitle('')
    setCustomUrl('')
    setSelectedSearchItem('')
    setAddDialogOpen(false)
  }

  return (
    <>
      <IconButton onClick={handleToggle} sx={{ color: 'text.primary' }}>
        <GridView />
      </IconButton>
      <Popper
        open={open}
        transition
        placement='bottom-end'
        anchorEl={anchorEl}
        sx={{
          zIndex: zIndexScale.dropdown,
          marginBlockStart: dropdownTokens.notifications.popperMarginBlockStart,
          inlineSize: isSmallScreen ? '100%' : dropdownTokens.notifications.popperInlineSizeDesktop,
        }}
        {...(isSmallScreen && {
          modifiers: [
            {
              name: 'preventOverflow',
              options: {
                padding: themeConfig.layoutPadding,
              },
            },
          ],
        })}
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}
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
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingBlock: dropdownTokens.notifications.headerPaddingBlock,
                      paddingInline: dropdownTokens.notifications.headerPaddingInline,
                      width: '100%',
                      gap: 2,
                    }}
                  >
                    <Typography variant='h6' sx={{ flex: '1 1 auto' }}>
                      {t('navigation.shortcuts')}
                    </Typography>
                    <Tooltip
                      title={t('navigation.addShortcut')}
                      placement={placement === 'bottom-end' ? 'left' : 'right'}
                      slotProps={{
                        popper: {
                          sx: {
                            '& .MuiTooltip-tooltip': {
                              transformOrigin:
                                placement === 'bottom-end'
                                  ? 'right center !important'
                                  : 'right center !important',
                            },
                          },
                        },
                      }}
                    >
                      <IconButton onClick={handleOpenAddDialog} size='small' sx={{ color: 'text.primary' }}>
                        <Add fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Divider />
                  <ScrollWrapper hidden={hidden}>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: dropdownTokens.shortcuts.gridColumns,
                      }}
                    >
                      {shortcutsList.map((shortcut, index) => (
                        <Box
                          key={index}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                            // Vertical border for odd items (left column)
                            ...(index % 2 === 0 && {
                              borderInlineEnd: 1,
                              borderInlineEndColor: 'divider',
                            }),
                            // Horizontal border for all except last row
                            ...(index < shortcutsList.length - (shortcutsList.length % 2 === 0 ? 2 : 1) && {
                              borderBlockEnd: 1,
                              borderBlockEndColor: 'divider',
                            }),
                          }}
                        >
                          <Box
                            component={Link}
                            to={getLocalizedUrl(shortcut.url, locale)}
                            onClick={handleClose}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              flexDirection: 'column',
                              padding: dropdownTokens.shortcuts.itemPadding,
                              gap: dropdownTokens.shortcuts.itemGap,
                              blockSize: '100%',
                              textDecoration: 'none',
                            }}
                          >
                            <Avatar
                              sx={{
                                width: dropdownTokens.shortcuts.avatarWidth,
                                height: dropdownTokens.shortcuts.avatarHeight,
                                bgcolor: 'action.selected',
                                color: 'text.primary',
                              }}
                            >
                              {getShortcutIcon(shortcut.icon)}
                            </Avatar>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                              }}
                            >
                              <Typography sx={{ fontWeight: 500 }} color='text.primary'>
                                {shortcut.title}
                              </Typography>
                              <Typography variant='body2' color='text.secondary'>
                                {shortcut.subtitle}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </ScrollWrapper>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>

      {/* Add Shortcut Interactive Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth='xs'
        fullWidth
        PaperProps={{
          sx: (theme: any) => ({
            ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
          }),
        }}
      >
        <DialogTitle>{t('navigation.addShortcut')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
          <FormControl fullWidth size='small'>
            <InputLabel id='select-shortcut-page-label'>{t('navigation.selectPage')}</InputLabel>
            <Select
              labelId='select-shortcut-page-label'
              value={selectedSearchItem}
              label={t('navigation.selectPage')}
              onChange={(e) => {
                const val = e.target.value
                setSelectedSearchItem(val)
                const found = searchItems.find((s) => s.url === val || s.id === val)
                if (found) {
                  const rawName = found.name || ''
                  const cleanNameKey = rawName.replace(/^navigation\./, '')
                  const translatedName = t(rawName, {
                    defaultValue: t(`navigation.${cleanNameKey}`, { defaultValue: rawName }),
                  })
                  setCustomTitle(translatedName)
                  setCustomUrl(found.url)
                }
              }}
            >
              {searchItems.map((item) => {
                const rawName = item.name || ''
                const cleanNameKey = rawName.replace(/^navigation\./, '')
                const translatedName = t(rawName, {
                  defaultValue: t(`navigation.${cleanNameKey}`, { defaultValue: rawName }),
                })
                return (
                  <MenuItem key={item.id} value={item.url}>
                    {translatedName} ({item.url})
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl>
          <TextField
            label={t('navigation.shortcutTitle')}
            size='small'
            fullWidth
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
          />
          <TextField
            label={t('navigation.shortcutUrl')}
            size='small'
            fullWidth
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} color='secondary'>
            {t('common.cancel')}
          </Button>
          <Button
            variant='contained'
            disabled={!customTitle || !customUrl}
            onClick={handleAddShortcut}
          >
            {t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ShortcutsDropdown
