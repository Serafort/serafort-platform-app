import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Typography,
  TextField,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Paper,
  Chip,
  IconButton,
} from '@mui/material'
import Search from '@mui/icons-material/Search'
import Download from '@mui/icons-material/Download'
import Pause from '@mui/icons-material/Pause'
import PlayArrow from '@mui/icons-material/PlayArrow'
import Settings from '@mui/icons-material/Settings'
import Notifications from '@mui/icons-material/Notifications'
import Login from '@mui/icons-material/Login'
import Logout from '@mui/icons-material/Logout'
import Sync from '@mui/icons-material/Sync'
import ErrorIcon from '@mui/icons-material/Error'
import Lock from '@mui/icons-material/Lock'
import CheckCircle from '@mui/icons-material/CheckCircle'
import Warning from '@mui/icons-material/Warning'
import Person from '@mui/icons-material/Person'
import Dns from '@mui/icons-material/Dns'
import LocationOn from '@mui/icons-material/LocationOn'
import Timer from '@mui/icons-material/Timer'
import Group from '@mui/icons-material/Group'
import GppBad from '@mui/icons-material/GppBad'
import TrendingUp from '@mui/icons-material/TrendingUp'
import TrendingDown from '@mui/icons-material/TrendingDown'
import History from '@mui/icons-material/History'
import Smartphone from '@mui/icons-material/Smartphone'
import PublicOff from '@mui/icons-material/PublicOff'
import MonitorIcon from '@mui/icons-material/Monitor'
import { alpha, useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

/**
 * Real-time auth-events monitor — design-preview variant.
 *
 * The wired implementation is `RealTimeAuthEventsMonitor` (V1); this V2 screen
 * is the token-driven visual treatment for the same stream and renders sample
 * rows until it is connected to the live SSE feed. Every string routes through
 * i18n and every surface radius through the `--sf-*` scale so the eventual
 * data-wiring is a drop-in.
 */

type EventType = 'login' | 'logout' | 'refresh' | 'failed' | 'mfa'
type EventBadge = 'success' | 'info' | 'blocked' | 'pending'

interface StreamEvent {
  id: string
  type: EventType
  badge: EventBadge
  time: string
  email: string
  ip?: string
  location?: string
  device?: string
  details?: string
}

const SAMPLE_EVENTS: StreamEvent[] = [
  {
    id: '1',
    type: 'login',
    badge: 'success',
    time: '10:42:05',
    email: 'user@example.com',
    ip: '192.168.1.1',
    location: 'San Francisco, US',
  },
  { id: '2', type: 'refresh', badge: 'info', time: '10:42:02', email: 'admin@corp.com', ip: '10.0.0.5' },
  {
    id: '3',
    type: 'failed',
    badge: 'blocked',
    time: '10:41:55',
    email: 'unknown@hacker.net',
    ip: '45.33.22.11',
    details: 'suspiciousIp',
  },
  {
    id: '4',
    type: 'mfa',
    badge: 'pending',
    time: '10:41:30',
    email: 'sarah@dev.io',
    ip: '192.168.1.2',
    device: 'smsSent',
  },
  {
    id: '5',
    type: 'logout',
    badge: 'info',
    time: '10:40:00',
    email: 'user@example.com',
    details: 'sessionDuration',
  },
]

const RealTimeAuthEventsMonitorV2 = () => {
  const theme = useTheme()
  const { t } = useTranslation('common')
  const [isPaused, setIsPaused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [eventFilters, setEventFilters] = useState<Record<EventType, boolean>>({
    login: true,
    logout: true,
    refresh: true,
    failed: true,
    mfa: true,
  })

  const K = 'monitoring.realtimeV2'

  const eventTitle = (type: EventType) =>
    ({
      login: t(`${K}.event_login`, 'Login success'),
      logout: t(`${K}.event_logout`, 'Logout'),
      refresh: t(`${K}.event_refresh`, 'Token refresh'),
      failed: t(`${K}.event_failed`, 'Failed login attempt'),
      mfa: t(`${K}.event_mfa`, 'MFA challenge'),
    })[type]

  const badgeLabel = (badge: EventBadge) =>
    ({
      success: t(`${K}.badge_success`, 'Success'),
      info: t(`${K}.badge_info`, 'Info'),
      blocked: t(`${K}.badge_blocked`, 'Blocked'),
      pending: t(`${K}.badge_pending`, 'Pending'),
    })[badge]

  const detailLabel = (key?: string) => {
    if (!key) return undefined
    return (
      {
        suspiciousIp: t(`${K}.detail_suspiciousIp`, 'Suspicious IP block'),
        smsSent: t(`${K}.detail_smsSent`, 'SMS sent'),
        sessionDuration: t(`${K}.detail_sessionDuration`, 'Session duration: 45m'),
      }[key] ?? key
    )
  }

  const getEventIcon = (type: EventType) => {
    const iconProps = { sx: { fontSize: 18 } }
    switch (type) {
      case 'login':
        return <CheckCircle {...iconProps} />
      case 'refresh':
        return <Sync {...iconProps} />
      case 'failed':
        return <Warning {...iconProps} />
      case 'mfa':
        return <Lock {...iconProps} />
      case 'logout':
        return <Logout {...iconProps} />
    }
  }

  const getEventColor = (type: EventType) => {
    switch (type) {
      case 'login':
        return { bg: alpha(theme.palette.success.main, 0.1), text: theme.palette.success.main }
      case 'refresh':
        return { bg: alpha(theme.palette.primary.main, 0.1), text: theme.palette.primary.main }
      case 'failed':
        return { bg: alpha(theme.palette.error.main, 0.1), text: theme.palette.error.main }
      case 'mfa':
        return { bg: alpha(theme.palette.warning.main, 0.1), text: theme.palette.warning.main }
      case 'logout':
        return { bg: theme.palette.action.hover, text: theme.palette.text.secondary }
    }
  }

  const getBadgeColor = (badge: EventBadge) => {
    switch (badge) {
      case 'success':
        return { bg: alpha(theme.palette.success.main, 0.1), text: theme.palette.success.main }
      case 'blocked':
        return { bg: alpha(theme.palette.error.main, 0.1), text: theme.palette.error.main }
      case 'pending':
        return { bg: alpha(theme.palette.warning.main, 0.1), text: theme.palette.warning.main }
      default:
        return { bg: alpha(theme.palette.info.main, 0.1), text: theme.palette.info.main }
    }
  }

  const eventTypeFilters = useMemo(
    () => [
      { key: 'login' as const, label: t(`${K}.filter_login`, 'Login'), icon: <Login sx={{ fontSize: 14 }} />, color: theme.palette.success.main },
      { key: 'logout' as const, label: t(`${K}.filter_logout`, 'Logout'), icon: <Logout sx={{ fontSize: 14 }} />, color: theme.palette.text.secondary },
      { key: 'refresh' as const, label: t(`${K}.filter_refresh`, 'Token refresh'), icon: <Sync sx={{ fontSize: 14 }} />, color: theme.palette.primary.main },
      { key: 'failed' as const, label: t(`${K}.filter_failed`, 'Failed attempt'), icon: <ErrorIcon sx={{ fontSize: 14 }} />, color: theme.palette.error.main },
      { key: 'mfa' as const, label: t(`${K}.filter_mfa`, 'MFA challenge'), icon: <Lock sx={{ fontSize: 14 }} />, color: theme.palette.warning.main },
    ],
    [t, theme],
  )

  const statCards = useMemo(
    () => [
      { label: t(`${K}.stat_activeSessions`, 'Active sessions'), value: '842', trend: '+12%', up: true, icon: <Group sx={{ fontSize: 64, color: 'primary.main' }} /> },
      { label: t(`${K}.stat_failedLogins`, 'Failed logins (1h)'), value: '14', trend: '-2%', up: true, icon: <GppBad sx={{ fontSize: 64, color: 'error.main' }} /> },
      { label: t(`${K}.stat_latency`, 'Avg. latency'), value: '45ms', trend: '+5%', up: false, icon: <Timer sx={{ fontSize: 64, color: 'warning.main' }} /> },
    ],
    [t],
  )

  const visibleEvents = SAMPLE_EVENTS.filter((event) => eventFilters[event.type])

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      {/* Top bar */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          px: 3,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: 'var(--sf-radius-md, 8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MonitorIcon sx={{ color: 'primary.main', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '18px', fontWeight: 700, color: 'text.primary' }}>
              {t(`${K}.title`, 'AuthStream monitor')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: isPaused ? 'text.disabled' : 'success.main',
                  animation: isPaused ? 'none' : 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                  },
                }}
              />
              <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'text.secondary' }}>
                {isPaused
                  ? t(`${K}.status_paused`, 'Stream paused')
                  : t(`${K}.status_receiving`, 'Receiving events')}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant='contained'
            startIcon={<Download />}
            sx={{
              minHeight: 36,
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 700,
              borderRadius: 'var(--sf-radius-md, 8px)',
            }}
          >
            {t(`${K}.exportLog`, 'Export log')}
          </Button>
          <Button
            variant='outlined'
            startIcon={isPaused ? <PlayArrow /> : <Pause />}
            onClick={() => setIsPaused((prev) => !prev)}
            sx={{
              minHeight: 36,
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 700,
              borderColor: 'divider',
              color: 'text.primary',
              borderRadius: 'var(--sf-radius-md, 8px)',
              '&:hover': { bgcolor: 'action.hover', borderColor: 'divider' },
            }}
          >
            {isPaused ? t(`${K}.resumeStream`, 'Resume stream') : t(`${K}.pauseStream`, 'Pause stream')}
          </Button>
          <IconButton
            aria-label={t(`${K}.settings`, 'Stream settings')}
            sx={{ width: 36, height: 36, bgcolor: 'action.hover', borderRadius: 'var(--sf-radius-md, 8px)' }}
          >
            <Settings fontSize='small' />
          </IconButton>
          <IconButton
            aria-label={t(`${K}.alerts`, 'Alert settings')}
            sx={{ width: 36, height: 36, bgcolor: 'action.hover', borderRadius: 'var(--sf-radius-md, 8px)' }}
          >
            <Notifications fontSize='small' />
          </IconButton>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Filters rail */}
        <Box
          sx={{
            width: 320,
            flexShrink: 0,
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider',
            overflow: 'auto',
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography sx={{ fontSize: '20px', fontWeight: 700, color: 'text.primary', mb: 3 }}>
              {t(`${K}.filters`, 'Filters')}
            </Typography>

            <TextField
              fullWidth
              placeholder={t(`${K}.searchPlaceholder`, 'Search user ID or IP')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <Box sx={{ opacity: 0.6, pointerEvents: 'none', mb: 3 }}>
              <Typography
                sx={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  mb: 0.5,
                }}
              >
                {t(`${K}.dateRange`, 'Date range')}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 1.5,
                  py: 1.25,
                  bgcolor: 'action.hover',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 'var(--sf-radius-md, 8px)',
                }}
              >
                <Timer sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
                  {t(`${K}.dateRangeLive`, 'Live (current session)')}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ borderTop: 1, borderColor: 'divider', px: 3, py: 3, flex: 1 }}>
            <Typography
              sx={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                mb: 2,
              }}
            >
              {t(`${K}.eventTypes`, 'Event types')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {eventTypeFilters.map((filter) => (
                <FormControlLabel
                  key={filter.key}
                  control={
                    <Checkbox
                      checked={eventFilters[filter.key]}
                      onChange={(e) =>
                        setEventFilters((prev) => ({ ...prev, [filter.key]: e.target.checked }))
                      }
                      sx={{ '&.Mui-checked': { color: 'primary.main' } }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: alpha(filter.color, 0.1),
                          color: filter.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {filter.icon}
                      </Box>
                      <Typography sx={{ fontSize: '14px', fontWeight: 500, color: 'text.primary' }}>
                        {filter.label}
                      </Typography>
                    </Box>
                  }
                  sx={{
                    py: 0.75,
                    '&:hover': { bgcolor: 'action.hover' },
                    borderRadius: 'var(--sf-radius-xs, 4px)',
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ borderTop: 1, borderColor: 'divider', p: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: 1,
                borderColor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: 'var(--sf-radius-lg, 12px)',
              }}
            >
              <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'primary.main', mb: 0.5 }}>
                {t(`${K}.systemStatus`, 'System status')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography sx={{ fontSize: '14px', color: 'text.primary' }}>
                  {t(`${K}.systemOperational`, 'All systems operational')}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Feed */}
        <Box sx={{ flex: 1, bgcolor: 'background.default', overflow: 'auto' }}>
          <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: 2,
                mb: 3,
              }}
            >
              {statCards.map((stat) => (
                <Paper
                  key={stat.label}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 'var(--sf-radius-lg, 12px)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': { borderColor: 'primary.main' },
                    transition: 'border-color 0.2s',
                  }}
                >
                  <Box sx={{ position: 'absolute', top: 0, right: 0, p: 2, opacity: 0.1 }}>
                    {stat.icon}
                  </Box>
                  <Typography sx={{ fontSize: '14px', color: 'text.secondary', fontWeight: 500, mb: 1 }}>
                    {stat.label}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                    <Typography sx={{ fontSize: '30px', fontWeight: 700, color: 'text.primary' }}>
                      {stat.value}
                    </Typography>
                    <Chip
                      icon={stat.up ? <TrendingUp /> : <TrendingDown />}
                      label={stat.trend}
                      size='small'
                      sx={{
                        height: 20,
                        fontSize: '11px',
                        fontWeight: 700,
                        bgcolor: stat.up
                          ? alpha(theme.palette.success.main, 0.1)
                          : alpha(theme.palette.error.main, 0.1),
                        color: stat.up ? 'success.main' : 'error.main',
                        border: 1,
                        borderColor: stat.up
                          ? alpha(theme.palette.success.main, 0.2)
                          : alpha(theme.palette.error.main, 0.2),
                        '& .MuiChip-icon': { fontSize: 12, color: 'inherit' },
                      }}
                    />
                  </Box>
                </Paper>
              ))}
            </Box>

            <Paper
              elevation={0}
              sx={{
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                borderRadius: 'var(--sf-radius-lg, 12px)',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  borderBottom: 1,
                  borderColor: 'divider',
                  bgcolor: 'action.hover',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ fontSize: '16px', fontWeight: 700, color: 'text.primary' }}>
                  {t(`${K}.liveFeed`, 'Live feed')}
                </Typography>
                <Box
                  sx={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: 'text.secondary',
                    bgcolor: 'action.hover',
                    border: 1,
                    borderColor: 'divider',
                    px: 1,
                    py: 0.5,
                    borderRadius: 'var(--sf-radius-xs, 4px)',
                  }}
                >
                  {t(`${K}.lastUpdatedNow`, 'Last updated: just now')}
                </Box>
              </Box>

              <Box sx={{ p: 3 }}>
                {visibleEvents.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <History sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                    <Typography variant='body2' color='text.secondary'>
                      {t(`${K}.noEvents`, 'No events match the current filters.')}
                    </Typography>
                  </Box>
                ) : (
                  visibleEvents.map((event, idx) => {
                    const colors = getEventColor(event.type)
                    const badgeColors = getBadgeColor(event.badge)
                    const isLast = idx === visibleEvents.length - 1

                    return (
                      <Box
                        key={event.id}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '48px 1fr',
                          gap: 2,
                          pb: isLast ? 0 : 4,
                        }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: colors.bg,
                              color: colors.text,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: 4,
                              borderColor: 'background.paper',
                              zIndex: 1,
                            }}
                          >
                            {getEventIcon(event.type)}
                          </Box>
                          {!isLast && (
                            <Box sx={{ width: 1, flex: 1, bgcolor: 'divider', mt: 1 }} />
                          )}
                        </Box>

                        <Box>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mb: 0.5,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'text.primary' }}>
                                {eventTitle(event.type)}
                              </Typography>
                              <Chip
                                label={badgeLabel(event.badge)}
                                size='small'
                                sx={{
                                  height: 18,
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  bgcolor: badgeColors.bg,
                                  color: badgeColors.text,
                                }}
                              />
                            </Box>
                            <Typography
                              sx={{ fontSize: '11px', fontFamily: 'monospace', color: 'text.secondary' }}
                            >
                              {event.time}
                            </Typography>
                          </Box>

                          <Paper
                            elevation={0}
                            sx={{
                              p: 1.5,
                              bgcolor:
                                event.type === 'failed'
                                  ? alpha(theme.palette.error.main, 0.05)
                                  : 'action.hover',
                              border: 1,
                              borderColor:
                                event.type === 'failed'
                                  ? alpha(theme.palette.error.main, 0.2)
                                  : 'divider',
                              borderRadius: 'var(--sf-radius-md, 8px)',
                              '&:hover': {
                                borderColor:
                                  event.type === 'failed'
                                    ? alpha(theme.palette.error.main, 0.3)
                                    : 'primary.main',
                              },
                              transition: 'border-color 0.2s',
                            }}
                          >
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, fontSize: '14px' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
                                <Person
                                  sx={{
                                    fontSize: 16,
                                    color: event.type === 'failed' ? 'error.main' : 'text.secondary',
                                  }}
                                />
                                <Typography sx={{ fontWeight: 500, color: 'text.primary' }}>
                                  {event.email}
                                </Typography>
                              </Box>
                              {event.ip && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Dns
                                    sx={{
                                      fontSize: 16,
                                      color: event.type === 'failed' ? 'error.main' : 'text.secondary',
                                    }}
                                  />
                                  <Typography
                                    sx={{ fontFamily: 'monospace', fontSize: '13px', color: 'text.secondary' }}
                                  >
                                    {event.ip}
                                  </Typography>
                                </Box>
                              )}
                              {event.location && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
                                    {event.location}
                                  </Typography>
                                </Box>
                              )}
                              {event.device && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                                  <Smartphone sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
                                    {detailLabel(event.device)}
                                  </Typography>
                                </Box>
                              )}
                              {event.details && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                                  {event.type === 'failed' ? (
                                    <PublicOff sx={{ fontSize: 16, color: 'error.main' }} />
                                  ) : (
                                    <Timer sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  )}
                                  <Typography
                                    sx={{
                                      fontSize: event.type === 'failed' ? '12px' : '14px',
                                      fontWeight: event.type === 'failed' ? 600 : 400,
                                      color: event.type === 'failed' ? 'error.main' : 'text.secondary',
                                    }}
                                  >
                                    {detailLabel(event.details)}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Paper>
                        </Box>
                      </Box>
                    )
                  })
                )}
              </Box>

              <Box
                sx={{
                  px: 3,
                  py: 2,
                  borderTop: 1,
                  borderColor: 'divider',
                  bgcolor: 'action.hover',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Button
                  startIcon={<History />}
                  sx={{
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'transparent', color: 'primary.dark' },
                  }}
                >
                  {t(`${K}.loadOlder`, 'Load older events')}
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default RealTimeAuthEventsMonitorV2
