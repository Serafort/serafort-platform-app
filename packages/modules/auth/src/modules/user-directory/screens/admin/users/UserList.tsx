import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Pagination,
  alpha,
  useTheme,
  CircularProgress,
  Stack,
  Tooltip,
  Divider,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import GetAppIcon from '@mui/icons-material/GetApp'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import BlockIcon from '@mui/icons-material/Block'
import GroupIcon from '@mui/icons-material/Group'
import HistoryIcon from '@mui/icons-material/History'
import SecurityIcon from '@mui/icons-material/Security'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PersonIcon from '@mui/icons-material/Person'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import AddIcon from '@mui/icons-material/Add'

import CreateUserDialog from './CreateUserDialog'
import { ConfirmationDialog } from '@idaas/authentication-core/components/shared'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from 'use-debounce'
import { toast } from 'react-toastify';
import {
  useUsers,
  useBanUser,
  useDeleteUser,
  useImpersonateUser,
  useAdminDashboard,
  AdminUser,
} from '@idaas/authentication-core/hooks/useAdminQuery'
import { Path } from '@cap/module-auth/routes/path'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'

export default function UserList() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const theme = useTheme()
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    role: '',
  })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [confirmBanOpen, setConfirmBanOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [debouncedSearch] = useDebounce(searchParams.search, 500)
  const [page, setPage] = useState(1)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

  const { data, isLoading, isError } = useUsers({
    page,
    limit: 10,
    search: debouncedSearch,
    status: searchParams.status,
    role: searchParams.role,
  })
  const { data: dashboardData } = useAdminDashboard()

  const banUserMutation = useBanUser()
  const deleteUserMutation = useDeleteUser()
  const impersonateUserMutation = useImpersonateUser()

  const handleExport = () => {
    if (!data?.data?.data) return
    const users = (data?.data?.data as AdminUser[]) || []
    const headers = [
      t('auth.common.id'),
      t('auth.common.email'),
      t('auth.common.firstName'),
      t('auth.common.lastName'),
      t('auth.common.role'),
      t('auth.common.status'),
      t('auth.common.emailVerified'),
      t('auth.common.createdAt'),
    ]

    const csvContent = [
      headers.join(','),
      ...users.map((user: AdminUser) =>
        [
          user.id,
          `"${user.email}"`,
          `"${user.firstName ?? ''}"`,
          `"${user.lastName ?? ''}"`,
          user.role,
          user.isActif ? t('auth.common.active') : t('auth.common.inactive'),
          user.emailVerified ? t('auth.common.yes') : t('auth.common.no'),
          `"${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}"`,
        ].join(','),
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `user-list-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, user: AdminUser) => {
    setAnchorEl(event.currentTarget)
    setSelectedUser(user)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleBanUserRequest = () => {
    setConfirmBanOpen(true)
    handleMenuClose()
  }

  const handleDeleteUserRequest = () => {
    setConfirmDeleteOpen(true)
    handleMenuClose()
  }

  const handleBanUserConfirm = () => {
    if (!selectedUser) return
    banUserMutation.mutate(
      { id: selectedUser.id, reason: 'Admin action' },
      {
        onSuccess: () => {
          setConfirmBanOpen(false)
          setSelectedUser(null)
          toast.success(t('auth.admin.successBan'))
        },
        onError: (error: unknown) => {
          const message = error instanceof Error ? error.message : String(error)
          toast.error(message || t('auth.admin.errorBan'))
        },
      },
    )
  }

  const handleDeleteUserConfirm = () => {
    if (!selectedUser) return
    deleteUserMutation.mutate(selectedUser.id, {
      onSuccess: () => {
        setConfirmDeleteOpen(false)
        setSelectedUser(null)
        toast.success(t('auth.admin.successDelete'))
      },
      onError: (error: unknown) => {
        const message = error instanceof Error ? error.message : String(error)
        toast.error(message || t('auth.admin.errorDelete'))
      },
    })
  }

  const handleImpersonate = () => {
    if (selectedUser) {
      impersonateUserMutation.mutate(selectedUser.id, {
        onSuccess: (response: any) => {
          const token = (response.data as any)?.token || (response as any)?.token
          if (token) {
            toast.success(t('auth.admin.successImpersonate'))
            window.open(`/impersonate?token=${encodeURIComponent(token)}`, '_blank')
          }
          handleMenuClose()
        },
        onError: (error: unknown) => {
          const message = error instanceof Error ? error.message : String(error)
          toast.error(message || t('auth.admin.errorImpersonate'))
        },
      })
    }
  }

  const getRoleName = (roleId: number) => {
    const roles: Record<number, string> = {
      1: t('auth.roles.user'),
      2: t('auth.roles.participant'),
      3: t('auth.roles.judge'),
      4: t('auth.roles.provider_employee'),
      5: t('auth.roles.provider_admin'),
      6: t('auth.roles.admin'),
      7: t('auth.roles.super_admin_employee'),
      8: t('auth.roles.super_admin'),
    }
    return roles[roleId] || t('auth.roles.unknown')
  }

  const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(null)
  const [roleAnchorEl, setRoleAnchorEl] = useState<null | HTMLElement>(null)

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }} className='animate-scale-in'>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 4,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: { xs: 56, md: 64 },
              height: { xs: 56, md: 64 },
              borderRadius: '20px',
              bgcolor: alpha(theme.palette.info.main, 0.1),
              color: 'info.main',
              boxShadow: `0 8px 24px ${alpha(theme.palette.info.main, 0.12)}`,
            }}
          >
            <PersonIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography
              variant='h4'
              sx={{
                fontWeight: 900,
                letterSpacing: '-0.027em',
                fontSize: { xs: '1.5rem', md: '2.125rem' },
                lineHeight: 1.1,
                mb: 0.5,
              }}
            >
              {t('auth.admin.userListTitle')}
            </Typography>
            <Typography variant='body2' color='text.primary' sx={{ fontWeight: 600 }}>
              {t('auth.admin.userListSubtitle')}
            </Typography>
          </Box>
        </Box>

        <Stack direction='row' spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant='outlined'
            startIcon={<GetAppIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              height: 44,
              borderRadius: 2,
              px: 3,
            }}
            onClick={handleExport}
          >
            {t('auth.common.export')}
          </Button>
          <Button
            variant='contained'
            color='info'
            startIcon={<AddIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              height: 44,
              px: 3,
              borderRadius: 2,
              flexShrink: 0,
            }}
            onClick={() => setIsCreateModalOpen(true)}
          >
            {t('auth.admin.addUser')}
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        {[
          {
            label: t('auth.admin.statTotalUsers'),
            value: dashboardData?.data?.totalUsers ?? data?.data?.meta.total ?? '...',
            icon: <GroupIcon />,
            color: 'primary' as const,
            onClick: () => {
              setSearchParams((prev) => ({ ...prev, status: '', role: '', search: '' }))
              setPage(1)
            },
          },
          {
            label: t('auth.admin.statActiveNow'),
            value: dashboardData?.data?.activeSessions ?? '...',
            icon: <CheckCircleIcon />,
            color: 'success' as const,
            onClick: () => {
              setSearchParams((prev) => ({ ...prev, status: 'ACTIVE', role: '' }))
              setPage(1)
            },
          },
          {
            label: t('auth.admin.statOther'),
            value: dashboardData?.data?.failedLogins ?? '...',
            icon: <BlockIcon />,
            color: 'error' as const,
            onClick: () => {
              setSearchParams((prev) => ({ ...prev, status: 'SUSPENDED', role: '' }))
              setPage(1)
            },
          },
          {
            label: t('auth.admin.statMfaAdoption'),
            value: dashboardData?.data?.mfaAdoption ?? '...',
            icon: <SecurityIcon />,
            color: 'info' as const,
            onClick: () => {
              setSearchParams((prev) => ({ ...prev, status: '', role: '' }))
              setPage(1)
            },
          },
        ].map((stat, idx) => (
          <Card
            key={idx}
            sx={(theme: any) => ({
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'transform 0.15s ease, border-color 0.15s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                borderColor: theme.palette[stat.color].main,
              },
              ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
            })}
            onClick={stat.onClick}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 3 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '14px',
                  bgcolor: alpha(theme.palette[stat.color].main, 0.1),
                  color: `${stat.color}.main`,
                  boxShadow: `0 6px 12px ${alpha(theme.palette[stat.color].main, 0.1)}`,
                }}
              >
                {React.cloneElement(stat.icon, { fontSize: 'small' })}
              </Avatar>
              <Box>
                <Typography
                  variant='caption'
                  sx={{
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.075em',
                    display: 'block',
                    mb: 0.25,
                    fontSize: '0.65rem',
                    color: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.95)'
                        : 'text.secondary',
                  }}
                >
                  {stat.label}
                </Typography>
                <Typography
                  variant='h5'
                  sx={{
                    fontWeight: 900,
                    letterSpacing: '-0.02em',
                    color: (theme) => (theme.palette.mode === 'dark' ? '#FFFFFF' : 'text.primary'),
                  }}
                >
                  {stat.value}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card
        sx={(theme: any) => ({
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid ' + theme.palette.divider,
          ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
        })}
      >
        {/* Toolbar */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TextField
            placeholder={t('auth.common.searchUsers') || 'Search usersâ€¦'}
            size='small'
            value={searchParams.search}
            onChange={(e) => {
              setSearchParams((prev) => ({ ...prev, search: e.target.value }))
              setPage(1)
            }}
            sx={{
              width: { xs: '100%', md: 340 },
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
          <Stack direction='row' spacing={1} alignItems='center' sx={{ flexShrink: 0 }}>
            <Button
              size='small'
              startIcon={<FilterListIcon />}
              onClick={(e) => setStatusAnchorEl(e.currentTarget)}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                color: searchParams.status ? 'primary.main' : 'text.primary',
                borderRadius: 2,
                px: 2,
              }}
            >
              {searchParams.status
                ? `${t('auth.common.status')}: ${t(`auth.common.${searchParams.status.toLowerCase()}`)}`
                : t('auth.common.statusFilter')}
            </Button>

            <Button
              size='small'
              startIcon={<FilterListIcon />}
              onClick={(e) => setRoleAnchorEl(e.currentTarget)}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                color: searchParams.role ? 'primary.main' : 'text.primary',
                borderRadius: 2,
                px: 2,
              }}
            >
              {searchParams.role
                ? `${t('auth.common.role')}: ${getRoleName(Number(searchParams.role))}`
                : t('auth.common.roleFilter')}
            </Button>

            {(searchParams.status || searchParams.role) && (
              <IconButton
                size='small'
                color='error'
                onClick={() => {
                  setSearchParams((prev) => ({ ...prev, status: '', role: '' }))
                  setPage(1)
                }}
                aria-label='Clear filters'
              >
                <DeleteIcon fontSize='small' />
              </IconButton>
            )}

            <Divider orientation='vertical' flexItem sx={{ mx: 1, height: 24, opacity: 0.5 }} />
            <Typography
              variant='caption'
              color='text.primary'
              sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {data?.data?.meta.total || 0} Records
            </Typography>
          </Stack>
        </Box>

        <Divider sx={{ opacity: 0.5 }} />

        {/* Table */}
        <TableContainer sx={{ borderRadius: 0, boxShadow: 'none' }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead
              sx={{
                bgcolor: (theme) => alpha(theme.palette.action.hover, 0.4),
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <TableRow>
                {[
                  t('auth.common.user'),
                  t('auth.common.status'),
                  t('auth.common.role'),
                  t('auth.common.activeSince'),
                  t('auth.common.identity'),
                ].map((col) => (
                  <TableCell
                    key={col}
                    sx={{
                      py: 2.5,
                      fontWeight: 900,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'text.primary',
                    }}
                  >
                    {col}
                  </TableCell>
                ))}
                <TableCell
                  align='right'
                  sx={{
                    fontWeight: 900,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'text.primary',
                  }}
                >
                  {t('auth.common.actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 10 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 10, color: 'error.main' }}>
                    {t('auth.admin.errorLoadUsers') || 'Error loading users'}
                  </TableCell>
                </TableRow>
              ) : (
                ((data?.data?.data as AdminUser[]) || []).map((user: AdminUser) => (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      transition: 'background-color 0.2s ease',
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                      },
                    }}
                  >
                    {/* User info */}
                    <TableCell
                      onClick={() =>
                        navigate(Path.admin.userProfile.replace(':id', user.id.toString()))
                      }
                      sx={{ cursor: 'pointer', py: 2 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            fontWeight: 800,
                            fontSize: '0.95rem',
                          }}
                        >
                          {user.firstName?.[0] ?? ''}
                          {user.lastName?.[0] ?? ''}
                        </Avatar>
                        <Box>
                          <Typography
                            variant='body2'
                            sx={{ fontWeight: 700, color: 'text.primary' }}
                          >
                            {user.firstName ?? ''} {user.lastName ?? ''}
                          </Typography>
                          <Typography
                            variant='caption'
                            sx={{
                              fontWeight: 700,
                              color: (theme) =>
                                theme.palette.mode === 'dark'
                                  ? 'rgba(255, 255, 255, 0.9)'
                                  : 'text.secondary',
                            }}
                          >
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        label={user.isActif ? t('auth.common.active') : t('auth.common.suspended')}
                        size='small'
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.625rem',
                          height: 22,
                          borderRadius: 1.5,
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                          bgcolor: alpha(
                            user.isActif ? theme.palette.success.main : theme.palette.error.main,
                            0.12,
                          ),
                          color: user.isActif ? 'success.main' : 'error.main',
                          border: '1px solid',
                          borderColor: alpha(
                            user.isActif ? theme.palette.success.main : theme.palette.error.main,
                            0.25,
                          ),
                        }}
                      />
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        {getRoleName(user.role ?? 0)}
                      </Typography>
                    </TableCell>

                    {/* Created date */}
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'N/A'}
                      </Typography>
                    </TableCell>

                    {/* Verification status */}
                    <TableCell>
                      <Chip
                        label={
                          user.emailVerified
                            ? t('auth.common.verified')
                            : t('auth.common.unverified')
                        }
                        size='small'
                        variant='outlined'
                        sx={{
                          fontWeight: 700,
                          height: 20,
                          borderRadius: 1.2,
                          fontSize: '0.625rem',
                          textTransform: 'uppercase',
                          borderColor: 'divider',
                          color: user.emailVerified ? 'success.main' : 'text.disabled',
                        }}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell align='right'>
                      <Stack direction='row' spacing={0.5} justifyContent='flex-end'>
                        <Tooltip title={t('auth.admin.viewProfile') || 'View Profile'}>
                          <IconButton
                            size='small'
                            onClick={() =>
                              navigate(Path.admin.userProfile.replace(':id', user.id.toString()))
                            }
                            aria-label={`View profile for ${user.firstName}`}
                          >
                            <ChevronRightIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size='small'
                          onClick={(e) => handleMenuOpen(e, user)}
                          aria-label={`More options for ${user.firstName}`}
                        >
                          <MoreVertIcon fontSize='small' />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination footer */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
            {data?.data?.meta.total || 0} {t('auth.admin.records')}
          </Typography>
          <Pagination
            count={data?.data?.meta.total ? Math.ceil(data.data.meta.total / 10) : 1}
            page={page}
            onChange={(_, p) => setPage(p)}
            size='small'
            color='primary'
            disabled={isLoading}
            sx={{ '& .MuiPaginationItem-root': { fontWeight: 700, borderRadius: 1.5 } }}
          />
        </Box>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', minWidth: 200, mt: 1 },
        }}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose()
            navigate(Path.admin.userProfile.replace(':id', selectedUser?.id.toString() || ''))
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize='small' />
          </ListItemIcon>
          {t('auth.admin.editProfile') || 'Edit Profile'}
        </MenuItem>
        <MenuItem onClick={handleImpersonate}>
          <ListItemIcon>
            <SecurityIcon fontSize='small' />
          </ListItemIcon>
          {t('auth.admin.impersonate') || 'Impersonate'}
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose()
            navigate(Path.admin.userProfile.replace(':id', selectedUser?.id.toString() || ''))
            setTimeout(() => (window.location.hash = 'history'), 100)
          }}
        >
          <ListItemIcon>
            <HistoryIcon fontSize='small' />
          </ListItemIcon>
          {t('auth.admin.auditLogs') || 'Audit Logs'}
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleBanUserRequest} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <BlockIcon fontSize='small' color='error' />
          </ListItemIcon>
          {t('auth.admin.banUser') || 'Ban User'}
        </MenuItem>
        <MenuItem onClick={handleDeleteUserRequest} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize='small' color='error' />
          </ListItemIcon>
          {t('auth.admin.deleteUser') || 'Delete User'}
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={statusAnchorEl}
        open={Boolean(statusAnchorEl)}
        onClose={() => setStatusAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: 2, mt: 1, minWidth: 160 } }}
      >
        <MenuItem
          onClick={() => {
            setSearchParams((p) => ({ ...p, status: '' }))
            setStatusAnchorEl(null)
            setPage(1)
          }}
          disabled={!searchParams.status}
        >
          {t('auth.common.allStatuses') || 'All Statuses'}
        </MenuItem>
        {['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'].map((s) => (
          <MenuItem
            key={s}
            onClick={() => {
              setSearchParams((p) => ({ ...p, status: s }))
              setStatusAnchorEl(null)
              setPage(1)
            }}
            selected={searchParams.status === s}
          >
            {t(`auth.common.${s.toLowerCase()}`) || s}
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={roleAnchorEl}
        open={Boolean(roleAnchorEl)}
        onClose={() => setRoleAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: 2, mt: 1, minWidth: 160 } }}
      >
        <MenuItem
          onClick={() => {
            setSearchParams((p) => ({ ...p, role: '' }))
            setRoleAnchorEl(null)
            setPage(1)
          }}
          disabled={!searchParams.role}
        >
          {t('auth.common.allRoles') || 'All Roles'}
        </MenuItem>
        {[1, 5, 6, 8].map((r) => (
          <MenuItem
            key={r}
            onClick={() => {
              setSearchParams((p) => ({ ...p, role: r.toString() }))
              setRoleAnchorEl(null)
              setPage(1)
            }}
            selected={searchParams.role === r.toString()}
          >
            {getRoleName(r)}
          </MenuItem>
        ))}
      </Menu>

      <CreateUserDialog open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

      <ConfirmationDialog
        open={confirmBanOpen}
        onClose={() => setConfirmBanOpen(false)}
        title={t('auth.admin.confirmBanTitle') || 'Suspend User?'}
        message={`${t('auth.admin.confirmBanMessage')} ${selectedUser?.firstName} ${selectedUser?.lastName}?`}
        onConfirm={handleBanUserConfirm}
        isSubmitting={banUserMutation.isPending}
        severity='error'
      />

      <ConfirmationDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title={t('auth.admin.confirmDeleteTitle') || 'Delete User?'}
        message={`${t('auth.admin.confirmDeleteMessage')} ${selectedUser?.firstName} ${selectedUser?.lastName}?`}
        onConfirm={handleDeleteUserConfirm}
        isSubmitting={deleteUserMutation.isPending}
        severity='error'
      />
    </Box>
  )
}



