import React, { useState, useMemo, useDeferredValue, useEffect, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminPageHeader } from '@auth/modules/authentication-core/components/shared/admin'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  Skeleton,
} from '@mui/material'
import Search from '@mui/icons-material/Search'
import Download from '@mui/icons-material/Download'
import Sensors from '@mui/icons-material/Sensors'
import Pause from '@mui/icons-material/Pause'
import PlayArrow from '@mui/icons-material/PlayArrow'
import CheckCircle from '@mui/icons-material/CheckCircle'
import Key from '@mui/icons-material/Key'
import GppBad from '@mui/icons-material/GppBad'
import LockPerson from '@mui/icons-material/LockPerson'
import Logout from '@mui/icons-material/Logout'
import Sync from '@mui/icons-material/Sync'
import ContentCopy from '@mui/icons-material/ContentCopy'
import Group from '@mui/icons-material/Group'
import Speed from '@mui/icons-material/Speed'
import Timer from '@mui/icons-material/Timer'
import { themeConfig, useNotifications } from '@cap/platform-core'
import { alpha, useTheme } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'
import useLiveAuthEventFeed, {
  type AuthEventKind,
  type LiveAuthEvent,
} from '../../hooks/useLiveAuthEventFeed'
import resolveEventLocation from '../../utils/resolveEventLocation'
import type { MapPoint } from '../../components/monitoring/AuthEventWorldMap'

// The bundled world geometry is ~58 KB of path data that only the detail panel
// needs, so it loads with the panel rather than with the route chunk.
const AuthEventWorldMap = React.lazy(() => import('../../components/monitoring/AuthEventWorldMap'))

const GRID_TEMPLATE = '120px 1fr 120px 150px 100px'

type EventFilter = 'all' | AuthEventKind

/**
 * Formats the server timestamp for the feed's time column.
 *
 * Millisecond precision matters when reading a burst of events, and the value
 * is derived from the server's own ISO timestamp rather than the moment the
 * browser happened to receive it.
 */
const formatEventTime = (isoTimestamp: string): string => {
  const date = new Date(isoTimestamp)
  if (Number.isNaN(date.getTime())) return '—'
  const time = date.toLocaleTimeString(undefined, { hour12: false })
  return `${time}.${String(date.getMilliseconds()).padStart(3, '0')}`
}

const initialsOf = (actor: string): string => {
  const source = actor.split('@')[0] ?? ''
  const words = source.split(/[.\-_\s]+/).filter(Boolean)
  const letters = words.slice(0, 2).map((word) => word[0])
  return letters.join('').toUpperCase() || '?'
}

/** Turns `auth.login_failed` into `Login failed` for the row's headline. */
const humaniseAction = (action: string): string => {
  const separator = Math.max(action.lastIndexOf('.'), action.lastIndexOf(':'))
  const tail = separator >= 0 ? action.slice(separator + 1) : action
  const spaced = tail.replace(/[._:-]+/g, ' ').trim()
  if (!spaced) return action
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase()
}

