import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Stack,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import PeopleIcon from '@mui/icons-material/People'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import LockIcon from '@mui/icons-material/Lock'
import DevicesIcon from '@mui/icons-material/Devices'
import ShieldIcon from '@mui/icons-material/Shield'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import GavelIcon from '@mui/icons-material/Gavel'
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety'
import RefreshIcon from '@mui/icons-material/Refresh'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAdminDashboard } from '@idaas/authentication-core/hooks/useAdminQuery'
import { Path } from '@cap/module-auth/routes/path'

// ─── Stat card shape ────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  color: 'primary' | 'success' | 'error' | 'warning' | 'info'
  href?: string
  onClick?: () => void
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, href, onClick }) => {
  const theme = useTheme()
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) onClick()
    else if (href) navigate(href)
  }

  return (
    <Card
      onClick={handleClick}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        borderRadius: 4,
        cursor: href || onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': href || onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 20px ${alpha(theme.palette[color].main, 0.12)}`,
            }
          : undefined,
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 3 }}>
        <Avatar
          sx={{
            width: 52,
            height: 52,
            borderRadius: '14px',
            bgcolor: alpha(theme.palette[color].main, 0.1),
            color: `${color}.main`,
          }}
        >
          {icon}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              fontSize: '0.65rem',
              display: 'block',
              mb: 0.25,
            }}
          >
            {label}
          </Typography>
          <Typography variant='h5' sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
            {value}
          </Typography>
        </Box>
        {(href || onClick) && (
          <ChevronRightIcon sx={{ color: 'text.disabled', flexShrink: 0 }} />
        )}
      </CardContent>
    </Card>
  )
}

// ─── Health badge ────────────────────────────────────────────────────────────
const HealthBadge: React.FC<{ value: string }> = ({ value }) => {
  const theme = useTheme()
  const lower = value?.toLowerCase() ?? ''

  const config =
    lower === 'healthy'
      ? { label: 'Healthy', color: theme.palette.success.main }
      : lower === 'degraded'
        ? { label: 'Degraded', color: theme.palette.warning.main }
        : { label: lower || 'Unknown', color: theme.palette.text.disabled }

  return (
    <Chip
      label={config.label}
      size='small'
      sx={{
        fontWeight: 800,
        fontSize: '0.7rem',
        bgcolor: alpha(config.color, 0.1),
        color: config.color,
        border: `1px solid ${alpha(config.color, 0.25)}`,
        height: 24,
        borderRadius: 1.5,
      }}
    />
  )
}

// ─── Quick-action row ────────────────────────────────────────────────────────
interface QuickActionProps {
  label: string
  description: string
  href: string
}

