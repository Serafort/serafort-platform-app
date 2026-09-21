import React from 'react'
import { Box, Button, ButtonBase, Divider, Skeleton, Stack, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import PeopleIcon from '@mui/icons-material/People'
import LockIcon from '@mui/icons-material/Lock'
import DevicesIcon from '@mui/icons-material/Devices'
import ShieldIcon from '@mui/icons-material/Shield'
import GavelIcon from '@mui/icons-material/Gavel'
import BoltIcon from '@mui/icons-material/Bolt'
import InsightsIcon from '@mui/icons-material/Insights'
import DonutLargeIcon from '@mui/icons-material/DonutLarge'
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import { useAdminDashboard } from '@auth/authorization-engine/hooks/useAdminQuery'
import { Path } from '@cap/module-auth/routes/path'
import {
  AdminPageHeader,
  AdminStatCard,
  AdminEmptyState,
  AdminStatusBadge,
  type AdminStatusTone,
} from '@auth/modules/authentication-core/components/shared/admin'
import type { AuthTone } from '@auth/modules/authentication-core/components/shared/auth/authTone'
import { useLiveAdminOverview, type LiveStatus } from '../../hooks/useLiveAdminOverview'
import { useAdminTrendsQuery } from '../../hooks/useAdminMonitoringQuery'
import { NextChevronIcon } from '../../components/common/DirectionalIcon'
import {
  BarStrip,
  ClusterPanel,
  DonutChart,
  MeterBar,
  formatBucketDate,
} from '../../components/common/ClusterUI'

/** The `/admin/dashboard` summary the overview tiles read from. */
interface AdminDashboardStats {
  systemHealth: string
  totalUsers: number
  activeUsers: number
  activeSessions: number
  newSignups: number
  failedLogins: number
  mfaAdoption: number | string
  totalBanned: number
  newBans: number
  pendingAppeals: number
}

const DASHBOARD_QUERY_KEY = ['admin', 'dashboard'] as const

// ─── Trend normalisation ─────────────────────────────────────────────────────
// `/api/admin/statistics/trends` answers with per-metric daily series
// (`{ logins: [{ date, count }], signups: [...] }`); the shared hook types it as
// a flat row list. Accept both so the chart follows whichever the service
// really returns rather than rendering nothing.
interface DailyCount {
  date: string
  count: number
}
interface TrendBuckets {
  labels: string[]
  logins: number[]
  signups: number[]
}

const dayKey = (iso: string): string => iso.slice(0, 10)

const normaliseTrends = (raw: unknown): TrendBuckets => {
  const empty: TrendBuckets = { labels: [], logins: [], signups: [] }
  if (!raw) return empty
  const days = new Map<string, { logins: number; signups: number }>()
  const bump = (iso: string, field: 'logins' | 'signups', n: number) => {
    const k = dayKey(iso)
    const row = days.get(k) ?? { logins: 0, signups: 0 }
    row[field] += Number.isFinite(n) ? n : 0
    days.set(k, row)
  }
  if (Array.isArray(raw)) {
    for (const p of raw as Array<{ timestamp?: string; signIns?: number; newUsers?: number }>) {
      if (p.timestamp) {
        bump(p.timestamp, 'logins', p.signIns ?? 0)
        bump(p.timestamp, 'signups', p.newUsers ?? 0)
      }
    }
  } else if (typeof raw === 'object') {
    const obj = raw as { logins?: DailyCount[]; signups?: DailyCount[] }
    for (const p of obj.logins ?? []) bump(p.date, 'logins', p.count)
    for (const p of obj.signups ?? []) bump(p.date, 'signups', p.count)
  }
  const keys = [...days.keys()].sort()
  return {
    labels: keys,
    logins: keys.map((k) => days.get(k)?.logins ?? 0),
    signups: keys.map((k) => days.get(k)?.signups ?? 0),
  }
}

// ─── Linked stat tile ────────────────────────────────────────────────────────
interface LinkedStatProps {
  label: string
  value: string
  icon: React.ReactNode
  tone: AuthTone
  href: string
  caption?: string
}

/** A kit stat tile that is also a navigation target (whole tile is one link). */
const LinkedStat: React.FC<LinkedStatProps> = ({ label, value, icon, tone, href, caption }) => (
  <ButtonBase
    component={RouterLink}
    to={href}
    sx={{
      display: 'block',
      textAlign: 'start',
      borderRadius: 'var(--sf-radius-lg, 12px)',
      '&.Mui-focusVisible': {
        outline: '2px solid var(--sf-cyan, currentColor)',
        outlineOffset: 2,
      },
    }}
  >
    <AdminStatCard label={label} value={value} icon={icon} tone={tone} caption={caption} />
  </ButtonBase>
)

// ─── Health / live badges ────────────────────────────────────────────────────
const HealthBadge: React.FC<{ value: string }> = ({ value }) => {
  const { t } = useTranslation('common')
  const lower = value?.toLowerCase() ?? ''
  const tone: AdminStatusTone =
    lower === 'healthy' ? 'success' : lower === 'degraded' ? 'warning' : 'neutral'
  const label =
    lower === 'healthy'
      ? t('monitoring.dashboard.status_healthy', 'Healthy')
      : lower === 'degraded'
        ? t('monitoring.dashboard.status_degraded', 'Degraded')
        : lower || t('monitoring.overview.status_unknown', 'Unknown')
  return <AdminStatusBadge tone={tone} label={label} />
}

const LiveBadge: React.FC<{ status: LiveStatus; label: string }> = ({ status, label }) => (
  <AdminStatusBadge
    tone={status === 'live' ? 'success' : 'neutral'}
    label={label}
    sx={{
      '& .dot': {
        animation: status === 'live' ? 'sf-live-pulse 1.8s ease-in-out infinite' : 'none',
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        '@keyframes sf-live-pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.35 } },
      },
    }}
  />
)

// ─── Quick-action row ────────────────────────────────────────────────────────
const QuickAction: React.FC<{ label: string; description: string; href: string }> = ({
  label,
  description,
  href,
}) => (
  <ButtonBase
    component={RouterLink}
    to={href}
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      textAlign: 'start',
      width: '100%',
      px: 1.5,
      py: 1.5,
      minHeight: 56,
      borderRadius: 'var(--sf-radius-md, 8px)',
      transition: 'background-color var(--sf-duration-fast, 120ms) var(--sf-ease-standard, ease)',
      '&:hover': { bgcolor: 'var(--sf-surface-sunken, transparent)' },
      '&.Mui-focusVisible': {
        outline: '2px solid var(--sf-cyan, currentColor)',
        outlineOffset: -2,
      },
      '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
    }}
  >
    <Box sx={{ minInlineSize: 0 }}>
      <Typography component='span' sx={{ display: 'block', fontSize: 'var(--sf-text-base, 0.875rem)', fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography
        component='span'
        sx={{ display: 'block', fontSize: 'var(--sf-text-xs, 0.75rem)', color: 'text.secondary' }}
      >
        {description}
      </Typography>
    </Box>
    <NextChevronIcon aria-hidden fontSize='small' sx={{ color: 'text.disabled' }} />
  </ButtonBase>
)

// ─── Loading skeleton ────────────────────────────────────────────────────────
const OverviewSkeleton: React.FC = () => (
  <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }} aria-busy='true'>
    <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 4 }}>
      <Skeleton variant='rounded' width={60} height={60} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant='text' width='40%' height={36} />
        <Skeleton variant='text' width='25%' />
      </Box>
    </Stack>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 4,
      }}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} variant='rounded' height={96} />
      ))}
    </Box>
    <Skeleton variant='rounded' height={280} />
  </Box>
)

