import React from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  alpha,
} from '@mui/material'
import Analytics from '@mui/icons-material/Analytics';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Timer from '@mui/icons-material/Timer';
import NotificationsActive from '@mui/icons-material/NotificationsActive';
import Smartphone from '@mui/icons-material/Smartphone';
import Sms from '@mui/icons-material/Sms';
import Email from '@mui/icons-material/Email';
import UsbOutlined from '@mui/icons-material/UsbOutlined';
import Key from '@mui/icons-material/Key';
import GppBad from '@mui/icons-material/GppBad';
import TravelExplore from '@mui/icons-material/TravelExplore';
import Policy from '@mui/icons-material/Policy';
import DevicesOther from '@mui/icons-material/DevicesOther';
import PublicOff from '@mui/icons-material/PublicOff';
import Schedule from '@mui/icons-material/Schedule';
import { useTranslation } from 'react-i18next'

interface StatCard {
  label: string
  value: string
  subtext?: string
  icon: React.ReactNode
  color: string
}

interface FailureReason {
  label: string
  percentage: number
  color: string
}

interface SecurityInsight {
  title: string
  description: string
  time: string
  severity: 'high' | 'medium' | 'low'
  icon: React.ReactNode
}

const STATS: StatCard[] = [
  { label: 'Total Verifications', value: '142,893', icon: <Analytics />, color: 'primary' },
  { label: 'Global Success Rate', value: '98.2%', icon: <CheckCircle />, color: 'success' },
  { label: 'Avg. Verify Time', value: '145ms', icon: <Timer />, color: 'info' },
  { label: 'Security Alerts', value: '23', icon: <NotificationsActive />, color: 'warning' },
]

const FAILURES: FailureReason[] = [
  { label: 'OTP Code Expired', percentage: 45, color: '#ef4444' },
  { label: 'Invalid Code Input', percentage: 30, color: '#f59e0b' },
  { label: 'Network Timeout', percentage: 15, color: '#6366f1' },
]

const INSIGHTS: SecurityInsight[] = [
  {
    title: 'Brute-force Pattern',
    description: 'Multiple failed attempts on User ID #892 from single IP range.',
    time: '2 min ago',
    severity: 'high',
    icon: <GppBad />,
  },
  {
    title: 'Impossible Travel',
    description: 'Login attempt from Tokyo 30 mins after login from New York.',
    time: '15 min ago',
    severity: 'medium',
    icon: <TravelExplore />,
  },
  {
    title: 'Policy Update',
    description: 'New MFA policy "Admin Access" enforced successfully.',
    time: '2 hours ago',
    severity: 'low',
    icon: <Policy />,
  },
  {
    title: 'New Device Type',
    description: 'Spike in logins from unrecognized generic Android devices.',
    time: '5 hours ago',
    severity: 'low',
    icon: <DevicesOther />,
  },
]

const SEVERITY_COLORS = {
  high: 'error',
  medium: 'warning',
  low: 'info',
} as const

const METHOD_SCORES = [
  { name: 'Authenticator App', icon: <Smartphone />, score: 95, label: 'Excellent' },
  { name: 'SMS / Text', icon: <Sms />, score: 78, label: 'Good' },
  { name: 'Email', icon: <Email />, score: 65, label: 'Fair' },
  { name: 'Security Key', icon: <UsbOutlined />, score: 99, label: 'Excellent' },
  { name: 'Backup Codes', icon: <Key />, score: 85, label: 'Very Good' },
]