const QuickAction: React.FC<QuickActionProps> = ({ label, description, href }) => {
  const navigate = useNavigate()
  return (
    <Box
      onClick={() => navigate(href)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2.5,
        py: 2,
        cursor: 'pointer',
        borderRadius: 2,
        transition: 'background 0.15s',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Box>
        <Typography variant='body2' fontWeight={700}>
          {label}
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          {description}
        </Typography>
      </Box>
      <ChevronRightIcon sx={{ color: 'text.disabled' }} />
    </Box>
  )
}

// ─── Main screen ─────────────────────────────────────────────────────────────
const AdminOverviewDashboard: React.FC = () => {
  const theme = useTheme()
  const { t: _t } = useTranslation('common')
  const navigate = useNavigate()

  const { data, isLoading, isError, error, refetch, isFetching } = useAdminDashboard()
  const stats = data?.data

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography color='text.secondary' variant='body2'>
          Loading dashboard…
        </Typography>
      </Box>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (isError || !stats) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert
          severity='error'
          action={
            <Button size='small' color='inherit' onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {error?.message ?? 'Failed to load admin dashboard.'}
        </Alert>
      </Box>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>

      {/* ── Page header ── */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: { xs: 52, md: 60 },
              height: { xs: 52, md: 60 },
              borderRadius: '18px',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
            }}
          >
            <HealthAndSafetyIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography
              variant='h4'
              sx={{ fontWeight: 900, letterSpacing: '-0.027em', lineHeight: 1.1, mb: 0.5 }}
            >
              Admin overview
            </Typography>
            <Stack direction='row' spacing={1} alignItems='center'>
              <Typography variant='body2' color='text.secondary'>
                System health:
              </Typography>
              <HealthBadge value={stats.systemHealth} />
            </Stack>
          </Box>
        </Box>

        <Button
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
          disabled={isFetching}
          variant='outlined'
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, height: 40 }}
        >
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </Button>
      </Box>

      {/* ── Primary stat grid ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        <StatCard
          label='Total users'
          value={stats.totalUsers.toLocaleString()}
          icon={<PeopleIcon />}
          color='primary'
          href={Path.admin.users}
        />
        <StatCard
          label='Active users'
          value={stats.activeUsers.toLocaleString()}
          icon={<PersonAddIcon />}
          color='success'
          href={Path.admin.users}
        />
        <StatCard
          label='Active sessions'
          value={stats.activeSessions.toLocaleString()}
          icon={<DevicesIcon />}
          color='info'
        />
        <StatCard
          label='New signups'
          value={stats.newSignups.toLocaleString()}
          icon={<PersonAddIcon />}
          color='info'
        />
        <StatCard
          label='Failed logins'
          value={stats.failedLogins.toLocaleString()}
          icon={<LockIcon />}
          color={stats.failedLogins > 50 ? 'error' : 'warning'}
          href={Path.admin.events}
        />
        <StatCard
          label='MFA adoption'
          value={stats.mfaAdoption}
          icon={<ShieldIcon />}
          color='success'
          href={Path.monitoring.mfa_analytics}
        />
      </Box>

      {/* ── Bottom two-column row ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3,
        }}
      >

        {/* Bans & appeals card */}
        <Card
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 3, pb: '16px !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: 'error.main',
                }}
              >
                <GavelIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant='subtitle1' fontWeight={800}>
                Bans &amp; appeals
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 2,
                mb: 2,
              }}
            >
              {[
                { label: 'Total banned', value: stats.totalBanned, color: theme.palette.error.main },
                { label: 'New bans', value: stats.newBans, color: theme.palette.warning.main },
                { label: 'Pending appeals', value: stats.pendingAppeals, color: theme.palette.info.main },
              ].map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    textAlign: 'center',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(item.color, 0.06),
                    border: `1px solid ${alpha(item.color, 0.15)}`,
                  }}
                >
                  <Typography
                    variant='h5'
                    fontWeight={900}
                    sx={{ color: item.color, letterSpacing: '-0.02em' }}
                  >
                    {item.value}
                  </Typography>
                  <Typography variant='caption' color='text.secondary' fontWeight={600}>
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            {stats.pendingAppeals > 0 && (
              <Alert
                severity='warning'
                icon={<WarningAmberIcon fontSize='small' />}
                sx={{ borderRadius: 2, fontSize: '0.8rem' }}
                action={
                  <Button
                    size='small'
                    color='inherit'
                    onClick={() => navigate(Path.admin.banManagement)}
                    sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                  >
                    Review
                  </Button>
                }
              >
                {stats.pendingAppeals} appeal{stats.pendingAppeals !== 1 ? 's' : ''} awaiting review
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Quick actions card */}
        <Card
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 3, pb: '16px !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                }}
              >
                <PersonOffIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant='subtitle1' fontWeight={800}>
                Quick actions
              </Typography>
            </Box>

            <Stack divider={<Divider sx={{ opacity: 0.5 }} />}>
              <QuickAction
                label='User management'
                description='View, edit, ban, and impersonate users'
                href={Path.admin.users}
              />
              <QuickAction
                label='Roles &amp; permissions'
                description='Manage RBAC roles and access policies'
                href={Path.admin.roles}
              />
              <QuickAction
                label='Audit trail'
                description='Export and review security audit logs'
                href={Path.admin.exportAudit}
              />
              <QuickAction
                label='System health'
                description='Check dependencies, uptime, and metrics'
                href={Path.admin.health}
              />
              <QuickAction
                label='Auth events'
                description='Real-time login and MFA event stream'
                href={Path.admin.events}
              />
            </Stack>
          </CardContent>
        </Card>

      </Box>
    </Box>
  )
}

export default AdminOverviewDashboard
