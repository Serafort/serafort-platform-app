import React, { useMemo } from 'react'
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
  Skeleton,
  Alert,
  alpha,
} from '@mui/material'
import { AdminPageHeader } from '@auth/modules/authentication-core/components/shared/admin'
import Analytics from '@mui/icons-material/Analytics'
import Smartphone from '@mui/icons-material/Smartphone'
import Sms from '@mui/icons-material/Sms'
import UsbOutlined from '@mui/icons-material/UsbOutlined'
import Key from '@mui/icons-material/Key'
import ShieldOutlined from '@mui/icons-material/ShieldOutlined'
import GppBad from '@mui/icons-material/GppBad'
import LockOutlined from '@mui/icons-material/LockOutlined'
import PersonOff from '@mui/icons-material/PersonOff'
import VerifiedUser from '@mui/icons-material/VerifiedUser'
import Schedule from '@mui/icons-material/Schedule'
import { useTranslation } from 'react-i18next'

import { useAdminMfaStatsQuery, useAdminAuditLogsQuery } from '../../hooks/useAdminMonitoringQuery'
import type { AuditLogItem } from '../../services/admin-monitoring.service'

/**
 * MFA usage analytics, reporting only what the platform actually records.
 *
 * What this screen used to show was invented in the source file: 142,893 TOTP
 * authentications and a 98.2% adoption rate held in a `STATS` constant, a
 * "Top Failure Reasons" breakdown (45/30/15%), a "Method Effectiveness
 * Scorecard" scoring five factors out of 100, a spike of "240 attempts from
 * Brazil", and four "Security Insights" describing a brute-force attack on
 * "User ID #892" and impossible travel between Tokyo and New York. None of it
 * came from a query. The four headline tiles did read a live hook, but through
 * an interface that declared camelCase fields (`totpCount`,
 * `adoptionRatePercentage`) the endpoint has never returned, so every read was
 * `undefined` and fell through to the placeholder literals — a security
 * console stating, with confidence, figures from a database that holds ten
 * accounts.
 *
 * The rule applied here is the one `PasskeyUsageStats` already documents: show
 * what the endpoint knows and nothing else. `GET /api/admin/statistics/mfa`
 * reports enrolment counts, spent recovery codes and a daily challenge series;
 * the audit log supplies real security events. Failure-reason breakdowns,
 * per-method effectiveness scores and geographic anomaly detection have no
 * field behind them anywhere in this API, so those panels are gone rather than
 * reconstructed from guesses.
 */

const SECURITY_ACTIONS = [
  'FAILED_LOGIN',
  'ACCOUNT_LOCKED',
  'USER_SUSPENDED',
  'MFA_ENABLED',
  'MFA_DISABLED',
  'MFA_VERIFIED',
  'PASSKEY_REGISTERED',
  'PASSKEY_DELETED',
  'PASSWORD_CHANGED',
]

const ACTION_ICONS: Record<string, React.ReactNode> = {
  FAILED_LOGIN: <GppBad />,
  ACCOUNT_LOCKED: <LockOutlined />,
  USER_SUSPENDED: <PersonOff />,
  PASSKEY_REGISTERED: <UsbOutlined />,
  PASSKEY_DELETED: <UsbOutlined />,
  MFA_ENABLED: <VerifiedUser />,
  MFA_DISABLED: <ShieldOutlined />,
  MFA_VERIFIED: <VerifiedUser />,
  PASSWORD_CHANGED: <Key />,
}

const severityOf = (action: string): 'high' | 'medium' | 'low' => {
  if (action === 'ACCOUNT_LOCKED' || action === 'USER_SUSPENDED') return 'high'
  if (action === 'FAILED_LOGIN' || action === 'MFA_DISABLED') return 'medium'
  return 'low'
}

const SEVERITY_COLORS = {
  high: 'error',
  medium: 'warning',
  low: 'info',
} as const

