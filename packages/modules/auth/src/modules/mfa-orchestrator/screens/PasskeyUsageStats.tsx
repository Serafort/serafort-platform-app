import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  alpha,
} from '@mui/material'
import Analytics from '@mui/icons-material/Analytics';
import Fingerprint from '@mui/icons-material/Fingerprint';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Timer from '@mui/icons-material/Timer';
import Devices from '@mui/icons-material/Devices';
import TrendingUp from '@mui/icons-material/TrendingUp';
import Apple from '@mui/icons-material/Apple';
import Android from '@mui/icons-material/Android';
import DesktopWindows from '@mui/icons-material/DesktopWindows';
import Schedule from '@mui/icons-material/Schedule';
import { useTranslation } from 'react-i18next'

interface StatCard {
  label: string
  value: string
  icon: React.ReactNode
  color: string
}

const STATS: StatCard[] = [
  { label: 'Total Passkeys', value: '1,247', icon: <Fingerprint />, color: 'primary' },
  { label: 'Success Rate', value: '99.4%', icon: <CheckCircle />, color: 'success' },
  { label: 'Avg Auth Time', value: '82ms', icon: <Timer />, color: 'info' },
  { label: 'Active Devices', value: '892', icon: <Devices />, color: 'warning' },
]

const PLATFORM_BREAKDOWN = [
  { name: 'iOS / macOS', icon: <Apple />, percentage: 48, count: 598 },
  { name: 'Android', icon: <Android />, percentage: 33, count: 411 },
  { name: 'Windows', icon: <DesktopWindows />, percentage: 19, count: 238 },
]

const RECENT_ACTIVITY = [
  { event: 'Passkey registered', user: 'sarah.j@company.com', platform: 'iOS', time: '5 min ago' },
  { event: 'Auth success', user: 'mike.d@company.com', platform: 'Android', time: '12 min ago' },
  { event: 'Passkey revoked', user: 'admin@company.com', platform: 'Windows', time: '1 hour ago' },
  {
    event: 'Recovery initiated',
    user: 'jane.k@company.com',
    platform: 'macOS',
    time: '2 hours ago',
  },
]

export default function PasskeyUsageStats() {
  const { t } = useTranslation()

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Analytics sx={{ fontSize: 24, color: 'primary.main' }} />
          </Box>
          <Box>
            <Typography variant='h5' fontWeight={700} letterSpacing='-0.02em'>
              {t('auth.passkey.usage_title', 'Passkey Usage Statistics')}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {t(
                'auth.passkey.usage_subtitle',
                'Monitor passkey adoption, authentication performance, and platform distribution.',
              )}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {STATS.map((stat) => (
          <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
            <Card
              sx={{
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: (theme) => alpha((theme.palette as any)[stat.color].main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1.5,
                    '& .MuiSvgIcon-root': { color: `${stat.color}.main`, fontSize: 20 },
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography variant='h5' fontWeight={800} sx={{ mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant='caption' color='text.secondary' fontWeight={500}>
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Platform Breakdown */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, border: 1, borderColor: 'divider', height: '100%' }}>
            <CardContent>
              <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 3 }}>
                {t('auth.passkey.platform_breakdown', 'Platform Breakdown')}
              </Typography>
              {PLATFORM_BREAKDOWN.map((platform) => (
                <Box key={platform.name} sx={{ mb: 3, '&:last-child': { mb: 0 } }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          '& .MuiSvgIcon-root': { fontSize: 18, color: 'text.secondary' },
                        }}
                      >
                        {platform.icon}
                      </Box>
                      <Typography variant='body2' fontWeight={500}>
                        {platform.name}
                      </Typography>
                    </Box>
                    <Typography variant='body2' fontWeight={700}>
                      {platform.percentage}% ({platform.count})
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant='determinate'
                    value={platform.percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'action.hover',
                      '& .MuiLinearProgress-bar': { borderRadius: 4 },
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Adoption Trend */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, border: 1, borderColor: 'divider', height: '100%' }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 3,
                }}
              >
                <Typography variant='subtitle1' fontWeight={600}>
                  {t('auth.passkey.adoption_trend', 'Adoption Trend')}
                </Typography>
                <Chip
                  icon={<TrendingUp sx={{ fontSize: '14px !important' }} />}
                  label='+23% this month'
                  size='small'
                  color='success'
                  variant='outlined'
                  sx={{ height: 24, fontSize: '0.7rem', fontWeight: 600 }}
                />
              </Box>
              {/* Simplified bar chart */}
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 140, mb: 2 }}>
                {[38, 45, 52, 58, 67, 72, 78, 85, 90, 95, 100, 110].map((val, i) => (
                  <Box
                    key={i}
                    sx={{
                      flex: 1,
                      height: `${(val / 110) * 100}%`,
                      borderRadius: '4px 4px 0 0',
                      bgcolor: (theme) =>
                        i === 11
                          ? theme.palette.primary.main
                          : alpha(theme.palette.primary.main, 0.2 + i * 0.05),
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='caption' color='text.disabled'>
                  Jan
                </Typography>
                <Typography variant='caption' color='text.disabled'>
                  Dec
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant='subtitle1' fontWeight={600}>
                  {t('auth.passkey.recent_activity', 'Recent Activity')}
                </Typography>
              </Box>
              <List disablePadding>
                {RECENT_ACTIVITY.map((activity, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      px: 3,
                      py: 1.5,
                      borderBottom: index < RECENT_ACTIVITY.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Fingerprint sx={{ fontSize: 20, color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant='body2' fontWeight={600}>
                            {activity.event}
                          </Typography>
                          <Chip
                            label={activity.platform}
                            size='small'
                            variant='outlined'
                            sx={{ height: 20, fontSize: '0.6rem' }}
                          />
                        </Box>
                      }
                      secondary={activity.user}
                    />
                    <Typography
                      variant='caption'
                      color='text.disabled'
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}
                    >
                      <Schedule sx={{ fontSize: 12 }} />
                      {activity.time}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}
