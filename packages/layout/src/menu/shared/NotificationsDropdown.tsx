import React from 'react'
import type { MouseEvent, ReactNode } from 'react'

import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  ClickAwayListener,
  Divider,
  Fade,
  IconButton,
  Paper,
  Popper,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material'
import type { Theme } from '@mui/material/styles'

// Third Party Components
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import Notifications from '@mui/icons-material/Notifications'
import Drafts from '@mui/icons-material/Drafts'
import Close from '@mui/icons-material/Close'
import BarChart from '@mui/icons-material/BarChart'
import Email from '@mui/icons-material/Email'
import { useSettings } from '@cap/platform-store'
import {
  themeConfig,
  zIndexScale,
  dropdownTokens,
  getNotificationBadgeShadow,
  getTenantThemeEffects,
} from '@cap/theme'
import { buildLayoutSurfaceEffect } from '../../utils/buildLayoutSurfaceEffect'
import type { ThemeColor } from '@cap/shared-types'
import { useTranslation } from 'react-i18next'

// Util Imports
const getInitials = (string: string) =>
  string.split(/\s/).reduce((response, word) => (response += word.slice(0, 1)), '')

export type NotificationsType = {
  title: string
  subtitle: string
  time: string
  read: boolean
} & (
  | {
      avatarImage?: string
      avatarIcon?: never
      avatarText?: never
      avatarColor?: never
      avatarSkin?: never
    }
  | {
      avatarIcon?: ReactNode | string
      avatarColor?: ThemeColor
      avatarSkin?: string
      avatarImage?: never
      avatarText?: never
    }
  | {
      avatarText?: string
      avatarColor?: ThemeColor
      avatarSkin?: string
      avatarImage?: never
      avatarIcon?: never
    }
)

const ScrollWrapper = ({ children, hidden }: { children: ReactNode; hidden: boolean }) => {
  if (hidden) {
    return (
      <Box sx={{ overflowX: 'hidden', maxBlockSize: dropdownTokens.notifications.maxBlockSize }}>
        {children}
      </Box>
    )
  } else {
    return (
      <PerfectScrollbar
        options={{ wheelPropagation: false, suppressScrollX: true }}
        style={{ maxBlockSize: dropdownTokens.notifications.maxBlockSize }}
      >
        {children}
      </PerfectScrollbar>
    )
  }
}

const getAvatar = (
  params: Pick<
    NotificationsType,
    'avatarImage' | 'avatarIcon' | 'title' | 'avatarText' | 'avatarColor' | 'avatarSkin'
  >,
) => {
  const { avatarImage, avatarIcon, avatarText, title, avatarColor } = params

  if (avatarImage) {
    return <Avatar src={avatarImage} />
  } else if (avatarIcon) {
    let icon = avatarIcon

    if (typeof avatarIcon === 'string') {
      if (avatarIcon === 'tabler-mail') icon = <Email fontSize='small' />
      else if (avatarIcon === 'tabler-chart-bar') icon = <BarChart fontSize='small' />
      else icon = <i className={avatarIcon} />
    }

    return (
      <Avatar sx={{ bgcolor: avatarColor ? `${avatarColor}.main` : 'primary.main' }}>{icon}</Avatar>
    )
  } else {
    return (
      <Avatar sx={{ bgcolor: avatarColor ? `${avatarColor}.main` : 'primary.main' }}>
        {avatarText || getInitials(title)}
      </Avatar>
    )
  }
}