/** "PASSKEY_REGISTERED" → "Passkey registered". */
const humanizeAction = (action: string): string => {
  const words = action.replace(/_/g, ' ').toLowerCase()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

const relativeTime = (iso: string, justNow: string): string => {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const minutes = Math.round((Date.now() - then) / 60000)
  if (minutes < 1) return justNow
  if (minutes < 60) return `${minutes}m`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.round(hours / 24)}d`
}

interface StatTile {
  label: string
  value: string
  caption?: string
  icon: React.ReactNode
  color: 'primary' | 'success' | 'info' | 'warning'
}

export default function MFAUsageAnalytics() {
  const { t } = useTranslation()
  const { data: mfa, isLoading, isError } = useAdminMfaStatsQuery()
  const { data: auditData, isLoading: isLoadingEvents } = useAdminAuditLogsQuery({ limit: 50 })

  const events: AuditLogItem[] = useMemo(() => {
    const logs = auditData?.logs ?? []
    return logs
      .filter((log) => SECURITY_ACTIONS.includes(String(log.action).toUpperCase()))
      .slice(0, 8)
  }, [auditData])

  const challenges = mfa?.daily_challenges ?? []
  const challengeTotal = challenges.reduce((sum, point) => sum + Number(point.count ?? 0), 0)
  const challengeMax = Math.max(1, ...challenges.map((point) => Number(point.count ?? 0)))

  const tiles: StatTile[] = [
    {
      label: t('monitoring.mfa.accounts_protected', 'Accounts with MFA'),
      value: mfa ? String(mfa.total_enabled) : '—',
      caption: mfa
        ? t('monitoring.mfa.of_total', 'of {{count}} accounts', { count: mfa.total_users })
        : undefined,
      icon: <ShieldOutlined />,
      color: 'primary',
    },
    {
      label: t('monitoring.mfa.totp_enrolments', 'Authenticator app'),
      value: mfa ? String(mfa.totp_count) : '—',
      icon: <Smartphone />,
      color: 'success',
    },
    {
      label: t('monitoring.mfa.passkey_enrolments', 'Passkey / FIDO2'),
      value: mfa ? String(mfa.passkey_count) : '—',
      icon: <UsbOutlined />,
      color: 'info',
    },
    {
      label: t('monitoring.mfa.recovery_used', 'Recovery codes used'),
      value: mfa ? String(mfa.recovery_codes_used) : '—',
      icon: <Key />,
      color: 'warning',
    },
  ]

  const adoption = mfa ? Math.round(mfa.adoption_rate) : 0

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      {/* Header */}
      <AdminPageHeader
        icon={<Analytics />}
        title={t('auth.mfa.analytics_title', 'MFA Usage Analytics')}
        description={t(
          'auth.mfa.analytics_subtitle',
          'Second-factor enrolment, challenge volume and recent security events.',
        )}
      />

      {isError && (
        <Alert severity='error' sx={{ mb: 3, borderRadius: 'var(--sf-radius-md, 8px)' }}>
          {t(
            'monitoring.mfa.load_error',
            'MFA statistics could not be loaded. Figures below are unavailable rather than estimated.',
          )}
        </Alert>
      )}

      {/* Enrolment tiles */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {tiles.map((tile) => (
          <Grid key={tile.label} size={{ xs: 6, md: 3 }}>
            <Card
              sx={{
                borderRadius: 'var(--sf-radius-lg, 12px)',
                border: 1,
                borderColor: 'divider',
                height: '100%',
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--sf-radius-md, 8px)',
                    bgcolor: (theme) => alpha(theme.palette[tile.color].main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1.5,
                    '& .MuiSvgIcon-root': { color: `${tile.color}.main`, fontSize: 20 },
                  }}
                >
                  {tile.icon}
                </Box>
                {isLoading ? (
                  <Skeleton variant='text' width={48} height={36} sx={{ mx: 'auto', mb: 0.5 }} />
                ) : (
                  <Typography variant='h5' fontWeight={800} sx={{ mb: 0.5 }}>
                    {tile.value}
                  </Typography>
                )}
                <Typography
                  variant='caption'
                  color='text.secondary'
                  fontWeight={500}
                  display='block'
                >
                  {tile.label}
                </Typography>
                {tile.caption && !isLoading && (
                  <Typography variant='caption' color='text.disabled'>
                    {tile.caption}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Left column */}
        <Grid size={{ xs: 12, md: 7 }}>
          {/* Adoption */}
          <Card
            sx={{
              borderRadius: 'var(--sf-radius-lg, 12px)',
              border: 1,
              borderColor: 'divider',
              mb: 3,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant='subtitle1' fontWeight={600}>
                  {t('monitoring.mfa.adoption_rate', 'Adoption rate')}
                </Typography>
                <Typography variant='subtitle1' fontWeight={800}>
                  {isLoading ? '—' : `${adoption}%`}
                </Typography>
              </Box>
              <LinearProgress
                variant='determinate'
                value={isLoading ? 0 : adoption}
                sx={{
                  height: 8,
                  borderRadius: 'var(--sf-radius-lg, 12px)',
                  bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 'var(--sf-radius-lg, 12px)',
                    bgcolor: adoption >= 80 ? 'success.main' : 'warning.main',
                  },
                }}
              />
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ mt: 1.5, display: 'block' }}
              >
                {t(
                  'monitoring.mfa.adoption_note',
                  'An account counts as protected once it has an authenticator secret, an SMS factor or a passkey.',
                )}
              </Typography>
              {mfa && mfa.sms_count > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                  <Sms sx={{ fontSize: 16, color: 'text.disabled' }} />
                  <Typography variant='caption' color='text.secondary'>
                    {t('monitoring.mfa.sms_enrolments', 'SMS factor')}: {mfa.sms_count}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Challenge volume */}
          <Card
            sx={{ borderRadius: 'var(--sf-radius-lg, 12px)', border: 1, borderColor: 'divider' }}
          >
            <CardContent>
              <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 0.5 }}>
                {t('monitoring.mfa.challenges_title', 'MFA challenges, last 30 days')}
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ mb: 2.5, display: 'block' }}
              >
                {t('monitoring.mfa.challenges_total', 'Total')}: {challengeTotal}
              </Typography>

              {isLoading ? (
                <Skeleton variant='rectangular' height={120} sx={{ borderRadius: 1 }} />
              ) : challenges.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant='body2' color='text.secondary'>
                    {t(
                      'monitoring.mfa.challenges_empty',
                      'No MFA challenges recorded in the last 30 days.',
                    )}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 120 }}>
                  {challenges.map((point) => (
                    <Box
                      key={point.date}
                      title={`${point.date}: ${point.count}`}
                      sx={{
                        flex: 1,
                        minWidth: 4,
                        height: `${Math.max(4, (Number(point.count) / challengeMax) * 100)}%`,
                        borderRadius: 'var(--sf-radius-sm, 4px)',
                        bgcolor: 'primary.main',
                        opacity: 0.85,
                      }}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right column — real security events */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            sx={{ borderRadius: 'var(--sf-radius-lg, 12px)', border: 1, borderColor: 'divider' }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant='subtitle1' fontWeight={600}>
                  {t('monitoring.mfa.recent_events', 'Recent security events')}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {t('monitoring.mfa.recent_events_source', 'From the audit log')}
                </Typography>
              </Box>

              {isLoadingEvents ? (
                <Box sx={{ px: 3, py: 2 }}>
                  {[0, 1, 2].map((row) => (
                    <Skeleton key={row} variant='text' height={48} />
                  ))}
                </Box>
              ) : events.length === 0 ? (
                <Box sx={{ px: 3, py: 5, textAlign: 'center' }}>
                  <Typography variant='body2' color='text.secondary'>
                    {t(
                      'monitoring.mfa.recent_events_empty',
                      'No security events recorded yet. Failed sign-ins, lockouts and factor changes appear here.',
                    )}
                  </Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {events.map((event, index) => {
                    const action = String(event.action).toUpperCase()
                    const severity = severityOf(action)
                    return (
                      <ListItem
                        key={event.id}
                        alignItems='flex-start'
                        sx={{
                          px: 3,
                          py: 2,
                          borderBottom: index < events.length - 1 ? 1 : 0,
                          borderColor: 'divider',
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 40,
                            mt: 0.5,
                            '& .MuiSvgIcon-root': {
                              color: `${SEVERITY_COLORS[severity]}.main`,
                              fontSize: 22,
                            },
                          }}
                        >
                          {ACTION_ICONS[action] ?? <ShieldOutlined />}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant='subtitle2' fontWeight={600}>
                              {humanizeAction(action)}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Typography variant='body2' color='text.secondary' component='div'>
                                {event.actor || t('monitoring.mfa.actor_unknown', 'Unattributed')}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography
                                  variant='caption'
                                  color='text.disabled'
                                  component='span'
                                  sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}
                                >
                                  <Schedule sx={{ fontSize: 12 }} />
                                  {relativeTime(
                                    event.timestamp,
                                    t('monitoring.mfa.just_now', 'just now'),
                                  )}
                                </Typography>
                                <Chip
                                  label={t(
                                    `monitoring.mfa.severity_${severity}`,
                                    severity === 'high'
                                      ? 'High'
                                      : severity === 'medium'
                                        ? 'Medium'
                                        : 'Low',
                                  )}
                                  size='small'
                                  color={SEVERITY_COLORS[severity]}
                                  variant='outlined'
                                  sx={{ height: 18, fontSize: '0.6rem' }}
                                />
                              </Box>
                            </Box>
                          }
                          secondaryTypographyProps={{ component: 'div' }}
                        />
                      </ListItem>
                    )
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}
