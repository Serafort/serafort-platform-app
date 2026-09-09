import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Card, CardContent, Container, Stack, Typography, alpha, useTheme } from '@mui/material'
import Analytics from '@mui/icons-material/Analytics'
import Fingerprint from '@mui/icons-material/Fingerprint'
import PhoneAndroid from '@mui/icons-material/PhoneAndroid'
import Devices from '@mui/icons-material/Devices'
import TrendingUp from '@mui/icons-material/TrendingUp'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { useTranslation } from 'react-i18next'
import { useMFAStats } from '../../../authorization-engine/hooks'
import PlatformClusterPath from '../../../platform-cluster/screens/path'
import { AdminDataState, AdminPageHeader, AdminStatCard } from '../../../authentication-core/components/shared/admin'

/**
 * Passkey adoption across the organization.
 *
 * This screen previously rendered a full mock analytics dashboard: a
 * "Total Passkeys: 1,247" tile, a "Success Rate: 99.4%" tile with no field
 * behind it anywhere in the API, a platform-breakdown chart with invented
 * percentages, and a "Recent Activity" list of fabricated events attributed to
 * fabricated people — `sarah.j@company.com`, `mike.d@company.com` — email
 * addresses that look real and were never real. None of it read from a query;
 * every number was a literal in the JSX.
 *
 * `GET /api/admin/statistics/mfa` is a real endpoint with a hook
 * (`useMFAStats`) that was built and never called from anywhere. It reports
 * enrolment counts and a day-by-day challenge count, but nothing about success
 * rate, auth latency, device platform, or who did what — so the screen below
 * shows only what that endpoint actually knows, and the trend chart is built
 * from the real `daily_challenges` series rather than twelve invented bars.
 * Platform breakdown and a per-user activity feed are not reconstructed here:
 * there is no field for either. A fuller breakdown already exists at
 * `/admin/monitoring/mfa-analytics` (platform-cluster's MFAUsageAnalytics),
 * which this links out to rather than duplicating with guesses.
 */
export default function PasskeyUsageStats() {
  const { t } = useTranslation()
  const theme = useTheme()
  const navigate = useNavigate()

  const { data: response, isLoading, isError, refetch } = useMFAStats()
  const stats = response?.data

  const trend = useMemo(() => {
    const points = stats?.daily_challenges ?? []
    const max = Math.max(1, ...points.map((p) => p.count))
    return { points, max }
  }, [stats])

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <AdminPageHeader
        icon={<Analytics sx={{ fontSize: 28 }} />}
        title={t('auth.passkey.usage_title', 'MFA and passkey adoption')}
        description={t(
          'auth.passkey.usage_subtitle',
          'How many accounts have a second factor, and how often it is challenged.',
        )}
      />

      <AdminDataState
        loading={isLoading}
        error={isError || undefined}
        onRetry={() => void refetch()}
        empty={!stats}
        emptyIcon={<Analytics sx={{ fontSize: 32 }} />}
        emptyTitle={t('auth.passkey.usage_empty_title', 'No adoption data yet')}
      >
        {stats && (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
                gap: 2,
                mb: 4,
              }}
            >
              <AdminStatCard
                icon={<Devices />}
                tone='primary'
                label={t('auth.passkey.stat_total_enabled', 'Accounts with MFA')}
                value={stats.total_enabled}
              />
              <AdminStatCard
                icon={<Fingerprint />}
                tone='success'
                label={t('auth.passkey.stat_passkey_count', 'Passkeys enabled')}
                value={stats.passkey_count}
              />
              <AdminStatCard
                icon={<PhoneAndroid />}
                tone='info'
                label={t('auth.passkey.stat_totp_count', 'Authenticator apps enabled')}
                value={stats.totp_count}
              />
              <AdminStatCard
                icon={<TrendingUp />}
                tone='warning'
                label={t('auth.passkey.stat_adoption_rate', 'Adoption rate')}
                value={`${Math.round(stats.adoption_rate)}%`}
              />
            </Box>

            <Card variant='outlined' sx={{ borderRadius: 3, borderColor: 'divider' }}>
              <CardContent>
                <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 3 }}>
                  {t('auth.passkey.adoption_trend', 'Daily challenge volume')}
                </Typography>

                {trend.points.length === 0 ? (
                  <Typography variant='body2' color='text.secondary'>
                    {t('auth.passkey.no_trend_data', 'No challenges recorded in this window.')}
                  </Typography>
                ) : (
                  <>
                    <Stack
                      direction='row'
                      alignItems='flex-end'
                      spacing={1}
                      sx={{ height: 140, mb: 1 }}
                    >
                      {trend.points.map((point) => (
                        <Box
                          key={point.date}
                          role='img'
                          aria-label={t('auth.passkey.trend_point', {
                            date: point.date,
                            count: point.count,
                            defaultValue: '{{date}}: {{count}} challenges',
                          })}
                          sx={{
                            flex: 1,
                            height: `${Math.max(4, (point.count / trend.max) * 100)}%`,
                            borderRadius: '4px 4px 0 0',
                            bgcolor: alpha(theme.palette.primary.main, 0.55),
                          }}
                        />
                      ))}
                    </Stack>
                    <Stack direction='row' justifyContent='space-between'>
                      <Typography variant='caption' color='text.disabled'>
                        {trend.points[0]?.date}
                      </Typography>
                      <Typography variant='caption' color='text.disabled'>
                        {trend.points[trend.points.length - 1]?.date}
                      </Typography>
                    </Stack>
                  </>
                )}
              </CardContent>
            </Card>

            <Stack alignItems='flex-start' sx={{ mt: 3 }}>
              <Button
                variant='outlined'
                endIcon={<ArrowForward fontSize='small' />}
                onClick={() => navigate(PlatformClusterPath.monitor.mfa_analytics)}
                sx={{ minHeight: 44, fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
              >
                {t('auth.passkey.view_full_analytics', 'View full MFA analytics')}
              </Button>
            </Stack>
          </>
        )}
      </AdminDataState>
    </Container>
  )
}
