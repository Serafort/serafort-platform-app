import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
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
} from '@mui/material'
import Search from '@mui/icons-material/Search'
import Download from '@mui/icons-material/Download'
import Pause from '@mui/icons-material/Pause'
import PlayArrow from '@mui/icons-material/PlayArrow'
import History from '@mui/icons-material/History'
import CheckCircle from '@mui/icons-material/CheckCircle'
import Key from '@mui/icons-material/Key'
import GppBad from '@mui/icons-material/GppBad'
import LockPerson from '@mui/icons-material/LockPerson'
import Logout from '@mui/icons-material/Logout'
import Sync from '@mui/icons-material/Sync'
import ContentCopy from '@mui/icons-material/ContentCopy'
import LocationOn from '@mui/icons-material/LocationOn'
import Group from '@mui/icons-material/Group'
import Speed from '@mui/icons-material/Speed'
import Timer from '@mui/icons-material/Timer'
import { themeConfig, useNotifications } from '@cap/platform-core'
import { alpha, useTheme } from '@mui/material/styles'
import { useSSESubscription } from '../../../authentication-core/hooks/useSSE'

export interface AuthEvent {
  id: string
  time: string
  email: string
  userName: string
  initials: string
  role: string
  orgId: string
  device: string
  type: 'success' | 'refresh' | 'failed' | 'mfa' | 'logout'
  ip: string
  city: string
  latency: string
  rawPayload?: string
}

const INITIAL_EVENTS: AuthEvent[] = [
  {
    id: 'evt_90214a1',
    time: '14:02:05.233',
    email: 'sarah.j@company.com',
    userName: 'Sarah Jenkins',
    initials: 'SJ',
    role: 'Developer',
    orgId: 'org_4421',
    device: 'Mac OS / Chrome 124',
    type: 'success',
    ip: '192.168.1.42',
    city: 'San Francisco, US',
    latency: '45ms',
  },
  {
    id: 'evt_90214a2',
    time: '14:02:04.812',
    email: 'admin@authstream.io',
    userName: 'Alexander Vance',
    initials: 'AV',
    role: 'Security Admin',
    orgId: 'org_enterprise',
    device: 'Linux / CLI Tool v2.4',
    type: 'refresh',
    ip: '10.0.0.58',
    city: 'Frankfurt, DE',
    latency: '12ms',
  },
  {
    id: 'evt_90214a3',
    time: '14:01:59.105',
    email: 'unknown_user_99@shadow.net',
    userName: 'Anonymous Actor',
    initials: 'AA',
    role: 'Guest / Anonymous',
    orgId: 'org_unregistered',
    device: 'Unknown / Tor Browser',
    type: 'failed',
    ip: '203.0.113.1',
    city: 'Reykjavik, IS',
    latency: '120ms',
  },
  {
    id: 'evt_90214a4',
    time: '14:01:45.332',
    email: 'mike.ross@firm.com',
    userName: 'Michael Ross',
    initials: 'MR',
    role: 'Legal Partner',
    orgId: 'org_legal_77',
    device: 'Windows 11 / Edge 122',
    type: 'mfa',
    ip: '172.16.254.1',
    city: 'New York, US',
    latency: '85ms',
  },
  {
    id: 'evt_90214a5',
    time: '14:01:30.005',
    email: 'jessica.p@corp.net',
    userName: 'Jessica Pearson',
    initials: 'JP',
    role: 'Managing Director',
    orgId: 'org_legal_77',
    device: 'iOS 17.4 / Mobile Safari',
    type: 'logout',
    ip: '192.168.1.102',
    city: 'Chicago, US',
    latency: '32ms',
  },
]

