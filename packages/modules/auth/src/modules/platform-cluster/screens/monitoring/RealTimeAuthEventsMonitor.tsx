import { useState, useEffect } from 'react'
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
  Badge,
} from '@mui/material'
import Search from '@mui/icons-material/Search';
import Download from '@mui/icons-material/Download';
import Pause from '@mui/icons-material/Pause';
import PlayArrow from '@mui/icons-material/PlayArrow';
import History from '@mui/icons-material/History';
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import Settings from '@mui/icons-material/Settings';
import AdminPanelSettings from '@mui/icons-material/AdminPanelSettings';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Key from '@mui/icons-material/Key';
import GppBad from '@mui/icons-material/GppBad';
import LockPerson from '@mui/icons-material/LockPerson';
import Logout from '@mui/icons-material/Logout';
import Sync from '@mui/icons-material/Sync';
import ContentCopy from '@mui/icons-material/ContentCopy';
import OpenInNew from '@mui/icons-material/OpenInNew';
import LocationOn from '@mui/icons-material/LocationOn';
import Group from '@mui/icons-material/Group';
import Speed from '@mui/icons-material/Speed';
import Timer from '@mui/icons-material/Timer';
import { themeConfig } from '@cap/platform-core'
import { alpha, useTheme } from '@mui/material/styles'

interface AuthEvent {
  id: string
  time: string
  email: string
  device: string
  type: 'success' | 'refresh' | 'failed' | 'mfa' | 'logout'
  ip: string
  latency: string
}

interface EventDetail {
  eventId: string
  user: {
    name: string
    email: string
    initials: string
    role: string
    orgId: string
  }
  location: {
    city: string
    ip: string
  }
  payload: string
}