const NotificationDropdown = ({ notifications }: { notifications: Array<NotificationsType> }) => {
  const { t } = useTranslation()
  // States
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [notificationsState, setNotificationsState] =
    React.useState<Array<NotificationsType>>(notifications)

  // Vars
  const open = Boolean(anchorEl)

  // Vars
  const notificationCount = notificationsState.filter((notification) => !notification.read).length
  const readAll = notificationsState.every((notification) => notification.read)

  // Hooks
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const { settings } = useSettings()

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl((prevAnchorEl) => (prevAnchorEl ? null : event.currentTarget))
  }

  // Read notification when notification is clicked
  const handleReadNotification = (
    event: MouseEvent<HTMLElement>,
    value: boolean,
    index: number,
  ) => {
    event.stopPropagation()
    const newNotifications = [...notificationsState]

    newNotifications[index].read = value
    setNotificationsState(newNotifications)
  }

  // Remove notification when close icon is clicked
  const handleRemoveNotification = (event: MouseEvent<HTMLElement>, index: number) => {
    event.stopPropagation()
    const newNotifications = [...notificationsState]

    newNotifications.splice(index, 1)
    setNotificationsState(newNotifications)
  }

  // Read or unread all notifications when read all icon is clicked
  const readAllNotifications = () => {
    const newNotifications = [...notificationsState]

    newNotifications.forEach((notification) => {
      notification.read = !readAll
    })
    setNotificationsState(newNotifications)
  }

  return (
    <>
      <IconButton
        onClick={handleToggle}
        aria-label='Open notifications'
        sx={{ color: 'text.primary' }}
      >
        <Badge
          color='error'
          variant='dot'
          overlap='circular'
          invisible={notificationCount === 0}
          sx={{
            cursor: 'pointer',
            '& .MuiBadge-dot': {
              top: dropdownTokens.notifications.badgeTop,
              right: dropdownTokens.notifications.badgeRight,
              boxShadow: (theme) => getNotificationBadgeShadow(theme),
            },
          }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Notifications />
        </Badge>
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
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top',
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
                      {t('navigation.notifications')}
                    </Typography>
                    {notificationCount > 0 && (
                      <Chip
                        size='small'
                        color='primary'
                        label={`${notificationCount} ${t('navigation.new')}`}
                      />
                    )}
                    <Tooltip
                      title={readAll ? t('navigation.markAllUnread') : t('navigation.markAllRead')}
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
                      {notificationsState.length > 0 ? (
                        <IconButton
                          size='small'
                          onClick={() => readAllNotifications()}
                          sx={{ color: 'text.primary' }}
                        >
                          {readAll ? <Email fontSize='small' /> : <Drafts fontSize='small' />}
                        </IconButton>
                      ) : (
                        <></>
                      )}
                    </Tooltip>
                  </Box>
                  <Divider />
                  {notificationsState.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                      <Typography color='text.secondary' variant='body2'>
                        {t('navigation.noNotifications')}
                      </Typography>
                    </Box>
                  ) : (
                    <ScrollWrapper hidden={hidden}>
                      {notificationsState.map((notification, index) => {
                        const {
                          title,
                          subtitle,
                          time,
                          read,
                          avatarImage,
                          avatarIcon,
                          avatarText,
                          avatarColor,
                          avatarSkin,
                        } = notification

                        return (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              paddingBlock: dropdownTokens.notifications.itemPaddingBlock,
                              paddingInline: dropdownTokens.notifications.itemPaddingInline,
                              gap: dropdownTokens.notifications.itemGap,
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: 'action.hover',
                              },
                              '&:hover .group-visible': {
                                visibility: 'visible',
                              },
                              ...(index !== notificationsState.length - 1 && {
                                borderBlockEnd: 1,
                                borderBlockEndColor: 'divider',
                              }),
                            }}
                            onClick={(e) => handleReadNotification(e, true, index)}
                          >
                            {getAvatar({
                              avatarImage,
                              avatarIcon,
                              title,
                              avatarText,
                              avatarColor,
                              avatarSkin,
                            })}
                            <Box
                              sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto' }}
                            >
                              <Typography
                                variant='body2'
                                sx={{ fontWeight: 500, marginBlockEnd: 1 }}
                                color='text.primary'
                              >
                                {title}
                              </Typography>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                                sx={{ marginBlockEnd: 2 }}
                              >
                                {subtitle}
                              </Typography>
                              <Typography variant='caption' color='text.disabled'>
                                {time}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                gap: 2,
                              }}
                            >
                              <Badge
                                variant='dot'
                                color={read ? 'secondary' : 'primary'}
                                onClick={(e) => handleReadNotification(e, !read, index)}
                                sx={{
                                  marginBlockStart: 1,
                                  marginInlineEnd: 1,
                                  ...(read && {
                                    visibility: 'hidden',
                                    '.MuiBox-root:hover &': {
                                      visibility: 'visible',
                                    },
                                  }),
                                }}
                                className={read ? 'group-visible' : ''}
                              />
                              <IconButton
                                size='small'
                                className='group-visible'
                                sx={{
                                  visibility: read ? 'hidden' : 'visible',
                                }}
                                onClick={(e) => handleRemoveNotification(e, index)}
                              >
                                <Close fontSize='small' />
                              </IconButton>
                            </Box>
                          </Box>
                        )
                      })}
                    </ScrollWrapper>
                  )}
                  <Divider />
                  <Box sx={{ p: dropdownTokens.notifications.footerPadding }}>
                    <Button fullWidth variant='contained' size='small'>
                      {t('navigation.viewAllNotifications')}
                    </Button>
                  </Box>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default NotificationDropdown