const formatUptime = (since: number | null): string => {
  if (!since) return '—'
  const seconds = Math.max(0, Math.floor((Date.now() - since) / 1000))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

export const RealTimeAuthEventsMonitor: React.FC = () => {
  const theme = useTheme()
  const { t } = useTranslation('common')
  const { addNotification } = useNotifications()

  const {
    events,
    status,
    isPaused,
    bufferedCount,
    throughputPerMinute,
    connectedSince,
    togglePause,
  } = useLiveAuthEventFeed()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<EventFilter>('all')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  // Re-render the uptime readout on its own clock; nothing else depends on it.
  const [, setUptimeTick] = useState(0)
  useEffect(() => {
    if (!connectedSince) return undefined
    const interval = setInterval(() => setUptimeTick((tick) => tick + 1), 1000)
    return () => clearInterval(interval)
  }, [connectedSince])

  const eventTypeMeta = useMemo(
    () => ({
      success: {
        label: t('monitoring.events.type.success', 'Success'),
        color: theme.palette.success.main,
        icon: CheckCircle,
        tone: 'success' as const,
      },
      refresh: {
        label: t('monitoring.events.type.refresh', 'Refresh'),
        color: theme.palette.primary.main,
        icon: Key,
        tone: 'primary' as const,
      },
      failed: {
        label: t('monitoring.events.type.failed', 'Failed'),
        color: theme.palette.error.main,
        icon: GppBad,
        tone: 'error' as const,
      },
      mfa: {
        label: t('monitoring.events.type.mfa', 'MFA'),
        color: theme.palette.warning.main,
        icon: LockPerson,
        tone: 'warning' as const,
      },
      logout: {
        label: t('monitoring.events.type.logout', 'Logout'),
        color: theme.palette.info.main,
        icon: Logout,
        tone: 'info' as const,
      },
      other: {
        label: t('monitoring.events.type.other', 'Event'),
        color: theme.palette.text.secondary,
        icon: Sync,
        tone: 'primary' as const,
      },
    }),
    [t, theme],
  )

  const deferredSearchQuery = useDeferredValue(searchQuery)
  const filteredEvents = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase()
    const isAllFilter = selectedFilter === 'all'
    if (!query && isAllFilter) return events

    return events.filter((event) => {
      if (!isAllFilter && event.kind !== selectedFilter) return false
      if (!query) return true
      return (
        event.id.toLowerCase().includes(query) ||
        event.actor.toLowerCase().includes(query) ||
        event.action.toLowerCase().includes(query) ||
        (event.ip ?? '').toLowerCase().includes(query) ||
        (event.userAgent ?? '').toLowerCase().includes(query) ||
        (event.city ?? '').toLowerCase().includes(query) ||
        (event.country ?? '').toLowerCase().includes(query)
      )
    })
  }, [events, selectedFilter, deferredSearchQuery])

  // Follow the head of the stream until the operator picks a row, so a live
  // feed keeps the detail panel meaningful without stealing an explicit choice.
  const selectedEvent = useMemo(() => {
    if (selectedEventId) {
      const pinned = events.find((event) => event.id === selectedEventId)
      if (pinned) return pinned
    }
    return filteredEvents[0] ?? events[0] ?? null
  }, [events, filteredEvents, selectedEventId])

  const selectedLocation = useMemo(
    () => (selectedEvent ? resolveEventLocation(selectedEvent) : null),
    [selectedEvent],
  )

  /** Recent located events, so the map shows where traffic is coming from. */
  const mapTrail = useMemo<MapPoint[]>(() => {
    const points: MapPoint[] = []
    for (const event of filteredEvents.slice(0, 40)) {
      if (event.id === selectedEvent?.id) continue
      const location = resolveEventLocation(event)
      if (location.kind !== 'located') continue
      points.push({
        id: event.id,
        lon: location.lon,
        lat: location.lat,
        tone: eventTypeMeta[event.kind].tone,
      })
    }
    return points
  }, [filteredEvents, selectedEvent, eventTypeMeta])

  const formattedPayload = useMemo(
    () => (selectedEvent ? JSON.stringify(selectedEvent.raw, null, 2) : '{}'),
    [selectedEvent],
  )

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    addNotification({
      type: 'success',
      title: t('monitoring.events.copied', 'Copied to clipboard'),
      message: t('monitoring.events.copiedBody', '{{label}} copied successfully.', { label }),
    })
  }

  const handleTogglePause = () => {
    togglePause()
    addNotification(
      isPaused
        ? {
            type: 'info',
            title: t('monitoring.events.resumed', 'Stream resumed'),
            message: t(
              'monitoring.events.resumedBody',
              'Live authentication telemetry is streaming again.',
            ),
          }
        : {
            type: 'warning',
            title: t('monitoring.events.paused', 'Stream paused'),
            message: t(
              'monitoring.events.pausedBody',
              'Incoming events are buffered until you resume.',
            ),
          },
    )
  }

  const handleExportCSV = () => {
    if (filteredEvents.length === 0) {
      addNotification({
        type: 'warning',
        title: t('monitoring.events.exportEmpty', 'Nothing to export'),
        message: t('monitoring.events.exportEmptyBody', 'No events match the current filters.'),
      })
      return
    }

    const headers = [
      'Event ID',
      'Timestamp',
      'Action',
      'Actor',
      'Category',
      'Severity',
      'Status',
      'IP Address',
      'City',
      'Country',
      'User Agent',
    ]
    const escape = (value: string | null) => `"${String(value ?? '').replace(/"/g, '""')}"`
    const rows = filteredEvents.map((event) =>
      [
        event.id,
        event.timestamp,
        event.action,
        event.actor,
        event.kind,
        event.severity,
        event.status,
        event.ip,
        event.city,
        event.country,
        event.userAgent,
      ].map(escape),
    )

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `auth_events_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    addNotification({
      type: 'success',
      title: t('monitoring.events.exported', 'Export complete'),
      message: t('monitoring.events.exportedBody', 'Exported {{count}} events as CSV.', {
        count: filteredEvents.length,
      }),
    })
  }

  const failedEvents = useMemo(
    () => events.filter((event) => event.kind === 'failed').length,
    [events],
  )

  const statusMeta: Record<typeof status, { label: string; color: string }> = {
    live: { label: t('monitoring.events.status.live', 'Live'), color: theme.palette.success.main },
    connecting: {
      label: t('monitoring.events.status.connecting', 'Connecting'),
      color: theme.palette.warning.main,
    },
    polling: {
      label: t('monitoring.events.status.polling', 'Polling'),
      color: theme.palette.warning.main,
    },
    paused: {
      label: t('monitoring.events.status.paused', 'Paused'),
      color: theme.palette.warning.main,
    },
    offline: {
      label: t('monitoring.events.status.offline', 'Offline'),
      color: theme.palette.error.main,
    },
  }

  const stats = [
    {
      label: t('monitoring.events.stat.captured', 'Events captured'),
      value: String(events.length),
      change: statusMeta[status].label,
      icon: Group,
      color: theme.palette.primary.main,
      negative: status !== 'live',
    },
    {
      label: t('monitoring.events.stat.throughput', 'Throughput'),
      value: t('monitoring.events.stat.throughputValue', '{{count}} evt/min', {
        count: throughputPerMinute,
      }),
      change: t('monitoring.events.stat.throughputWindow', 'last 60s'),
      icon: Speed,
      color: theme.palette.primary.main,
    },
    {
      label: t('monitoring.events.stat.failed', 'Failed attempts'),
      value: String(failedEvents),
      change: t('monitoring.events.stat.failedAlerts', '{{count}} alerts', {
        count: failedEvents,
      }),
      icon: GppBad,
      color: failedEvents > 0 ? theme.palette.error.main : theme.palette.success.main,
      negative: failedEvents > 0,
    },
    {
      label: t('monitoring.events.stat.uptime', 'Stream uptime'),
      value: formatUptime(connectedSince),
      change: statusMeta[status].label,
      icon: Timer,
      color: theme.palette.primary.main,
      negative: !connectedSince,
    },
  ]

  const filterChips: Array<{ value: EventFilter; label: string; dot?: string }> = [
    { value: 'all', label: t('monitoring.events.filter.all', 'All events') },
    {
      value: 'success',
      label: eventTypeMeta.success.label,
      dot: theme.palette.success.main,
    },
    { value: 'failed', label: eventTypeMeta.failed.label, dot: theme.palette.error.main },
    { value: 'mfa', label: eventTypeMeta.mfa.label, dot: theme.palette.warning.main },
    { value: 'refresh', label: eventTypeMeta.refresh.label, dot: theme.palette.primary.main },
    { value: 'logout', label: eventTypeMeta.logout.label, dot: theme.palette.info.main },
  ]

  return (
    <>
      <title>
        {t('monitoring.events.title', 'Real-time Auth Events Monitor')} - {themeConfig.templateName}
      </title>

      <Container maxWidth={false} sx={{ maxWidth: 1600, px: { xs: 2, lg: 5 }, py: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
          <AdminPageHeader
            icon={<Sensors />}
            title={t('monitoring.events.title', 'Real-time Auth Events Monitor')}
            description={t(
              'monitoring.events.subtitle',
              'Live stream of authentication activities, security verification, and token lifecycle events.',
            )}
            actions={
              <Button
                startIcon={<Download />}
                variant='outlined'
                onClick={handleExportCSV}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 'var(--sf-radius-md, 8px)',
                  minHeight: 44,
                }}
              >
                {t('monitoring.events.export', 'Export CSV ({{count}})', {
                  count: filteredEvents.length,
                })}
              </Button>
            }
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 2,
            }}
          >
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Paper
                  key={stat.label}
                  sx={(surfaceTheme: Theme) => ({
                    p: 3,
                    borderRadius: 'var(--sf-radius-md, 8px)',
                    border: '1px solid ' + surfaceTheme.palette.divider,
                    ...buildLayoutSurfaceEffect(getTenantThemeEffects(surfaceTheme), surfaceTheme),
                  })}
                >
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}
                  >
                    <Typography color='text.secondary' variant='body2' fontWeight={500}>
                      {stat.label}
                    </Typography>
                    <Icon sx={{ color: stat.color }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mt: 1 }}>
                    <Typography variant='h4' fontWeight={700} sx={{ color: 'text.primary' }}>
                      {stat.value}
                    </Typography>
                    <Chip
                      label={stat.change}
                      size='small'
                      sx={{
                        bgcolor: stat.negative
                          ? alpha(theme.palette.warning.main, 0.12)
                          : alpha(theme.palette.success.main, 0.12),
                        color: stat.negative ? 'warning.main' : 'success.main',
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    />
                  </Box>
                </Paper>
              )
            })}
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            mb: 3,
            p: 1.5,
            bgcolor: 'background.paper',
            borderRadius: 'var(--sf-radius-md, 8px)',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Button
            startIcon={isPaused ? <PlayArrow /> : <Pause />}
            variant='contained'
            onClick={handleTogglePause}
            color={isPaused ? 'warning' : 'primary'}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 'var(--sf-radius-md, 8px)',
              minHeight: 44,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {isPaused
              ? t('monitoring.events.resume', 'Resume ({{count}} buffered)', {
                  count: bufferedCount,
                })
              : t('monitoring.events.pause', 'Pause stream')}
          </Button>

          <TextField
            fullWidth
            size='small'
            placeholder={t(
              'monitoring.events.searchPlaceholder',
              'Search by actor, action, IP address, or device…',
            )}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <Search fontSize='small' sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              minWidth: 260,
              '& .MuiOutlinedInput-root': {
                borderRadius: 'var(--sf-radius-md, 8px)',
                minHeight: 44,
              },
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {filterChips.map((chip) => (
              <Chip
                key={chip.value}
                label={chip.label}
                onClick={() => setSelectedFilter(chip.value)}
                aria-pressed={selectedFilter === chip.value}
                variant={selectedFilter === chip.value ? 'filled' : 'outlined'}
                color={selectedFilter === chip.value ? 'primary' : 'default'}
                icon={
                  chip.dot ? (
                    <Box
                      sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: chip.dot }}
                      aria-hidden
                    />
                  ) : undefined
                }
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 3,
            minHeight: 560,
          }}
        >
          <Paper
            sx={(surfaceTheme: Theme) => ({
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 'var(--sf-radius-md, 8px)',
              overflow: 'hidden',
              border: '1px solid ' + surfaceTheme.palette.divider,
              ...buildLayoutSurfaceEffect(getTenantThemeEffects(surfaceTheme), surfaceTheme),
            })}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: GRID_TEMPLATE,
                gap: 2,
                px: 3,
                py: 1.5,
                bgcolor: 'action.hover',
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              {[
                t('monitoring.events.column.time', 'TIME'),
                t('monitoring.events.column.actor', 'ACTOR / ACTION'),
                t('monitoring.events.column.type', 'TYPE'),
                t('monitoring.events.column.ip', 'IP SOURCE'),
                t('monitoring.events.column.severity', 'SEVERITY'),
              ].map((heading) => (
                <Typography key={heading} variant='caption' fontWeight={700} color='text.secondary'>
                  {heading}
                </Typography>
              ))}
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 580 }}>
              {filteredEvents.length === 0 ? (
                <Box sx={{ p: 6, textAlign: 'center' }}>
                  <Typography variant='body1' fontWeight={600} color='text.secondary'>
                    {status === 'connecting'
                      ? t('monitoring.events.empty.connecting', 'Connecting to the event stream…')
                      : events.length === 0
                        ? t(
                            'monitoring.events.empty.noEvents',
                            'No authentication events yet. New activity appears here the moment it happens.',
                          )
                        : t('monitoring.events.empty.noMatches', 'No events match your filter.')}
                  </Typography>
                </Box>
              ) : (
                filteredEvents.map((event) => (
                  <EventRow
                    key={event.id}
                    event={event}
                    meta={eventTypeMeta[event.kind]}
                    isSelected={selectedEvent?.id === event.id}
                    onSelect={setSelectedEventId}
                    unattributedLabel={t('monitoring.events.detail.unattributed', 'Unattributed')}
                  />
                ))
              )}
            </Box>

            <Box
              sx={{
                p: 1.5,
                bgcolor: 'action.hover',
                borderTop: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 3,
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  aria-hidden
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: statusMeta[status].color,
                    animation: status === 'live' ? 'pulse 2s ease-in-out infinite' : 'none',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.3 },
                    },
                  }}
                />
                <Typography variant='caption' fontWeight={500} color='text.secondary'>
                  {status === 'paused'
                    ? t('monitoring.events.footer.paused', 'Paused — {{count}} events queued', {
                        count: bufferedCount,
                      })
                    : status === 'live'
                      ? t('monitoring.events.footer.live', 'Live telemetry active')
                      : status === 'polling'
                        ? t(
                            'monitoring.events.footer.polling',
                            'Stream unavailable — polling audit history',
                          )
                        : t('monitoring.events.footer.connecting', 'Connecting…')}
                </Typography>
              </Box>
              <Typography variant='caption' color='text.secondary'>
                {t('monitoring.events.footer.count', 'Showing {{shown}} of {{total}} events', {
                  shown: filteredEvents.length,
                  total: events.length,
                })}
              </Typography>
            </Box>
          </Paper>

          {selectedEvent && selectedLocation && (
            <Paper
              sx={(surfaceTheme: Theme) => ({
                width: { xs: '100%', lg: 440 },
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 'var(--sf-radius-md, 8px)',
                overflow: 'hidden',
                border: '1px solid ' + surfaceTheme.palette.divider,
                ...buildLayoutSurfaceEffect(getTenantThemeEffects(surfaceTheme), surfaceTheme),
              })}
            >
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  bgcolor: 'action.hover',
                  borderBottom: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant='caption' fontWeight={700} color='text.secondary'>
                    {t('monitoring.events.detail.eventId', 'SELECTED EVENT ID')}
                  </Typography>
                  <Typography
                    variant='body2'
                    fontFamily='monospace'
                    fontWeight={600}
                    noWrap
                    sx={{ mt: 0.5, color: 'text.primary' }}
                  >
                    {selectedEvent.id}
                  </Typography>
                </Box>
                <Tooltip title={t('monitoring.events.detail.copyPayload', 'Copy raw JSON payload')}>
                  <IconButton
                    size='small'
                    aria-label={t('monitoring.events.detail.copyPayload', 'Copy raw JSON payload')}
                    onClick={() =>
                      handleCopy(
                        formattedPayload,
                        t('monitoring.events.detail.payloadLabel', 'Raw JSON payload'),
                      )
                    }
                    sx={{ color: 'text.secondary' }}
                  >
                    <ContentCopy fontSize='small' />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  maxHeight: 580,
                }}
              >
                <Box>
                  <Typography
                    variant='caption'
                    fontWeight={700}
                    color='text.secondary'
                    mb={1.5}
                    component='div'
                  >
                    {t('monitoring.events.detail.actorContext', 'ACTOR CONTEXT')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        fontWeight: 700,
                      }}
                    >
                      {initialsOf(selectedEvent.actor)}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant='body2' fontWeight={600} color='text.primary' noWrap>
                        {selectedEvent.actor ||
                          t('monitoring.events.detail.unattributed', 'Unattributed')}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {humaniseAction(selectedEvent.action)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                    <DetailTile
                      label={t('monitoring.events.detail.severity', 'Severity')}
                      value={selectedEvent.severity}
                    />
                    <DetailTile
                      label={t('monitoring.events.detail.category', 'Category')}
                      value={eventTypeMeta[selectedEvent.kind].label}
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography
                    variant='caption'
                    fontWeight={700}
                    color='text.secondary'
                    mb={1.5}
                    component='div'
                  >
                    {t('monitoring.events.detail.origin', 'ORIGIN')}
                  </Typography>
                  <Suspense
                    fallback={
                      <Skeleton variant='rounded' height={190} sx={{ borderRadius: 1.5 }} />
                    }
                  >
                    <AuthEventWorldMap
                      location={selectedLocation}
                      trail={mapTrail}
                      tone={eventTypeMeta[selectedEvent.kind].tone}
                    />
                  </Suspense>

                  <Box sx={{ mt: 1.5 }}>
                    <DetailRow
                      label={t('monitoring.events.detail.occurredAt', 'Occurred at')}
                      value={new Date(selectedEvent.timestamp).toLocaleString()}
                    />
                    <DetailRow
                      label={t('monitoring.events.detail.ip', 'IP address')}
                      value={selectedEvent.ip}
                      monospace
                      onCopy={
                        selectedEvent.ip
                          ? () =>
                              handleCopy(
                                selectedEvent.ip!,
                                t('monitoring.events.detail.ip', 'IP address'),
                              )
                          : undefined
                      }
                    />
                    <DetailRow
                      label={t('monitoring.events.detail.device', 'Client device')}
                      value={selectedEvent.userAgent}
                    />
                  </Box>
                </Box>

                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 160 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography variant='caption' fontWeight={700} color='text.secondary'>
                      {t('monitoring.events.detail.payload', 'STRUCTURED EVENT PAYLOAD')}
                    </Typography>
                    <Button
                      size='small'
                      variant='text'
                      onClick={() =>
                        handleCopy(
                          formattedPayload,
                          t('monitoring.events.detail.payloadLabel', 'Raw JSON payload'),
                        )
                      }
                      sx={{ fontSize: 12, textTransform: 'none', py: 0 }}
                    >
                      {t('monitoring.events.detail.copyJson', 'Copy JSON')}
                    </Button>
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.900',
                      borderRadius: 1.5,
                      p: 1.5,
                      overflow: 'auto',
                      border: 1,
                      borderColor: 'divider',
                      direction: 'ltr',
                    }}
                  >
                    <Typography
                      component='pre'
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: 12,
                        lineHeight: 1.6,
                        color: 'success.light',
                        margin: 0,
                        whiteSpace: 'pre',
                      }}
                    >
                      {formattedPayload}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      </Container>
    </>
  )
}

interface EventRowProps {
  event: LiveAuthEvent
  meta: { label: string; color: string; icon: React.ElementType }
  isSelected: boolean
  onSelect: (id: string) => void
  /** Shown in place of the actor for rows the server could not attribute. */
  unattributedLabel: string
}

/**
 * Memoised so a new arrival re-renders one row, not the whole feed — the list
 * holds up to 300 rows and receives events continuously.
 */
const EventRow = React.memo<EventRowProps>(
  ({ event, meta, isSelected, onSelect, unattributedLabel }) => {
    const EventIcon = meta.icon
    return (
      <Box
        role='button'
        tabIndex={0}
        aria-pressed={isSelected}
        onClick={() => onSelect(event.id)}
        onKeyDown={(keyEvent) => {
          if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
            keyEvent.preventDefault()
            onSelect(event.id)
          }
        }}
        sx={{
          display: 'grid',
          gridTemplateColumns: GRID_TEMPLATE,
          gap: 2,
          px: 3,
          py: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: isSelected ? (t) => alpha(t.palette.primary.main, 0.08) : 'transparent',
          borderInlineStart: isSelected ? 4 : 0,
          borderInlineStartColor: 'primary.main',
          borderInlineStartStyle: 'solid',
          cursor: 'pointer',
          transition: 'background-color 0.15s ease',
          '&:hover': {
            bgcolor: (t) =>
              isSelected ? alpha(t.palette.primary.main, 0.12) : t.palette.action.hover,
          },
          '&:focus-visible': {
            outline: (t) => `2px solid ${t.palette.primary.main}`,
            outlineOffset: -2,
          },
        }}
      >
        <Typography variant='body2' fontFamily='monospace' color='text.secondary' noWrap>
          {formatEventTime(event.timestamp)}
        </Typography>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant='body2'
            fontWeight={600}
            color={event.actor ? 'text.primary' : 'text.secondary'}
            noWrap
          >
            {event.actor || unattributedLabel}
          </Typography>
          <Typography variant='caption' color='text.secondary' noWrap component='div'>
            {[humaniseAction(event.action), event.city, event.country].filter(Boolean).join(' • ')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip
            icon={<EventIcon sx={{ fontSize: 14 }} />}
            label={meta.label}
            size='small'
            sx={{
              bgcolor: alpha(meta.color, 0.1),
              color: meta.color,
              border: 1,
              borderColor: alpha(meta.color, 0.2),
              fontWeight: 600,
            }}
          />
        </Box>
        <Typography variant='body2' fontFamily='monospace' color='text.primary' noWrap>
          {event.ip ?? '—'}
        </Typography>
        <Typography variant='caption' color='text.secondary' fontWeight={600} noWrap>
          {event.severity}
        </Typography>
      </Box>
    )
  },
)
EventRow.displayName = 'EventRow'

const DetailTile: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1.5 }}>
    <Typography variant='caption' color='text.secondary'>
      {label}
    </Typography>
    <Typography variant='body2' fontWeight={600} color='text.primary' noWrap>
      {value}
    </Typography>
  </Box>
)

const DetailRow: React.FC<{
  label: string
  value: string | null
  monospace?: boolean
  onCopy?: () => void
}> = ({ label, value, monospace, onCopy }) => {
  const { t } = useTranslation('common')
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        py: 1,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Typography variant='caption' color='text.secondary' sx={{ flexShrink: 0 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
        <Typography
          variant='caption'
          fontWeight={600}
          fontFamily={monospace ? 'monospace' : undefined}
          color={value ? 'text.primary' : 'text.disabled'}
          noWrap
          title={value ?? undefined}
        >
          {value || t('monitoring.events.detail.notAvailable', 'Not reported')}
        </Typography>
        {onCopy && (
          <IconButton size='small' onClick={onCopy} aria-label={label}>
            <ContentCopy sx={{ fontSize: 12 }} />
          </IconButton>
        )}
      </Box>
    </Box>
  )
}

export default RealTimeAuthEventsMonitor