export default function MFAUsageAnalytics() {
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
              {t('auth.mfa.analytics_title', 'MFA Usage Analytics')}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {t(
                'auth.mfa.analytics_subtitle',
                'Monitor authentication health, investigate failure patterns, and optimize security methods.',
              )}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {STATS.map((stat) => (
          <Grid key={stat.label} size={{ xs: 6, md: 3 }}>
            <Card
              sx={{
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                },
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
                    '& .MuiSvgIcon-root': {
                      color: `${stat.color}.main`,
                      fontSize: 20,
                    },
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
        {/* Left Column */}
        <Grid size={{ xs: 12, md: 7 }}>
          {/* Top Failure Reasons */}
          <Card sx={{ borderRadius: 3, border: 1, borderColor: 'divider', mb: 3 }}>
            <CardContent>
              <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 3 }}>
                {t('auth.mfa.top_failures', 'Top Failure Reasons')}
              </Typography>
              {FAILURES.map((failure) => (
                <Box key={failure.label} sx={{ mb: 2.5, '&:last-child': { mb: 0 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant='body2' fontWeight={500}>
                      {failure.label}
                    </Typography>
                    <Typography variant='body2' fontWeight={700}>
                      {failure.percentage}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant='determinate'
                    value={failure.percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(failure.color, 0.15),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        bgcolor: failure.color,
                      },
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Unusual Locations */}
          <Card
            sx={{
              borderRadius: 3,
              border: 1,
              borderColor: (theme) => alpha(theme.palette.warning.main, 0.4),
              bgcolor: (theme) => alpha(theme.palette.warning.main, 0.04),
              mb: 3,
            }}
          >
            <CardContent
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 2,
                '&:last-child': { pb: 2 },
              }}
            >
              <PublicOff sx={{ color: 'warning.main', fontSize: 28 }} />
              <Box>
                <Typography variant='subtitle2' fontWeight={600}>
                  {t('auth.mfa.unusual_locations', 'Unusual Locations')}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Spike in failures: <strong>Brazil</strong> — 240 attempts in last hour
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Method Effectiveness Scorecard */}
          <Card sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
            <CardContent>
              <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 2 }}>
                {t('auth.mfa.method_scorecard', 'Method Effectiveness Scorecard')}
              </Typography>
              <Typography variant='caption' color='text.secondary' sx={{ mb: 3, display: 'block' }}>
                Calculated based on security strength, usability friction, and failure rates.
              </Typography>
              {METHOD_SCORES.map((method) => (
                <Box
                  key={method.name}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    py: 1.5,
                    borderBottom: 1,
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 0 },
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1.5,
                      bgcolor: 'action.hover',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '& .MuiSvgIcon-root': { fontSize: 18, color: 'text.secondary' },
                    }}
                  >
                    {method.icon}
                  </Box>
                  <Typography variant='body2' fontWeight={500} sx={{ flex: 1 }}>
                    {method.name}
                  </Typography>
                  <Box sx={{ width: 100 }}>
                    <LinearProgress
                      variant='determinate'
                      value={method.score}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          bgcolor:
                            method.score >= 90
                              ? 'success.main'
                              : method.score >= 70
                                ? 'primary.main'
                                : 'warning.main',
                        },
                      }}
                    />
                  </Box>
                  <Chip
                    label={method.label}
                    size='small'
                    color={
                      method.score >= 90 ? 'success' : method.score >= 70 ? 'primary' : 'warning'
                    }
                    variant='outlined'
                    sx={{ height: 22, fontSize: '0.65rem', minWidth: 70, fontWeight: 600 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column — Security Insights */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant='subtitle1' fontWeight={600}>
                  {t('auth.mfa.security_insights', 'Security Insights')}
                </Typography>
              </Box>
              <List disablePadding>
                {INSIGHTS.map((insight, index) => (
                  <ListItem
                    key={insight.title}
                    alignItems='flex-start'
                    sx={{
                      px: 3,
                      py: 2,
                      borderBottom: index < INSIGHTS.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        mt: 0.5,
                        '& .MuiSvgIcon-root': {
                          color: `${SEVERITY_COLORS[insight.severity]}.main`,
                          fontSize: 22,
                        },
                      }}
                    >
                      {insight.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant='subtitle2' fontWeight={600}>
                            {insight.title}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant='body2' color='text.secondary' component='div'>
                            {insight.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant='caption'
                              color='text.disabled'
                              component='span'
                              sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}
                            >
                              <Schedule sx={{ fontSize: 12 }} />
                              {insight.time}
                            </Typography>
                            <Chip
                              label={
                                insight.severity === 'high'
                                  ? 'High'
                                  : insight.severity === 'medium'
                                    ? 'Medium'
                                    : 'Low'
                              }
                              size='small'
                              color={SEVERITY_COLORS[insight.severity]}
                              variant='outlined'
                              sx={{ height: 18, fontSize: '0.6rem' }}
                            />
                          </Box>
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />
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
