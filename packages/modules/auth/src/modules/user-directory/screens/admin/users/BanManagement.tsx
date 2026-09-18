import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Avatar,
  IconButton,
  useTheme,
  alpha,
  Alert,
  Divider,
  Stack,
  Tab,
  Tabs,
  TextField,
  InputAdornment,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
} from '@mui/material'
import Gavel from '@mui/icons-material/Gavel'
import History from '@mui/icons-material/History'
import MoreVert from '@mui/icons-material/MoreVert'
import Block from '@mui/icons-material/Block'
import Undo from '@mui/icons-material/Undo'
import Search from '@mui/icons-material/Search'
import Flag from '@mui/icons-material/Flag'
import Security from '@mui/icons-material/Security'
import Edit from '@mui/icons-material/Edit'
import ArrowBack from '@mui/icons-material/ArrowBack'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AdminUser } from '@idaas/authentication-core/hooks/useAdminQuery'
import { useTranslation } from 'react-i18next'
import {
  useUsers,
  useUnbanUser,
  useAuditLogs,
  useAdminDashboard,
  useAppeals,
  useResolveAppeal,
} from '@idaas/authentication-core/hooks/useAdminQuery'
import { toast } from 'react-toastify'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'
import Path from '../../path'
import IssueBanDialog from '../../../components/IssueBanDialog'