const RealTimeAuthEventsMonitor = () => {
  const theme = useTheme()
  const [isPaused, setIsPaused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)

  // Simulate SSE connection status (hooks useScrapingProgress/useAnalysisProgress are not yet implemented)
  const [isScrapingConnected, setIsScrapingConnected] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setIsScrapingConnected(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const stats = [
    {
      label: 'Active Sessions',
      value: '14,203',
      change: '+5%',
      icon: Group,
      color: theme.palette.primary.main,
    },
    {
      label: 'Events / Sec',
      value: '85',
      change: '+12%',
      icon: Speed,
      color: theme.palette.primary.main,
    },
    {
      label: 'Failed Logins (24h)',
      value: '23',
      change: '-2%',
      icon: GppBad,
      color: theme.palette.error.main,
      negative: true,
    },
    {
      label: 'Avg Latency',
      value: '120ms',
      change: '~0%',
      icon: Timer,
      color: theme.palette.primary.main,
    },
  ]

  const events: Array<AuthEvent> = [
    {
      id: '1',
      time: '14:02:05.233',
      email: 'sarah.j@company.com',
      device: 'Mac OS / Chrome',
      type: 'success',
      ip: '192.168.1.42',
      latency: '45ms',
    },
    {
      id: '2',
      time: '14:02:04.812',
      email: 'admin@authstream.io',
      device: 'Linux / CLI',
      type: 'refresh',
      ip: '10.0.0.58',
      latency: '12ms',
    },
    {
      id: '3',
      time: '14:01:59.105',
      email: 'unknown_user_99',
      device: 'Unknown',
      type: 'failed',
      ip: '203.0.113.1',
      latency: '120ms',
    },
    {
      id: '4',
      time: '14:01:45.332',
      email: 'mike.ross@firm.com',
      device: 'Windows / Edge',
      type: 'mfa',
      ip: '172.16.254.1',
      latency: '85ms',
    },
    {
      id: '5',
      time: '14:01:30.005',
      email: 'jessica.p@corp.net',
      device: 'iPhone / Safari',
      type: 'logout',
      ip: '192.168.1.102',
      latency: '32ms',
    },
  ]

  const eventDetail: EventDetail = {
    eventId: 'evt_83920a9d',
    user: {
      name: 'Sarah Jenkins',
      email: 'sarah.j@company.com',
      initials: 'SJ',
      role: 'Developer',
      orgId: 'org_4421',
    },
    location: {
      city: 'San Francisco, US',
      ip: '192.168.1.42',
    },
    payload: `{
  "event_type": "login.success",
  "timestamp": "2023-10-27T14:02:05.233Z",
  "actor": {
    "id": "usr_99210",
    "email": "sarah.j@company.com"
  },
  "client": {
    "ip": "192.168.1.42",
    "user_agent": "Mozilla/5.0..."
  },
  "auth_method": "password",
  "mfa": false
}`,
  }

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
        return { label: 'Logout', color: theme.palette.success.main, icon: Logout }
    }
  }

  return (
    <>
      <title>AuthStream - Real-time Monitor - {themeConfig.templateName}</title>

      {/* Top Navigation */}
      <Box
        className='animate-scale-in'
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          px: { xs: 2, md: 5 },
          py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: (theme) => `0 1px 2px 0 ${alpha(theme.palette.common.black, 0.05)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AdminPanelSettings sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant='h6' fontWeight={700} sx={{ color: 'text.primary' }}>
            AuthStream
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.success.main, 0.1),
              border: 1,
              borderColor: alpha(theme.palette.success.main, 0.2),
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'success.main',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                },
              }}
            />
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'success.main' }}>
              LIVE
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* ── SYSTEM PATTERN: cta_button (info.main variant) ── */}
          <Button
            variant='contained'
            sx={{
              bgcolor: 'info.main',
              color: 'info.contrastText',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.2)',
              '&:hover': { bgcolor: 'info.dark' },
            }}
          >
            Profile
          </Button>
          <IconButton sx={{ bgcolor: 'action.hover' }}>
            <Badge badgeContent={3} color='error'>
              <NotificationsOutlined />
            </Badge>
          </IconButton>
          <IconButton sx={{ bgcolor: 'action.hover' }}>
            <Settings />
          </IconButton>
        </Box>
      </Box>

      <Container
        maxWidth={false}
        sx={{
          maxWidth: 1600,
          px: { xs: 2, lg: 5 },
          py: 3,
        }}
      >
        {/* Page Header & Stats */}
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
                Live stream of authentication activities across the platform.
              </Typography>
            </Box>
            <Button
              startIcon={<Download />}
              variant='outlined'
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Export CSV
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
            p: 1,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* ── SYSTEM PATTERN: cta_button ── */}
            <Button
              startIcon={isPaused ? <PlayArrow /> : <Pause />}
              variant='contained'
              onClick={() => setIsPaused(!isPaused)}
              sx={{
                bgcolor: 'info.main',
                color: 'info.contrastText',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.2)',
                '&:hover': { bgcolor: 'info.dark' },
              }}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              startIcon={<History />}
              variant='outlined'
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Last 1h
            </Button>
          </Box>

          {/* Search */}
          {/* ── SYSTEM PATTERN: text_field (InputProps -> slotProps.input) ── */}
          <TextField
            fullWidth
            size='small'
            placeholder='Search by User ID, IP Address, or Request ID...'
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
              minWidth: 240,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'divider' },
                '&:hover fieldset': { borderColor: 'primary.main' },
              },
            }}
          />

          {/* Filter Chips */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label='All Events'
              onClick={() => setSelectedFilter('all')}
              sx={{
                bgcolor:
                  selectedFilter === 'all'
                    ? theme.palette.mode === 'dark'
                      ? 'grey.800'
                      : 'grey.900'
                    : 'background.paper',
                color: selectedFilter === 'all' ? 'common.white' : 'text.primary',
                fontWeight: 600,
                border: selectedFilter === 'all' ? 'none' : 1,
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: selectedFilter === 'all' ? 'grey.800' : 'action.hover',
                },
              }}
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
              label='Login Success'
              onClick={() => setSelectedFilter('success')}
              variant='outlined'
              sx={{ fontWeight: 500, borderColor: 'divider' }}
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
              label='Login Failed'
              onClick={() => setSelectedFilter('failed')}
              variant='outlined'
              sx={{ fontWeight: 500, borderColor: 'divider' }}
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
              label='MFA Challenge'
              onClick={() => setSelectedFilter('mfa')}
              variant='outlined'
              sx={{ fontWeight: 500, borderColor: 'divider' }}
            />
          </Box>
        </Box>

        {/* Main Content Split View */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 3,
            minHeight: 500,
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
                gridTemplateColumns: '100px 1fr 120px 140px 100px',
                gap: 2,
                px: 3,
                py: 1.5,
                bgcolor: 'action.hover',
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant='caption' fontWeight={600} color='text.secondary'>
                TIME
              </Typography>
              <Typography variant='caption' fontWeight={600} color='text.secondary'>
                USER / EVENT
              </Typography>
              <Typography variant='caption' fontWeight={600} color='text.secondary'>
                TYPE
              </Typography>
              <Typography variant='caption' fontWeight={600} color='text.secondary'>
                IP SOURCE
              </Typography>
              <Typography variant='caption' fontWeight={600} color='text.secondary' align='right'>
                LATENCY
              </Typography>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              {events.map((event) => {
                const eventType = getEventTypeLabel(event.type)
                const EventIcon = eventType.icon
                const isSelected = selectedEvent === event.id

                return (
                  <Box
                    key={event.id}
                    onClick={() => setSelectedEvent(event.id)}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '100px 1fr 120px 140px 100px',
                      gap: 2,
                      px: 3,
                      py: 2,
                      borderBottom: 1,
                      borderColor: 'divider',
                      bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                      borderLeft: isSelected ? 4 : 0,
                      borderLeftColor: 'primary.main',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      position: 'relative',
                    }}
                  >
                    <Typography variant='body2' fontFamily='monospace' color='text.secondary'>
                      {event.time}
                    </Typography>
                    <Box>
                      <Typography variant='body2' fontWeight={600} color='text.primary'>
                        {event.email}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Device: {event.device}
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
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                    <Typography variant='body2' fontFamily='monospace' color='text.primary'>
                      {event.ip}
                    </Typography>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      fontWeight={500}
                      align='right'
                    >
                      {event.latency}
                    </Typography>
                  </Box>
                )
              })}
            </Box>

            {/* Loading indicator */}
            <Box
              sx={{
                p: 1.5,
                bgcolor: 'action.hover',
                borderTop: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <Sync
                sx={{
                  color: 'primary.main',
                  fontSize: 16,
                  animation: 'spin 2s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              />
              <Typography variant='caption' color='text.secondary'>
                {isScrapingConnected
                  ? 'Connected to Monitoring Stream'
                  : 'Connecting to Monitoring Stream...'}
              </Typography>
            </Box>
          </Paper>

          {/* Detail View (Right Panel) */}
          <Paper
            sx={(theme: any) => ({
              width: { xs: '100%', lg: 400 },
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
                <Typography variant='caption' fontWeight={600} color='text.secondary'>
                  SELECTED EVENT
                </Typography>
                <Typography
                  variant='body2'
                  fontFamily='monospace'
                  fontWeight={500}
                  sx={{ mt: 0.5, color: 'text.primary' }}
                >
                  {eventDetail.eventId}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size='small' sx={{ color: 'text.secondary' }}>
                  <ContentCopy fontSize='small' />
                </IconButton>
                <IconButton size='small' sx={{ color: 'text.secondary' }}>
                  <OpenInNew fontSize='small' />
                </IconButton>
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
              }}
            >
              {/* User Context */}
              <Box>
                <Typography variant='caption' fontWeight={600} color='text.secondary' mb={1.5}>
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
                    {eventDetail.user.initials}
                  </Avatar>
                  <Box>
                    <Typography variant='body2' fontWeight={600} color='text.primary'>
                      {eventDetail.user.name}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {eventDetail.user.email}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant='caption' color='text.secondary'>
                      Role
                    </Typography>
                    <Typography variant='body2' fontWeight={500} color='text.primary'>
                      {eventDetail.user.role}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant='caption' color='text.secondary'>
                      Org ID
                    </Typography>
                    <Typography variant='body2' fontWeight={500} color='text.primary'>
                      {eventDetail.user.orgId}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Location Data */}
              <Box>
                <Typography variant='caption' fontWeight={600} color='text.secondary' mb={1.5}>
                  LOCATION DATA
                </Typography>
                <Box
                  sx={{
                    height: 128,
                    borderRadius: 1,
                    background: (theme) =>
                      `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.5,
                    position: 'relative',
                  }}
                >
                  <LocationOn
                    sx={{
                      fontSize: 48,
                      color: 'primary.main',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
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
                    City
                  </Typography>
                  <Typography variant='caption' fontWeight={500} color='text.primary'>
                    {eventDetail.location.city}
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
                  <Typography variant='caption' fontWeight={500} color='text.primary'>
                    {eventDetail.location.ip}
                  </Typography>
                </Box>
              </Box>

              {/* Raw Payload */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 200 }}>
                <Typography variant='caption' fontWeight={600} color='text.secondary' mb={1.5}>
                  RAW PAYLOAD
                </Typography>
                <Box
                  sx={{
                    flex: 1,
                    bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : '#101922',
                    borderRadius: 1,
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
                      fontSize: 10,
                      lineHeight: 1.6,
                      color: 'success.main',
                      margin: 0,
                      whiteSpace: 'pre',
                    }}
                  >
                    {eventDetail.payload}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  )
}

export default RealTimeAuthEventsMonitor
