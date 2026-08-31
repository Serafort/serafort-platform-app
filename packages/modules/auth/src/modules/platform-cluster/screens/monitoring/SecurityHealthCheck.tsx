import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  alpha,
  CircularProgress,
  Alert,
} from '@mui/material'
import Shield from '@mui/icons-material/Shield';
import ErrorIcon from '@mui/icons-material/Error';
import Warning from '@mui/icons-material/Warning';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Security from '@mui/icons-material/Security';
import VpnKey from '@mui/icons-material/VpnKey';
import PersonOff from '@mui/icons-material/PersonOff';
import Settings from '@mui/icons-material/Settings';
import Schedule from '@mui/icons-material/Schedule';
import Password from '@mui/icons-material/Password';
import { useTranslation } from 'react-i18next'
import { useSecurityHealth } from '../../hooks/useHealthQuery'

type Severity = 'critical' | 'warning' | 'info'

const SEVERITY_CONFIG = (
  t: any,
): Record<
  Severity,
  { color: 'error' | 'warning' | 'info'; label: string; icon: React.ReactNode }
> => ({
  critical: {
    color: 'error',
    label: t('monitoring.security.severity_critical', 'Critical'),
    icon: <ErrorIcon />,
  },
  warning: {
    color: 'warning',
    label: t('monitoring.security.severity_warning', 'Warning'),
    icon: <Warning />,
  },
  info: {
    color: 'info',
    label: t('monitoring.security.severity_info', 'Info'),
    icon: <CheckCircle />,
  },
})

const REC_ICON_MAP: Record<string, React.ReactNode> = {
  'mfa-adoption': <Security />,
  'inactive-accounts': <PersonOff />,
  'token-rotation': <VpnKey />,
  'session-timeout': <Schedule />,
  'password-policy': <Password />,
}