export default function BanManagement() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [isBanModalOpen, setIsBanModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [page, setPage] = useState(1)
  const { data: dashboardData } = useAdminDashboard()

  const {
    data: bannedUsersData,
    isLoading,
    refetch,
  } = useUsers({
    status: 'SUSPENDED',
    search: searchQuery,
    page,
  })

  const unbanMutation = useUnbanUser({
    onSuccess: () => {
      toast.success(t('auth.admin.userUnbannedSuccess'))
      refetch()
    },
    onError: (error: any) => {
      toast.error(error.message || t('auth.common.errorOccurred'))
    },
  })

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleRevokeBan = (userId: string | number) => {
    unbanMutation.mutate(Number(userId))
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}
    >
      {/* Back button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(Path.admin.users.list)}
        sx={{
          mb: 2.5,
          textTransform: 'none',
          fontWeight: 700,
          color: 'text.secondary',
          minHeight: 44,
          borderRadius: 'var(--sf-radius-md, 8px)',
          '&:hover': { color: 'primary.main', bgcolor: 'transparent' },
        }}
      >
        Back to User Directory
      </Button>

      {/* Header */}
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              borderRadius: 'var(--sf-radius-lg, 24px)',
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.12),
              color: 'error.main',
              boxShadow: (theme) => `0 12px 24px ${alpha(theme.palette.error.main, 0.18)}`,
            }}
          >
            <Gavel sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant='h4' sx={{ fontWeight: 800, letterSpacing: '-0.027em' }}>
              {t('auth.admin.banManagementTitle')}
            </Typography>
            <Typography variant='body1' color='text.secondary' sx={{ fontWeight: 500 }}>
              {t('auth.admin.banManagementSubtitle')}
            </Typography>
          </Box>
        </Box>
        <Button
          variant='contained'
          color='error'
          startIcon={<Gavel />}
          onClick={() => setIsBanModalOpen(true)}
          sx={{
            minHeight: 44,
            px: 3,
            borderRadius: 'var(--sf-radius-md, 8px)',
            fontWeight: 800,
            textTransform: 'none',
            boxShadow: (theme) => `0 4px 14px 0 ${alpha(theme.palette.error.main, 0.35)}`,
          }}
        >
          {t('auth.admin.issueBan', 'Issue Account Suspension / Ban')}
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            label: t('auth.admin.statTotalActiveBans'),
            value: dashboardData?.data?.totalBanned ?? '...',
            icon: <Block />,
            color: 'error',
          },
          {
            label: t('auth.admin.statNewBansToday'),
            value: dashboardData?.data?.newBans ?? '...',
            icon: <Gavel />,
            color: 'warning',
          },
          {
            label: t('auth.admin.statAppealsPending'),
            value:
              dashboardData?.data?.pendingAppeals === 0
                ? '—'
                : (dashboardData?.data?.pendingAppeals ?? '...'),
            tooltip:
              dashboardData?.data?.pendingAppeals === 0
                ? t('auth.admin.appealTrackingNotImplemented')
                : undefined,
            icon: <History />,
            color: 'info',
          },
        ].map((stat, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 4 }}>
            <Card
              sx={(theme: any) => ({
                borderRadius: 'var(--sf-radius-lg, 16px)',
                bgcolor: alpha((theme.palette as any)[stat.color].main, 0.04),
                border: '1px solid ' + alpha((theme.palette as any)[stat.color].main, 0.1),
                ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
              })}
            >
              <CardContent>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Box>
                    <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
                      {stat.label}
                    </Typography>
                    {(stat as any).tooltip ? (
                      <Tooltip title={(stat as any).tooltip}>
                        <Typography variant='h4' sx={{ fontWeight: 800, mt: 0.5, cursor: 'help' }}>
                          {stat.value}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography variant='h4' sx={{ fontWeight: 800, mt: 0.5 }}>
                        {stat.value}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ color: (theme.palette as any)[stat.color].main }}>{stat.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Area */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ minHeight: 48, '& .MuiTab-root': { minHeight: 48, textTransform: 'none', fontWeight: 600 } }}
        >
          <Tab label={t('auth.admin.activeBans')} />
          <Tab label={t('auth.admin.appealsQueue')} />
          <Tab label={t('auth.admin.banHistory')} />
        </Tabs>
      </Box>

      {/* Active Bans Section */}
      {tabValue === 0 && (
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder={t('auth.common.searchUsers')}
              size='small'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Search fontSize='small' sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 'var(--sf-radius-md, 8px)', minHeight: 44 },
                },
              }}
              sx={{ width: 300 }}
            />
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant='contained'
              color='error'
              startIcon={<Gavel />}
              onClick={() => setIsBanModalOpen(true)}
              sx={{
                minHeight: 44,
                px: 3,
                borderRadius: 'var(--sf-radius-md, 8px)',
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: (theme) => `0 4px 14px 0 ${alpha(theme.palette.error.main, 0.35)}`,
                '&:hover': {
                  boxShadow: (theme) => `0 6px 20px 0 ${alpha(theme.palette.error.main, 0.5)}`,
                },
              }}
            >
              {t('auth.admin.issueBan', 'Issue Account Suspension / Ban')}
            </Button>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography>{t('auth.common.loading')}</Typography>
            </Box>
          ) : !bannedUsersData?.data?.data?.length ? (
            <Alert
              severity='info'
              sx={(theme: any) => ({
                ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
              })}
            >
              {t('auth.admin.noBannedUsers')}
            </Alert>
          ) : (
            bannedUsersData.data.data.map((user: AdminUser) => (
              <Card
                key={user.id}
                sx={(theme: any) => ({
                  borderRadius: 'var(--sf-radius-lg, 16px)',
                  border: '1px solid ' + theme.palette.divider,
                  transition: 'border-color 0.2s',
                  '&:hover': { borderColor: 'error.light' },
                  ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
                })}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      p: 3,
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      gap: 3,
                    }}
                  >
                    {/* User Profile Info */}
                    <Box sx={{ width: { md: 240 }, flexShrink: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 'var(--sf-radius-md, 8px)',
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            color: 'error.main',
                          }}
                        >
                          {user.firstName?.[0] || user.email[0]}
                        </Avatar>
                        <Box>
                          <Typography variant='body1' sx={{ fontWeight: 700 }}>
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Divider
                      orientation='vertical'
                      flexItem
                      sx={{ display: { xs: 'none', md: 'block' } }}
                    />

                    {/* Ban Details */}
                    <Box sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 2,
                        }}
                      >
                        <Box>
                          <Typography
                            variant='body2'
                            sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}
                          >
                            <Security fontSize='small' color='error' />
                            {t('auth.admin.banStatus')}
                          </Typography>
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ mt: 1, fontStyle: 'italic' }}
                          >
                            {t('auth.admin.userIsSuspended')}
                          </Typography>
                        </Box>
                        <Chip
                          label={t('auth.admin.suspended')}
                          size='small'
                          color='error'
                          sx={{ fontWeight: 700, borderRadius: 'var(--sf-radius-xs, 4px)' }}
                        />
                      </Box>
                      {(user as any).suspendedReason && (
                        <Typography
                          variant='caption'
                          color='error.main'
                          sx={{ display: 'block', mb: 1, mt: -1 }}
                        >
                          {/* i18n: auth.admin.banReason */}
                          {t('auth.admin.banReason')}: {(user as any).suspendedReason}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                        <Box>
                          <Typography variant='caption' color='text.secondary' display='block'>
                            {t('auth.common.createdAt')}
                          </Typography>
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Actions — Serial Position Effect: Primary (Edit) -> Action (Revoke Ban) */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { md: 'column' },
                        gap: 1.5,
                        minWidth: 130,
                      }}
                    >
                      <Button
                        variant='outlined'
                        size='small'
                        startIcon={<Edit />}
                        onClick={() => setEditingUser(user as AdminUser)}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          minHeight: 40,
                          borderRadius: 'var(--sf-radius-md, 8px)',
                        }}
                      >
                        {t('auth.common.edit', 'Edit Profile')}
                      </Button>
                      <Button
                        variant='outlined'
                        color='warning'
                        size='small'
                        startIcon={<Undo />}
                        onClick={() => handleRevokeBan(user.id)}
                        disabled={unbanMutation.isPending}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          minHeight: 40,
                          borderRadius: 'var(--sf-radius-md, 8px)',
                        }}
                      >
                        {t('auth.admin.revokeBan', 'Lift Ban')}
                      </Button>
                      <Box sx={{ flexGrow: 1 }} />
                      <IconButton
                        size='small'
                        aria-label='More options'
                        sx={{
                          alignSelf: 'flex-end',
                          width: 44,
                          height: 44,
                          minWidth: 44,
                          minHeight: 44,
                          borderRadius: 'var(--sf-radius-md, 8px)',
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
          {bannedUsersData?.data?.meta?.last_page && bannedUsersData.data.meta.last_page > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={bannedUsersData?.data?.meta?.last_page || 1}
                page={page}
                onChange={(_, val) => setPage(val)}
                color='primary'
              />
            </Box>
          )}
        </Stack>
      )}

      {/* Appeals Queue tab */}
      {tabValue === 1 && <AppealsQueue />}

      {/* Full History tab */}
      {tabValue === 2 && <BanFullHistory />}
      <IssueBanDialog
        open={isBanModalOpen}
        onClose={() => {
          setIsBanModalOpen(false)
          refetch()
        }}
      />
      <Dialog
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        slotProps={{
          paper: {
            sx: (theme: any) => ({
              borderRadius: 'var(--sf-radius-lg, 16px)',
              ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
            }),
          },
        }}
      >
        <DialogTitle>{t('auth.admin.editBan')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('auth.admin.editBan_stub')}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setEditingUser(null)}
            sx={{ minHeight: 44, px: 2.5, borderRadius: 'var(--sf-radius-md, 8px)', textTransform: 'none' }}
          >
            {t('auth.common.cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function AppealsQueue() {
  const { t } = useTranslation('common')
  const theme = useTheme()
  const [page, setPage] = useState(1)
  const { data, isLoading, refetch } = useAppeals()
  const [resolvingAppealId, setResolvingAppealId] = useState<number | null>(null)

  const resolveMutation = useResolveAppeal({
    onSuccess: (_: any, variables: any) => {
      toast.success(
        variables.action === 'approved'
          ? t('auth.admin.appealApproved')
          : t('auth.admin.appealDenied'),
        {},
      )
      refetch()
    },
    onError: (err: any) => {
      toast.error(err.message || t('auth.common.errorOccurred'), {})
    },
  })

  const appeals = data?.data?.data ?? []

  return (
    <Stack spacing={3} className='animate-scale-in'>
      <Alert
        severity='info'
        sx={(theme: any) => ({
          borderRadius: 'var(--sf-radius-md, 12px)',
          ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
        })}
      >
        {t('auth.admin.appealsInfo')}
      </Alert>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>{t('auth.common.loading')}</Typography>
        </Box>
      ) : appeals.length === 0 ? (
        <Alert
          severity='success'
          sx={(theme: any) => ({
            borderRadius: 'var(--sf-radius-md, 12px)',
            ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
          })}
        >
          {t('auth.admin.noAppeals')}
        </Alert>
      ) : (
        <Stack spacing={2}>
          {appeals.map((appeal: any) => (
            <Card
              key={appeal.id}
              sx={(theme: any) => ({
                borderRadius: 'var(--sf-radius-lg, 16px)',
                border: '1px solid ' + alpha(theme.palette.warning.main, 0.3),
                ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
              })}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 'var(--sf-radius-md, 8px)',
                        bgcolor: alpha(theme.palette.warning.main, 0.12),
                        color: 'warning.main',
                        fontWeight: 700,
                      }}
                    >
                      {appeal.user?.firstName?.[0] || appeal.user?.email[0] || '?'}
                    </Avatar>
                    <Box>
                      <Typography variant='body1' sx={{ fontWeight: 700 }}>
                        {appeal.user?.firstName} {appeal.user?.lastName}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {appeal.user?.email}
                      </Typography>
                      <Box
                        sx={{
                          mt: 1,
                          p: 1.5,
                          bgcolor: 'background.default',
                          borderRadius: 'var(--sf-radius-md, 8px)',
                          border: '1px solid ' + theme.palette.divider,
                        }}
                      >
                        <Typography variant='body2' sx={{ fontStyle: 'italic' }}>
                          &ldquo;{appeal.reason}&rdquo;
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {new Date(appeal.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {/* ── SYSTEM PATTERN: action_button ── */}
                    <Button
                      variant='contained'
                      color='success'
                      size='small'
                      startIcon={<Undo />}
                      onClick={() => resolveMutation.mutate({ id: appeal.id, action: 'approved' })}
                      disabled={resolveMutation.isPending}
                      sx={{
                        minHeight: 40,
                        px: 2,
                        borderRadius: 'var(--sf-radius-md, 8px)',
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      {t('auth.admin.approveAppeal')}
                    </Button>
                    <Button
                      variant='outlined'
                      color='error'
                      size='small'
                      startIcon={<Block />}
                      onClick={() => setResolvingAppealId(appeal.id)}
                      disabled={resolveMutation.isPending}
                      sx={{
                        minHeight: 40,
                        px: 2,
                        borderRadius: 'var(--sf-radius-md, 8px)',
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      {t('auth.admin.denyAppeal')}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
          {data?.data?.meta?.last_page && data.data.meta.last_page > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={data.data.meta.last_page}
                page={page}
                onChange={(_, val) => setPage(val)}
                color='primary'
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 'var(--sf-radius-xs, 4px)',
                  },
                }}
              />
            </Box>
          )}
        </Stack>
      )}

      <Dialog
        open={!!resolvingAppealId}
        onClose={() => setResolvingAppealId(null)}
        slotProps={{
          paper: {
            sx: (theme: any) => ({
              borderRadius: 'var(--sf-radius-lg, 16px)',
              ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
            }),
          },
        }}
      >
        <DialogTitle>{t('auth.admin.denyAppeal_confirm_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('auth.admin.denyAppeal_confirm_msg')}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setResolvingAppealId(null)}
            sx={{ minHeight: 44, px: 2.5, borderRadius: 'var(--sf-radius-md, 8px)', textTransform: 'none' }}
          >
            {t('auth.common.cancel')}
          </Button>
          <Button
            color='error'
            variant='contained'
            disabled={resolveMutation.isPending}
            sx={{
              minHeight: 44,
              px: 2.5,
              borderRadius: 'var(--sf-radius-md, 8px)',
              textTransform: 'none',
              fontWeight: 600,
            }}
            onClick={() => {
              if (resolvingAppealId) {
                resolveMutation.mutate(
                  { id: resolvingAppealId, action: 'rejected' },
                  {
                    onSettled: () => setResolvingAppealId(null),
                  },
                )
              }
            }}
          >
            {t('auth.admin.deny')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

function BanFullHistory() {
  const { t } = useTranslation('common')
  const theme = useTheme()
  const [search, setSearch] = useState('')
  const { data: suspendedData, isLoading: l1 } = useAuditLogs({
    action: 'USER_SUSPENDED',
    limit: 100,
  })
  const { data: activatedData, isLoading: l2 } = useAuditLogs({
    action: 'USER_ACTIVATED',
    limit: 100,
  })
  const isLoading = l1 || l2

  const rawLogs = [...(suspendedData?.data?.logs ?? []), ...(activatedData?.data?.logs ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
  const logs = search
    ? rawLogs.filter((l: any) => JSON.stringify(l).toLowerCase().includes(search.toLowerCase()))
    : rawLogs

  const handleExport = () => {
    const csv = [
      ['ID', 'Action', 'User ID', 'IP', 'Date'].join(','),
      ...rawLogs.map((l: any) =>
        [
          l.id,
          l.action,
          l.userId ?? '',
          l.ipAddress ?? '',
          `"${new Date(l.createdAt).toLocaleString()}"`,
        ].join(','),
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ban-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <Stack spacing={2} className='animate-scale-in'>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder={t('auth.admin.searchHistory')}
          size='small'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
            width: { xs: '100%', sm: 320 },
            '& .MuiOutlinedInput-root': {
              minHeight: 44,
              borderRadius: 'var(--sf-radius-md, 8px)',
            },
          }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant='outlined'
          size='small'
          onClick={handleExport}
          disabled={rawLogs.length === 0}
          sx={{
            minHeight: 44,
            px: 2.5,
            borderRadius: 'var(--sf-radius-md, 8px)',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {t('auth.common.export')}
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>{t('auth.common.loading')}</Typography>
        </Box>
      ) : logs.length === 0 ? (
        <Alert
          severity='info'
          sx={(theme: any) => ({
            borderRadius: 'var(--sf-radius-md, 12px)',
            ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
          })}
        >
          {t('auth.admin.noBanHistory')}
        </Alert>
      ) : (
        logs.map((log: any) => (
          <Card
            key={log.id}
            sx={(theme: any) => ({
              borderRadius: 'var(--sf-radius-md, 12px)',
              border: '1px solid ' + theme.palette.divider,
              ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
            })}
          >
            <CardContent sx={{ py: '12px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--sf-radius-xs, 4px)',
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    color: 'error.main',
                    fontSize: '0.875rem',
                  }}
                >
                  <Gavel fontSize='small' />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant='body2' sx={{ fontWeight: 700 }}>
                    {log.action?.replace(/_/g, ' ')}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    User #{log.userId} · {new Date(log.createdAt).toLocaleString()}
                    {log.ipAddress ? ` · IP: ${log.ipAddress}` : ''}
                  </Typography>
                </Box>
                <Chip
                  label={log.action?.includes('ACTIVATED') ? 'Unbanned' : 'Banned'}
                  size='small'
                  color={log.action?.includes('ACTIVATED') ? 'success' : 'error'}
                  sx={{ fontWeight: 700, borderRadius: 'var(--sf-radius-xs, 4px)' }}
                />
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Stack>
  )
}