export const RealTimeAuthEventsMonitor: React.FC = () => {
  const theme = useTheme()
  const { t } = useTranslation('common')
  const { addNotification } = useNotifications()

  const [events, setEvents] = useState<AuthEvent[]>(INITIAL_EVENTS)
  const [isPaused, setIsPaused] = useState(false)
  const bufferRef = useRef<AuthEvent[]>([])
  const [bufferedCount, setBufferedCount] = useState(0)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'success' | 'failed' | 'mfa' | 'refresh' | 'logout'
  >('all')
  const [selectedEventId, setSelectedEventId] = useState<string>(INITIAL_EVENTS[0].id)
  const [isLiveConnected, setIsLiveConnected] = useState(true)

  // Real-time SSE Connection
  useSSESubscription<AuthEvent>('/api/admin/events/stream', {
    enabled: !isPaused,
    onMessage: (newEvent) => {
      if (newEvent && newEvent.id) {
        handleIncomingEvent(newEvent)
      }
    },
    onOpen: () => setIsLiveConnected(true),
    onError: () => setIsLiveConnected(false),
  })

  // Simulated live event producer for offline/demo robustness
  useEffect(() => {
    const interval = setInterval(() => {
      const mockTypes: AuthEvent['type'][] = ['success', 'refresh', 'failed', 'mfa', 'logout']
      const mockType = mockTypes[Math.floor(Math.random() * mockTypes.length)]
      const now = new Date()
      const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`
      const randomId = `evt_${Math.random().toString(36).substring(2, 9)}`

      const mockEvent: AuthEvent = {
        id: randomId,
        time: timeStr,
        email:
          mockType === 'failed'
            ? `bad_actor_${Math.floor(Math.random() * 1000)}@botnet.org`
            : `user_${Math.floor(Math.random() * 50)}@enterprise.com`,
        userName:
          mockType === 'failed'
            ? 'Unauthorized Client'
            : `Enterprise User #${Math.floor(Math.random() * 50)}`,
        initials: mockType === 'failed' ? 'UC' : 'EU',
        role: mockType === 'failed' ? 'Untrusted' : 'Staff Member',
        orgId: `org_${Math.floor(Math.random() * 100)}`,
        device: ['Mac OS / Chrome 124', 'Windows 11 / Chrome', 'iOS / Safari', 'Linux / Firefox'][
          Math.floor(Math.random() * 4)
        ],
        type: mockType,
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        city: ['San Francisco, US', 'London, UK', 'Tokyo, JP', 'Berlin, DE', 'Toronto, CA'][
          Math.floor(Math.random() * 5)
        ],
        latency: `${Math.floor(Math.random() * 90) + 15}ms`,
      }

      handleIncomingEvent(mockEvent)
    }, 4500)

    return () => clearInterval(interval)
  }, [isPaused])

  const handleIncomingEvent = (newEvent: AuthEvent) => {
    if (isPaused) {
      bufferRef.current.push(newEvent)
      setBufferedCount(bufferRef.current.length)
    } else {
      setEvents((prev) => [newEvent, ...prev.slice(0, 99)])
    }
  }

  const togglePause = () => {
    if (isPaused) {
      // Resume and flush buffer
      if (bufferRef.current.length > 0) {
        setEvents((prev) => [...bufferRef.current.reverse(), ...prev].slice(0, 100))
        bufferRef.current = []
        setBufferedCount(0)
      }
      setIsPaused(false)
      addNotification({
        type: 'info',
        title: 'Stream Resumed',
        message: 'Live authentication telemetry is streaming in real-time.',
      })
    } else {
      setIsPaused(true)
      addNotification({
        type: 'warning',
        title: 'Stream Paused',
        message: 'Incoming events will be buffered until you resume.',
      })
    }
  }

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesFilter = selectedFilter === 'all' || ev.type === selectedFilter
      const query = searchQuery.trim().toLowerCase()
      const matchesQuery =
        !query ||
        ev.id.toLowerCase().includes(query) ||
        ev.email.toLowerCase().includes(query) ||
        ev.ip.toLowerCase().includes(query) ||
        ev.device.toLowerCase().includes(query) ||
        ev.userName.toLowerCase().includes(query)
      return matchesFilter && matchesQuery
    })
  }, [events, selectedFilter, searchQuery])

  // Currently Selected Event Detail
  const selectedEvent = useMemo(() => {
    const found = events.find((e) => e.id === selectedEventId)
    return found || filteredEvents[0] || events[0]
  }, [events, selectedEventId, filteredEvents])

  const formattedPayload = useMemo(() => {
    if (!selectedEvent) return '{}'
    if (selectedEvent.rawPayload) return selectedEvent.rawPayload

    return JSON.stringify(
      {
        event_id: selectedEvent.id,
        event_type: `auth.${selectedEvent.type}`,
        timestamp: new Date().toISOString(),
        actor: {
          name: selectedEvent.userName,
          email: selectedEvent.email,
          role: selectedEvent.role,
          organization_id: selectedEvent.orgId,
        },
        client: {
          ip_address: selectedEvent.ip,
          location: selectedEvent.city,
          user_agent: selectedEvent.device,
          latency: selectedEvent.latency,
        },
        security_context: {
          mfa_verified: selectedEvent.type === 'mfa' || selectedEvent.type === 'success',
          status: selectedEvent.type === 'failed' ? 'denied' : 'granted',
        },
      },
      null,
      2,
    )
  }, [selectedEvent])

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    addNotification({
      type: 'success',
      title: 'Copied to Clipboard',
      message: `${label} copied successfully.`,
    })
  }

  const handleExportCSV = () => {
    if (filteredEvents.length === 0) {
      addNotification({
        type: 'warning',
        title: 'Export Empty',
        message: 'No events to export with current filters.',
      })
      return
    }

    const headers = [
      'Event ID',
      'Timestamp',
      'User Name',
      'Email',
      'Role',
      'Org ID',
      'Type',
      'IP Address',
      'City',
      'Device',
      'Latency',
    ]
    const rows = filteredEvents.map((e) => [
      e.id,
      e.time,
      `"${e.userName.replace(/"/g, '""')}"`,
      e.email,
      e.role,
      e.orgId,
      e.type,
      e.ip,
      `"${e.city.replace(/"/g, '""')}"`,
      `"${e.device.replace(/"/g, '""')}"`,
      e.latency,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `auth_stream_events_${new Date().toISOString().split('T')[0]}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    addNotification({
      type: 'success',
      title: 'Export Completed',
      message: `Exported ${filteredEvents.length} events as CSV.`,
    })
  }

  // Dynamic Live Stats
  const totalEvents = events.length
  const failedEvents = events.filter((e) => e.type === 'failed').length
  const avgLatencyVal = Math.round(
    events.reduce((acc, curr) => acc + parseInt(curr.latency, 10), 0) / (totalEvents || 1),
  )

  const stats = [
    {
      label: 'Active Monitored Stream',
      value: `${totalEvents} events`,
      change: isPaused ? 'Paused' : '+Live',
      icon: Group,
      color: theme.palette.primary.main,
      negative: isPaused,
    },
    {
      label: 'Throughput',
      value: isPaused ? '0 evt/s' : '42 evt/s',
      change: '+8%',
      icon: Speed,
      color: theme.palette.primary.main,
    },
    {
      label: 'Failed Attempts (Stream)',
      value: String(failedEvents),
      change: failedEvents > 0 ? `${failedEvents} alerts` : '0 alerts',
      icon: GppBad,
      color: failedEvents > 0 ? theme.palette.error.main : theme.palette.success.main,
      negative: failedEvents > 0,
    },
    {
      label: 'Avg Response Latency',
      value: `${avgLatencyVal}ms`,
      change: '~nominal',
      icon: Timer,
      color: theme.palette.primary.main,
    },
  ]

  const getEventTypeLabel = (type: AuthEvent['type']) => {
    switch (type) {
      case 'success':
        return { label: 'Success', color: theme.palette.success.main, icon: CheckCircle }
      case 'refresh':
        return { label: 'Refresh', color: theme.palette.primary.main, icon: Key }
      case 'failed':
        return { label: 'Failed', color: theme.palette.error.main, icon: GppBad }
      case 'mfa':
        return { label: 'MFA', color: theme.palette.warning.main, icon: LockPerson }
      case 'logout':
        return { label: 'Logout', color: theme.palette.info.main, icon: Logout }
      default:
        return { label: 'Event', color: theme.palette.text.secondary, icon: Sync }
    }
  }

  return (
    <>
      <title>AuthStream - Real-time Monitor - {themeConfig.templateName}</title>

      <Container
        maxWidth={false}
        sx={{
          maxWidth: 1600,
          px: { xs: 2, lg: 5 },
          py: 3,
        }}
      >
        {/* Page Header & Actions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant='h3' fontWeight={900} gutterBottom sx={{ color: 'text.primary' }}>
                Real-time Auth Events Monitor
              </Typography>
              <Typography color='text.secondary'>
                Live stream of authentication activities, security verification, and token lifecycle
                events.
              </Typography>
            </Box>
            <Button
              startIcon={<Download />}
              variant='outlined'
              onClick={handleExportCSV}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
            >
              Export CSV ({filteredEvents.length})
            </Button>
          </Box>

          {/* Stats Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 2,
            }}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Paper
                  key={index}
                  sx={(theme: any) => ({
                    p: 3,
                    borderRadius: 2,
                    border: '1px solid ' + theme.palette.divider,
                    ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
                  })}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                    }}
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
                        bgcolor: (theme) =>
                          stat.negative
                            ? alpha(theme.palette.error.main, 0.1)
                            : alpha(theme.palette.success.main, 0.1),
                        color: stat.negative ? 'error.main' : 'success.main',
                        fontWeight: 700,
                        fontSize: 10,
                      }}
                    />
                  </Box>
                </Paper>
              )
            })}
          </Box>
        </Box>

        {/* Controls Toolbar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            mb: 3,
            p: 1.5,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              startIcon={isPaused ? <PlayArrow /> : <Pause />}
              variant='contained'
              onClick={togglePause}
              color={isPaused ? 'warning' : 'primary'}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              {isPaused ? `Resume (${bufferedCount} buffered)` : 'Pause Stream'}
            </Button>
          </Box>

          {/* Search */}
          <TextField
            fullWidth
            size='small'
            placeholder='Search by User ID, Email, IP Address, or Device...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                borderRadius: 2,
              },
            }}
          />

          {/* Filter Chips */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label='All Events'
              onClick={() => setSelectedFilter('all')}
              color={selectedFilter === 'all' ? 'primary' : 'default'}
              variant={selectedFilter === 'all' ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600 }}
            />
            <Chip
              icon={
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                  }}
                />
              }
              label='Success'
              onClick={() => setSelectedFilter('success')}
              color={selectedFilter === 'success' ? 'success' : 'default'}
              variant={selectedFilter === 'success' ? 'filled' : 'outlined'}
              sx={{ fontWeight: 500 }}
            />
            <Chip
              icon={
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'error.main',
                  }}
                />
              }
              label='Failed'
              onClick={() => setSelectedFilter('failed')}
              color={selectedFilter === 'failed' ? 'error' : 'default'}
              variant={selectedFilter === 'failed' ? 'filled' : 'outlined'}
              sx={{ fontWeight: 500 }}
            />
            <Chip
              icon={
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'warning.main',
                  }}
                />
              }
              label='MFA'
              onClick={() => setSelectedFilter('mfa')}
              color={selectedFilter === 'mfa' ? 'warning' : 'default'}
              variant={selectedFilter === 'mfa' ? 'filled' : 'outlined'}
              sx={{ fontWeight: 500 }}
            />
            <Chip
              icon={
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'info.main',
                  }}
                />
              }
              label='Refresh'
              onClick={() => setSelectedFilter('refresh')}
              color={selectedFilter === 'refresh' ? 'info' : 'default'}
              variant={selectedFilter === 'refresh' ? 'filled' : 'outlined'}
              sx={{ fontWeight: 500 }}
            />
          </Box>
        </Box>

        {/* Main Content Split View */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 3,
            minHeight: 560,
          }}
        >
          {/* Feed List (Left) */}
          <Paper
            sx={(theme: any) => ({
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid ' + theme.palette.divider,
              ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
            })}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '110px 1fr 120px 140px 90px',
                gap: 2,
                px: 3,
                py: 1.5,
                bgcolor: 'action.hover',
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant='caption' fontWeight={700} color='text.secondary'>
                TIME
              </Typography>
              <Typography variant='caption' fontWeight={700} color='text.secondary'>
                USER / EVENT
              </Typography>
              <Typography variant='caption' fontWeight={700} color='text.secondary'>
                TYPE
              </Typography>
              <Typography variant='caption' fontWeight={700} color='text.secondary'>
                IP SOURCE
              </Typography>
              <Typography variant='caption' fontWeight={700} color='text.secondary' align='right'>
                LATENCY
              </Typography>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 580 }}>
              {filteredEvents.length === 0 ? (
                <Box sx={{ p: 6, textAlign: 'center' }}>
                  <Typography variant='body1' fontWeight={600} color='text.secondary'>
                    No authentication events matching your filter.
                  </Typography>
                </Box>
              ) : (
                filteredEvents.map((event) => {
                  const eventType = getEventTypeLabel(event.type)
                  const EventIcon = eventType.icon
                  const isSelected = (selectedEvent?.id || '') === event.id

                  return (
                    <Box
                      key={event.id}
                      onClick={() => setSelectedEventId(event.id)}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '110px 1fr 120px 140px 90px',
                        gap: 2,
                        px: 3,
                        py: 2,
                        borderBottom: 1,
                        borderColor: 'divider',
                        bgcolor: isSelected
                          ? alpha(theme.palette.primary.main, 0.08)
                          : 'transparent',
                        borderLeft: isSelected ? 4 : 0,
                        borderLeftColor: 'primary.main',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                        '&:hover': {
                          bgcolor: isSelected
                            ? alpha(theme.palette.primary.main, 0.12)
                            : 'action.hover',
                        },
                      }}
                    >
                      <Typography variant='body2' fontFamily='monospace' color='text.secondary'>
                        {event.time}
                      </Typography>
                      <Box>
                        <Typography variant='body2' fontWeight={600} color='text.primary'>
                          {event.userName}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {event.email} • {event.device}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip
                          icon={<EventIcon sx={{ fontSize: 14 }} />}
                          label={eventType.label}
                          size='small'
                          sx={{
                            bgcolor: alpha(eventType.color as string, 0.1),
                            color: eventType.color,
                            border: 1,
                            borderColor: alpha(eventType.color as string, 0.2),
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      <Typography variant='body2' fontFamily='monospace' color='text.primary'>
                        {event.ip}
                      </Typography>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        fontWeight={600}
                        align='right'
                      >
                        {event.latency}
                      </Typography>
                    </Box>
                  )
                })
              )}
            </Box>

            {/* Connection Footer */}
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
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Sync
                  sx={{
                    color: isPaused ? 'warning.main' : 'primary.main',
                    fontSize: 16,
                    animation: isPaused ? 'none' : 'spin 2s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
                <Typography variant='caption' fontWeight={500} color='text.secondary'>
                  {isPaused
                    ? `Stream Paused (${bufferedCount} events queued)`
                    : isLiveConnected
                      ? 'Live Telemetry Active (Streaming)'
                      : 'Telemetry Connecting...'}
                </Typography>
              </Box>
              <Typography variant='caption' color='text.secondary'>
                Showing {filteredEvents.length} of {events.length} events
              </Typography>
            </Box>
          </Paper>

          {/* Detail View (Right Panel) */}
          {selectedEvent && (
            <Paper
              sx={(theme: any) => ({
                width: { xs: '100%', lg: 440 },
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid ' + theme.palette.divider,
                ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
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
                }}
              >
                <Box>
                  <Typography variant='caption' fontWeight={700} color='text.secondary'>
                    SELECTED EVENT ID
                  </Typography>
                  <Typography
                    variant='body2'
                    fontFamily='monospace'
                    fontWeight={600}
                    sx={{ mt: 0.5, color: 'text.primary' }}
                  >
                    {selectedEvent.id}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title='Copy Raw JSON Payload'>
                    <IconButton
                      size='small'
                      onClick={() => handleCopy(formattedPayload, 'Raw JSON Payload')}
                      sx={{ color: 'text.secondary' }}
                    >
                      <ContentCopy fontSize='small' />
                    </IconButton>
                  </Tooltip>
                </Box>
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
                {/* User Context */}
                <Box>
                  <Typography
                    variant='caption'
                    fontWeight={700}
                    color='text.secondary'
                    mb={1.5}
                    component='div'
                  >
                    USER CONTEXT
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        fontWeight: 700,
                      }}
                    >
                      {selectedEvent.initials}
                    </Avatar>
                    <Box>
                      <Typography variant='body2' fontWeight={600} color='text.primary'>
                        {selectedEvent.userName}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {selectedEvent.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                    <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1.5 }}>
                      <Typography variant='caption' color='text.secondary'>
                        Role
                      </Typography>
                      <Typography variant='body2' fontWeight={600} color='text.primary'>
                        {selectedEvent.role}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1.5 }}>
                      <Typography variant='caption' color='text.secondary'>
                        Organization
                      </Typography>
                      <Typography variant='body2' fontWeight={600} color='text.primary'>
                        {selectedEvent.orgId}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Location & Network Data */}
                <Box>
                  <Typography
                    variant='caption'
                    fontWeight={700}
                    color='text.secondary'
                    mb={1.5}
                    component='div'
                  >
                    LOCATION & DEVICE
                  </Typography>
                  <Box
                    sx={{
                      height: 100,
                      borderRadius: 1.5,
                      background: (theme) =>
                        `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.secondary.main, 0.12)} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1.5,
                    }}
                  >
                    <LocationOn
                      sx={{
                        fontSize: 42,
                        color: 'primary.main',
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      py: 1,
                      borderBottom: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant='caption' color='text.secondary'>
                      City / Region
                    </Typography>
                    <Typography variant='caption' fontWeight={600} color='text.primary'>
                      {selectedEvent.city}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      py: 1,
                      borderBottom: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant='caption' color='text.secondary'>
                      IP Address
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography
                        variant='caption'
                        fontWeight={600}
                        fontFamily='monospace'
                        color='text.primary'
                      >
                        {selectedEvent.ip}
                      </Typography>
                      <IconButton
                        size='small'
                        onClick={() => handleCopy(selectedEvent.ip, 'IP Address')}
                      >
                        <ContentCopy sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      py: 1,
                      borderBottom: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant='caption' color='text.secondary'>
                      Client Device
                    </Typography>
                    <Typography variant='caption' fontWeight={500} color='text.primary'>
                      {selectedEvent.device}
                    </Typography>
                  </Box>
                </Box>

                {/* Raw JSON Payload */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography variant='caption' fontWeight={700} color='text.secondary'>
                      STRUCTURED EVENT PAYLOAD
                    </Typography>
                    <Button
                      size='small'
                      variant='text'
                      onClick={() => handleCopy(formattedPayload, 'Payload JSON')}
                      sx={{ fontSize: 11, textTransform: 'none', py: 0 }}
                    >
                      Copy JSON
                    </Button>
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : '#101922',
                      borderRadius: 1.5,
                      p: 1.5,
                      overflowX: 'auto',
                      border: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Typography
                      component='pre'
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: 11,
                        lineHeight: 1.6,
                        color: theme.palette.mode === 'dark' ? 'success.light' : '#4af626',
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

export default RealTimeAuthEventsMonitor
