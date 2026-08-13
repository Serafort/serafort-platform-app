import { useState } from 'react'
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
import Search from '@mui/icons-material/Search';
import Download from '@mui/icons-material/Download';
import Pause from '@mui/icons-material/Pause';
import Settings from '@mui/icons-material/Settings';
import Notifications from '@mui/icons-material/Notifications';
import Login from '@mui/icons-material/Login';
import Logout from '@mui/icons-material/Logout';
import Sync from '@mui/icons-material/Sync';
import Error from '@mui/icons-material/Error';
import Lock from '@mui/icons-material/Lock';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Warning from '@mui/icons-material/Warning';
import Person from '@mui/icons-material/Person';
import Dns from '@mui/icons-material/Dns';
import LocationOn from '@mui/icons-material/LocationOn';
import Timer from '@mui/icons-material/Timer';
import Group from '@mui/icons-material/Group';
import GppBad from '@mui/icons-material/GppBad';
import TrendingUp from '@mui/icons-material/TrendingUp';
import TrendingDown from '@mui/icons-material/TrendingDown';
import History from '@mui/icons-material/History';
import Smartphone from '@mui/icons-material/Smartphone';
import PublicOff from '@mui/icons-material/PublicOff';
import Monitor from '@mui/icons-material/Monitor';
import { alpha, useTheme } from '@mui/material/styles'

interface Event {
  id: string
  type: 'login' | 'logout' | 'refresh' | 'failed' | 'mfa'
  title: string
  badge: string
  time: string
  email: string
  ip?: string
  location?: string
  device?: string
  details?: string
}