// ─── Main screen ─────────────────────────────────────────────────────────────
const AdminOverviewDashboard: React.FC = () => {
  const theme = useTheme()
  const { t, i18n } = useTranslation('common')

  const { data, isLoading, isError, refetch, isFetching } = useAdminDashboard()
  const stats = (data as { data?: AdminDashboardStats } | undefined)?.data
  const trendsQuery = useAdminTrendsQuery('7d')
  const trends = React.useMemo(() => normaliseTrends(trendsQuery.data), [trendsQuery.data])

  // Figures follow the audit event stream instead of the five-minute cache
  // they used to sit behind — see useLiveAdminOverview.
  const { status: liveStatus } = useLiveAdminOverview(DASHBOARD_QUERY_KEY)

  if (isLoading) return <OverviewSkeleton />

  const header = (
    <AdminPageHeader
      icon={<HealthAndSafetyIcon />}
      title={t('monitoring.overview.title', 'Admin overview')}
      description={
        <Box
          component='span'
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
        >
          <span>{t('monitoring.overview.system_health', 'System health')}</span>
          {stats && <HealthBadge value={stats.systemHealth} />}
          <LiveBadge
            status={liveStatus}
            label={
              liveStatus === 'live'
                ? t('monitoring.dashboard.stream_live', 'Live')
                : t('monitoring.dashboard.stream_offline', 'Not live')
            }
          />
        </Box>
      }
      actions={
        <Button
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
          disabled={isFetching}
          variant='outlined'
          sx={{ textTransform: 'none', fontWeight: 600, minHeight: 44 }}
        >
          {isFetching
            ? t('monitoring.dashboard.refreshing', 'Refreshing…')
            : t('monitoring.overview.refresh', 'Refresh')}
        </Button>
      }
    />
  )

  // ── Error ────────────────────────────────────────────────────────────────
  // The raw query error is not surfaced: server messages are not user copy.
  if (isError || !stats) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        {header}
        <AdminEmptyState
          variant='error'
          title={t('monitoring.overview.error_title', 'The overview could not be loaded')}
          description={t(
            'monitoring.overview.error_load',
            'The admin overview could not be loaded. Retry, or check back shortly.',
          )}
          action={
            <Button
              variant='outlined'
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
              sx={{ minHeight: 44, textTransform: 'none', fontWeight: 600 }}
            >
              {t('monitoring.dashboard.retry_button', 'Retry')}
            </Button>
          }
        />
      </Box>
    )
  }

  const pendingAppeals = stats.pendingAppeals
  const mfaPct = Number.parseFloat(String(stats.mfaAdoption)) || 0
  const inactive = Math.max(0, stats.totalUsers - stats.activeUsers - stats.totalBanned)
  const hasTrend = trends.labels.length > 0

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {header}

      {/* ── KPI row (max four) ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        <LinkedStat
          label={t('monitoring.overview.stat_total_users', 'Total users')}
          value={stats.totalUsers.toLocaleString()}
          icon={<PeopleIcon />}
          tone='primary'
          href={Path.admin.users}
          caption={t('monitoring.overview.stat_active_of', '{{count}} active', {
            count: stats.activeUsers,
          })}
        />
        <LinkedStat
          label={t('monitoring.overview.stat_active_sessions', 'Active sessions')}
          value={stats.activeSessions.toLocaleString()}
          icon={<DevicesIcon />}
          tone='info'
          href={Path.admin.events}
        />
        <LinkedStat
          label={t('monitoring.overview.stat_failed_logins', 'Failed logins')}
          value={stats.failedLogins.toLocaleString()}
          icon={<LockIcon />}
          tone={stats.failedLogins > 50 ? 'error' : 'warning'}
          href={Path.admin.events}
        />
        <LinkedStat
          label={t('monitoring.overview.stat_mfa_adoption', 'MFA adoption')}
          value={`${Math.round(mfaPct)}%`}
          icon={<ShieldIcon />}
          tone='success'
          href={Path.monitoring.mfa_analytics}
        />
      </Box>

      {/* ── Data row ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' },
          gap: 3,
          mb: 3,
        }}
      >
        <ClusterPanel
          icon={<InsightsIcon fontSize='small' />}
          title={t('monitoring.overview.trend_title', 'Sign-in activity')}
          subtitle={t('monitoring.overview.trend_subtitle', 'Sign-ins and new accounts, last 7 days')}
        >
          {trendsQuery.isLoading ? (
            <Skeleton variant='rounded' height={200} aria-busy='true' />
          ) : trendsQuery.isError ? (
            <AdminEmptyState
              variant='error'
              title={t('monitoring.overview.trend_error', 'Activity could not be loaded')}
              action={
                <Button
                  variant='outlined'
                  onClick={() => trendsQuery.refetch()}
                  sx={{ minHeight: 44, textTransform: 'none', fontWeight: 600 }}
                >
                  {t('monitoring.dashboard.retry_button', 'Retry')}
                </Button>
              }
            />
          ) : !hasTrend ? (
            <AdminEmptyState
              icon={<InsightsIcon sx={{ fontSize: 32 }} />}
              title={t('monitoring.overview.trend_empty_title', 'No activity yet')}
              description={t(
                'monitoring.overview.trend_empty',
                'Sign-ins and sign-ups will chart here as soon as people use the platform.',
              )}
            />
          ) : (
            <BarStrip
              ariaLabel={t('monitoring.overview.trend_aria', 'Daily sign-ins and new accounts over the last 7 days')}
              labels={trends.labels.map((d) => formatBucketDate(d, i18n.language))}
              series={[
                {
                  key: 'logins',
                  label: t('monitoring.overview.trend_logins', 'Sign-ins'),
                  tone: 'primary',
                  values: trends.logins,
                },
                {
                  key: 'signups',
                  label: t('monitoring.overview.trend_signups', 'New accounts'),
                  tone: 'success',
                  values: trends.signups,
                },
              ]}
            />
          )}
        </ClusterPanel>

        <ClusterPanel
          icon={<DonutLargeIcon fontSize='small' />}
          title={t('monitoring.overview.userbase_title', 'User base')}
          subtitle={t('monitoring.overview.userbase_subtitle', 'Account status across the platform')}
        >
          <Stack spacing={3}>
            <DonutChart
              ariaLabel={t('monitoring.overview.userbase_aria', 'Users by status: active, inactive and banned')}
              centerValue={stats.totalUsers.toLocaleString()}
              centerLabel={t('monitoring.overview.userbase_total', 'Users')}
              segments={[
                {
                  key: 'active',
                  label: t('monitoring.overview.userbase_active', 'Active'),
                  value: stats.activeUsers,
                  tone: 'success',
                },
                {
                  key: 'inactive',
                  label: t('monitoring.overview.userbase_inactive', 'Inactive'),
                  value: inactive,
                  tone: 'neutral',
                },
                {
                  key: 'banned',
                  label: t('monitoring.overview.userbase_banned', 'Banned'),
                  value: stats.totalBanned,
                  tone: 'error',
                },
              ]}
            />
            <MeterBar
              value={mfaPct}
              tone='success'
              label={t('monitoring.overview.stat_mfa_adoption', 'MFA adoption')}
            />
          </Stack>
        </ClusterPanel>
      </Box>

      {/* ── Bottom row ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          alignItems: 'start',
          gap: 3,
        }}
      >
        <ClusterPanel
          icon={<GavelIcon fontSize='small' />}
          title={t('monitoring.overview.bans_title', 'Bans & appeals')}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
            {[
              {
                label: t('monitoring.overview.total_banned', 'Total banned'),
                value: stats.totalBanned,
                dot: theme.palette.error.main,
              },
              {
                label: t('monitoring.overview.new_bans', 'New bans'),
                value: stats.newBans,
                dot: theme.palette.warning.main,
              },
              {
                label: t('monitoring.overview.pending_appeals', 'Pending appeals'),
                value: pendingAppeals,
                dot: theme.palette.info.main,
              },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  p: 2,
                  borderRadius: 'var(--sf-radius-md, 8px)',
                  bgcolor: 'var(--sf-surface-sunken, transparent)',
                  borderInlineStart: `3px solid ${alpha(item.dot, 0.9)}`,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: 'var(--sf-font-display, inherit)',
                    fontSize: 'var(--sf-text-2xl, 1.875rem)',
                    fontWeight: 700,
                    lineHeight: 1.1,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {item.value.toLocaleString()}
                </Typography>
                <Typography sx={{ fontSize: 'var(--sf-text-xs, 0.75rem)', color: 'text.secondary', mt: 0.5 }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {pendingAppeals > 0 && (
            <Stack
              role='status'
              direction='row'
              alignItems='center'
              justifyContent='space-between'
              spacing={2}
              sx={{
                mt: 2,
                p: 1.5,
                paddingInlineStart: 2,
                borderRadius: 'var(--sf-radius-md, 8px)',
                border: '1px solid var(--sf-warning-border)',
                bgcolor: 'var(--sf-warning-bg)',
                color: 'var(--sf-warning-text)',
              }}
            >
              <Typography sx={{ fontSize: 'var(--sf-text-sm, 0.8125rem)', fontWeight: 600 }}>
                {t('monitoring.overview.appeals_waiting', 'Appeals awaiting review: {{count}}', {
                  count: pendingAppeals,
                })}
              </Typography>
              <Button
                component={RouterLink}
                to={Path.admin.banManagement}
                color='inherit'
                sx={{ fontWeight: 700, whiteSpace: 'nowrap', minHeight: 44, textTransform: 'none' }}
              >
                {t('monitoring.overview.review', 'Review')}
              </Button>
            </Stack>
          )}
        </ClusterPanel>

        <ClusterPanel
          icon={<BoltIcon fontSize='small' />}
          title={t('monitoring.overview.quick_actions', 'Quick actions')}
        >
          <Stack divider={<Divider sx={{ opacity: 0.6 }} />} sx={{ mx: -1.5, mt: -1 }}>
            <QuickAction
              label={t('monitoring.overview.qa_users', 'User management')}
              description={t('monitoring.overview.qa_users_desc', 'View, edit, ban, and impersonate users')}
              href={Path.admin.users}
            />
            <QuickAction
              label={t('monitoring.overview.qa_roles', 'Roles & permissions')}
              description={t('monitoring.overview.qa_roles_desc', 'Manage RBAC roles and access policies')}
              href={Path.admin.roles}
            />
            <QuickAction
              label={t('monitoring.overview.qa_audit', 'Audit trail')}
              description={t('monitoring.overview.qa_audit_desc', 'Export and review security audit logs')}
              href={Path.admin.exportAudit}
            />
            <QuickAction
              label={t('monitoring.overview.qa_health', 'System health')}
              description={t('monitoring.overview.qa_health_desc', 'Check dependencies, uptime, and metrics')}
              href={Path.admin.health}
            />
            <QuickAction
              label={t('monitoring.overview.qa_events', 'Auth events')}
              description={t('monitoring.overview.qa_events_desc', 'Real-time login and MFA event stream')}
              href={Path.admin.events}
            />
          </Stack>
        </ClusterPanel>
      </Box>
    </Box>
  )
}

export default AdminOverviewDashboard