export const SecurityHealthCheck: React.FC = () => {
  const { t } = useTranslation()
  const { data: healthRes, isLoading, error } = useSecurityHealth()

  const healthData = (healthRes as any)?.data || healthRes
  const securityScore = healthData?.score ?? 85
  const recommendations = (healthData as any)?.recommendations || []
  const stats = (healthData as any)?.stats

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success.main'
    if (score >= 60) return 'warning.main'
    return 'error.main'
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='error'>
          {t('monitoring.security.error_loading', 'Failed to load security health data')}
        </Alert>
      </Container>
    )
  }

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
            <Shield sx={{ fontSize: 24, color: 'primary.main' }} />
          </Box>
          <Box>
            <Typography variant='h5' fontWeight={700} letterSpacing='-0.02em'>
              {t('monitoring.security.health_check_title', 'Security Health Check')}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {t(
                'monitoring.security.health_check_subtitle',
                'Overview of your platform security posture',
              )}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Score & Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Main Score */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              borderRadius: 3,
              border: 1,
              borderColor: 'divider',
              height: '100%',
              boxShadow: 'none',
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography
                variant='subtitle2'
                fontWeight={600}
                color='text.secondary'
                sx={{ mb: 2 }}
              >
                {t('monitoring.security.overall_score', 'Overall Security Score')}
              </Typography>
              {/* Circular Score */}
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                <Box
                  sx={{
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    border: 8,
                    borderColor: (theme) => alpha(theme.palette.divider, 0.2),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      inset: -8,
                      borderRadius: '50%',
                      border: 8,
                      borderColor: 'transparent',
                      borderTopColor: getScoreColor(securityScore),
                      borderRightColor:
                        securityScore > 25 ? getScoreColor(securityScore) : 'transparent',
                      borderBottomColor:
                        securityScore > 50 ? getScoreColor(securityScore) : 'transparent',
                      borderLeftColor:
                        securityScore > 75 ? getScoreColor(securityScore) : 'transparent',
                      transform: 'rotate(-45deg)',
                    },
                  }}
                >
                  <Typography variant='h3' fontWeight={800} color={getScoreColor(securityScore)}>
                    {securityScore}
                  </Typography>
                </Box>
              </Box>
              <Typography variant='body2' color='text.secondary'>
                {t(
                  'monitoring.security.score_comparison',
                  'Based on best practices and account activity',
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Stat Cards */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Grid container spacing={2} sx={{ height: '100%' }}>
            {[
              {
                label: t('monitoring.security.stat_mfa', 'MFA Adoption'),
                value: `${stats?.mfaEnabled ?? 0} / ${stats?.totalUsers ?? 0}`,
                color:
                  (stats?.mfaEnabled ?? 0) === (stats?.totalUsers ?? 0) ? 'success' : 'warning',
                icon: <Security />,
              },
              {
                label: t('monitoring.security.stat_inactive', 'Inactive Accounts'),
                value: stats?.inactiveUsers ?? 0,
                color: (stats?.inactiveUsers ?? 0) > 0 ? 'error' : 'success',
                icon: <PersonOff />,
              },
              {
                label: t('monitoring.security.stat_tokens', 'Active Tokens'),
                value: stats?.oldTokens ?? 0,
                color: (stats?.oldTokens ?? 0) > 5 ? 'warning' : 'info',
                icon: <VpnKey />,
              },
            ].map((stat) => (
              <Grid key={stat.label} size={{ xs: 12 }}>
                <Card
                  sx={{
                    borderRadius: 3,
                    border: 1,
                    borderColor: 'divider',
                    boxShadow: 'none',
                  }}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 1.5,
                      '&:last-child': { pb: 1.5 },
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: (theme) =>
                          alpha(
                            (theme.palette as any)[stat.color as any]?.main ??
                              theme.palette.primary.main,
                            0.1,
                          ),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '& .MuiSvgIcon-root': {
                          color: `${stat.color}.main`,
                          fontSize: 20,
                        },
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='caption' color='text.secondary' fontWeight={500}>
                        {stat.label}
                      </Typography>
                      <Typography variant='h6' fontWeight={700}>
                        {stat.value}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* Prioritized Recommendations */}
      <Card sx={{ borderRadius: 3, border: 1, borderColor: 'divider', mb: 3, boxShadow: 'none' }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant='subtitle1' fontWeight={600}>
              {t('monitoring.security.recommendations_title', 'Prioritized Recommendations')}
            </Typography>
          </Box>
          {recommendations.length > 0 ? (
            <List disablePadding>
              {recommendations.map((rec: any, index: number) => {
                const config = (SEVERITY_CONFIG(t) as any)[rec.severity]
                return (
                  <ListItem
                    key={rec.id}
                    sx={{
                      px: 3,
                      py: 2,
                      borderBottom: index < recommendations.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                      transition: 'background-color 0.15s',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 44,
                        '& .MuiSvgIcon-root': {
                          color: `${config.color}.main`,
                          fontSize: 22,
                        },
                      }}
                    >
                      {REC_ICON_MAP[rec.id] || config.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant='subtitle2' fontWeight={600}>
                            {rec.title}
                          </Typography>
                          <Chip
                            label={config.label}
                            size='small'
                            color={config.color}
                            variant='outlined'
                            sx={{ height: 20, fontSize: '0.65rem' }}
                          />
                        </Box>
                      }
                      secondary={rec.description}
                    />
                    <ArrowForward sx={{ color: 'text.disabled', fontSize: 18 }} />
                  </ListItem>
                )
              })}
            </List>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1, opacity: 0.5 }} />
              <Typography variant='body2' color='text.secondary'>
                {t(
                  'monitoring.security.no_recommendations',
                  'Your security posture looks great! No immediate actions required.',
                )}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <Box
        sx={{
          textAlign: 'center',
          py: 2,
        }}
      >
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
        >
          <Schedule sx={{ fontSize: 14 }} />
          {t(
            'auth.security.scan_info',
            'Security scans are performed automatically. Last scan: just now.',
          )}
        </Typography>
        <Button
          startIcon={<Settings />}
          size='small'
          sx={{ textTransform: 'none', fontWeight: 600, mt: 1 }}
        >
          {t('auth.security.configure_scan', 'Configure Scan Settings')}
        </Button>
      </Box>
    </Container>
  )
}

export default SecurityHealthCheck