const RealTimeAuthEventsMonitorV2 = () => {
  const theme = useTheme()
  const [isPaused, setIsPaused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [eventFilters, setEventFilters] = useState({
    login: true,
    logout: true,
    refresh: true,
    failed: true,
    mfa: true,
  })

  const mockEvents: Event[] = [
    {
      id: '1',
      type: 'login',
      title: 'Login Success',
      badge: 'Success',
      time: '10:42:05 AM',
      email: 'user@example.com',
      ip: '192.168.1.1',
      location: 'San Francisco, US',
    },
    {
      id: '2',
      type: 'refresh',
      title: 'Token Refresh',
      badge: 'Info',
      time: '10:42:02 AM',
      email: 'admin@corp.com',
      ip: '10.0.0.5',
    },
    {
      id: '3',
      type: 'failed',
      title: 'Failed Login Attempt',
      badge: 'Blocked',
      time: '10:41:55 AM',
      email: 'unknown@hacker.net',
      ip: '45.33.22.11',
      details: 'Suspicious IP Block',
    },
    {
      id: '4',
      type: 'mfa',
      title: 'MFA Challenge',
      badge: 'Pending',
      time: '10:41:30 AM',
      email: 'sarah@dev.io',
      ip: '192.168.1.2',
      device: 'SMS Sent',
    },
    {
      id: '5',
      type: 'logout',
      title: 'Logout',
      badge: 'Info',
      time: '10:40:00 AM',
      email: 'user@example.com',
      details: 'Session duration: 45m',
    },
  ]

  const getEventIcon = (type: Event['type']) => {
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

  const getEventColor = (type: Event['type']) => {
    switch (type) {
      case 'login':
        return {
          bg: alpha(theme.palette.success.main, 0.1),
          text: theme.palette.success.main,
        }
      case 'refresh':
        return {
          bg: alpha(theme.palette.primary.main, 0.1),
          text: theme.palette.primary.main,
        }
      case 'failed':
        return {
          bg: alpha(theme.palette.error.main, 0.1),
          text: theme.palette.error.main,
        }
      case 'mfa':
        return {
          bg: alpha(theme.palette.warning.main, 0.1),
          text: theme.palette.warning.main,
        }
      case 'logout':
        return {
          bg: theme.palette.action.hover,
          text: theme.palette.text.secondary,
        }
    }
  }

  const getBadgeColor = (badge: string) => {
    if (badge === 'Success')
      return {
        bg: alpha(theme.palette.success.main, 0.1),
        text: theme.palette.success.main,
      }
    if (badge === 'Blocked')
      return {
        bg: alpha(theme.palette.error.main, 0.1),
        text: theme.palette.error.main,
      }
    if (badge === 'Pending')
      return {
        bg: alpha(theme.palette.warning.main, 0.1),
        text: theme.palette.warning.main,
      }
    return {
      bg: alpha(theme.palette.info.main, 0.1),
      text: theme.palette.info.main,
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      {/* Top Navigation */}
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
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Monitor sx={{ color: 'primary.main', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '18px', fontWeight: 700, color: 'text.primary' }}>
              AuthStream Monitor
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                  },
                }}
              />
              <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'text.secondary' }}>
                Receiving Events
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant='contained'
            startIcon={<Download />}
            sx={{
              height: 36,
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 700,
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            Export Log
          </Button>
          <Button
            variant='outlined'
            startIcon={<Pause />}
            onClick={() => setIsPaused(!isPaused)}
            sx={{
              height: 36,
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 700,
              borderColor: 'divider',
              color: 'text.primary',
              '&:hover': { bgcolor: 'action.hover', borderColor: 'divider' },
            }}
          >
            {isPaused ? 'Resume' : 'Pause'} Stream
          </Button>
          <IconButton sx={{ width: 36, height: 36, bgcolor: 'action.hover' }}>
            <Settings fontSize='small' />
          </IconButton>
          <IconButton sx={{ width: 36, height: 36, bgcolor: 'action.hover' }}>
            <Notifications fontSize='small' />
          </IconButton>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar Filters */}
        <Box
          sx={{
            width: 320,
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography sx={{ fontSize: '20px', fontWeight: 700, color: 'text.primary', mb: 3 }}>
              Filters
            </Typography>

            {/* Search */}
            <TextField
              fullWidth
              placeholder='Search User ID or IP'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  height: 42,
                  '& fieldset': { borderColor: 'divider' },
                  '&:hover fieldset': { borderColor: 'primary.main' },
                },
              }}
            />

            {/* Date Range (Disabled) */}
            <Box
              sx={{
                opacity: 0.6,
                pointerEvents: 'none',
                mb: 3,
              }}
            >
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
                Date Range
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
                  borderRadius: '8px',
                }}
              >
                <Timer sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
                  Live (Current Session)
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
              Event Types
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {[
                {
                  key: 'login',
                  label: 'Login',
                  icon: <Login sx={{ fontSize: 14 }} />,
                  color: theme.palette.success.main,
                },
                {
                  key: 'logout',
                  label: 'Logout',
                  icon: <Logout sx={{ fontSize: 14 }} />,
                  color: theme.palette.text.secondary,
                },
                {
                  key: 'refresh',
                  label: 'Token Refresh',
                  icon: <Sync sx={{ fontSize: 14 }} />,
                  color: theme.palette.primary.main,
                },
                {
                  key: 'failed',
                  label: 'Failed Attempt',
                  icon: <Error sx={{ fontSize: 14 }} />,
                  color: theme.palette.error.main,
                },
                {
                  key: 'mfa',
                  label: 'MFA Challenge',
                  icon: <Lock sx={{ fontSize: 14 }} />,
                  color: theme.palette.warning.main,
                },
              ].map((filter) => (
                <FormControlLabel
                  key={filter.key}
                  control={
                    <Checkbox
                      checked={eventFilters[filter.key as keyof typeof eventFilters]}
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
                          bgcolor: alpha(filter.color as string, 0.1),
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
                  sx={{ py: 0.75, '&:hover': { bgcolor: 'action.hover' }, borderRadius: '4px' }}
                />
              ))}
            </Box>
          </Box>

          {/* System Status */}
          <Box sx={{ borderTop: 1, borderColor: 'divider', p: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: 1,
                borderColor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: '12px',
              }}
            >
              <Typography
                sx={{ fontSize: '11px', fontWeight: 600, color: 'primary.main', mb: 0.5 }}
              >
                System Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography sx={{ fontSize: '14px', color: 'text.primary' }}>
                  All systems operational
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Main Feed */}
        <Box sx={{ flex: 1, bgcolor: 'background.default', overflow: 'auto' }}>
          <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4 }}>
            {/* Stats Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
              {[
                {
                  label: 'Active Sessions',
                  value: '842',
                  trend: '+12%',
                  up: true,
                  icon: <Group sx={{ fontSize: 64, color: 'primary.main' }} />,
                },
                {
                  label: 'Failed Logins (1hr)',
                  value: '14',
                  trend: '-2%',
                  up: true,
                  icon: <GppBad sx={{ fontSize: 64, color: 'error.main' }} />,
                },
                {
                  label: 'Avg. Latency',
                  value: '45ms',
                  trend: '+5%',
                  up: false,
                  icon: <Timer sx={{ fontSize: 64, color: 'warning.main' }} />,
                },
              ].map((stat, idx) => (
                <Paper
                  key={idx}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: '12px',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': { borderColor: 'primary.main' },
                    transition: 'border-color 0.2s',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      p: 2,
                      opacity: 0.1,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography
                    sx={{ fontSize: '14px', color: 'text.secondary', fontWeight: 500, mb: 1 }}
                  >
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
                        '& .MuiChip-icon': {
                          fontSize: 12,
                          color: 'inherit',
                        },
                      }}
                    />
                  </Box>
                </Paper>
              ))}
            </Box>

            {/* Live Feed Timeline */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                borderRadius: '12px',
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
                  Live Feed
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
                    borderRadius: '4px',
                  }}
                >
                  Last updated: Just now
                </Box>
              </Box>

              <Box sx={{ p: 3 }}>
                {mockEvents.map((event, idx) => {
                  const colors = getEventColor(event.type)
                  const badgeColors = getBadgeColor(event.badge)
                  const isLast = idx === mockEvents.length - 1

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
                      {/* Timeline Icon */}
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
                          <Box
                            sx={{
                              width: 1,
                              flex: 1,
                              bgcolor: 'divider',
                              mt: 1,
                            }}
                          />
                        )}
                      </Box>

                      {/* Event Content */}
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
                            <Typography
                              sx={{ fontSize: '14px', fontWeight: 600, color: 'text.primary' }}
                            >
                              {event.title}
                            </Typography>
                            <Chip
                              label={event.badge}
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
                            sx={{
                              fontSize: '11px',
                              fontFamily: 'monospace',
                              color: 'text.secondary',
                            }}
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
                            borderRadius: '8px',
                            '&:hover': {
                              borderColor:
                                event.type === 'failed'
                                  ? alpha(theme.palette.error.main, 0.3)
                                  : 'primary.main',
                            },
                            transition: 'border-color 0.2s',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: 2,
                              fontSize: '14px',
                            }}
                          >
                            <Box
                              sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}
                            >
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Dns
                                sx={{
                                  fontSize: 16,
                                  color: event.type === 'failed' ? 'error.main' : 'text.secondary',
                                }}
                              />
                              <Typography
                                sx={{
                                  fontFamily: 'monospace',
                                  fontSize: '13px',
                                  color: 'text.secondary',
                                }}
                              >
                                {event.ip}
                              </Typography>
                            </Box>
                            {event.location && (
                              <Box
                                sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}
                              >
                                <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
                                  {event.location}
                                </Typography>
                              </Box>
                            )}
                            {event.device && (
                              <Box
                                sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}
                              >
                                <Smartphone sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
                                  {event.device}
                                </Typography>
                              </Box>
                            )}
                            {event.details && (
                              <Box
                                sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}
                              >
                                {event.type === 'failed' ? (
                                  <PublicOff sx={{ fontSize: 16, color: 'error.main' }} />
                                ) : (
                                  <Timer sx={{ fontSize: 16, color: 'text.secondary' }} />
                                )}
                                <Typography
                                  sx={{
                                    fontSize: event.type === 'failed' ? '12px' : '14px',
                                    fontWeight: event.type === 'failed' ? 600 : 400,
                                    color:
                                      event.type === 'failed' ? 'error.main' : 'text.secondary',
                                  }}
                                >
                                  {event.details}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Paper>
                      </Box>
                    </Box>
                  )
                })}
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
                  Load older events
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
