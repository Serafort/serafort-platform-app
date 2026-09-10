// UserList.tsx
// High-fidelity User Directory & Administration Screen with full API Integration

import React, { useState, useMemo, useCallback } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
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
  ListItemText,
  Pagination,
  alpha,
  useTheme,
  CircularProgress,
  Stack,
  Tooltip,
  Divider,
  Checkbox,
  FormControl,
  Select,
  Alert,
  Skeleton,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import GetAppIcon from '@mui/icons-material/GetApp'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import SecurityIcon from '@mui/icons-material/Security'
import LockResetIcon from '@mui/icons-material/LockReset'
import VisibilityIcon from '@mui/icons-material/Visibility'
import RefreshIcon from '@mui/icons-material/Refresh'
import ClearIcon from '@mui/icons-material/Clear'
import LayersIcon from '@mui/icons-material/Layers'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'

import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDebounce } from 'use-debounce'
import { motion } from 'framer-motion'
import Path from '../../path'
import { useUsersQuery, useRolesQuery } from '../../../hooks/useUserDirectoryQuery'
import {
  useUpdateUserStatusMutation,
  useSendPasswordResetMutation,
  useExportUsersMutation,
} from '../../../hooks/useUserDirectoryMutations'
import {
  UserDirectoryItemDTO,
  UserStatus,
  UserDirectoryFilterParams,
} from '../../../types/userDirectory.types'

import InviteUserModal from '../../../components/InviteUserModal'
import EditUserDrawer from '../../../components/EditUserDrawer'
import AssignRolesModal from '../../../components/AssignRolesModal'
import DeleteUserDialog from '../../../components/DeleteUserDialog'
import BulkActionModal from '../../../components/BulkActionModal'
import {
  AdminTableCard,
  AdminTableHead,
  AdminTableHeadCell,
} from '../../../../authentication-core/components/shared/admin'

const STATUS_OPTIONS: Array<{
  label: string
  value: UserStatus | 'ALL'
  color?: 'default' | 'success' | 'warning' | 'error'
}> = [
  { label: 'All Users', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE', color: 'success' },
  { label: 'Inactive', value: 'INACTIVE', color: 'default' },
  { label: 'Suspended', value: 'SUSPENDED', color: 'warning' },
  { label: 'Banned', value: 'BANNED', color: 'error' },
]

export default function UserList() {
  const theme = useTheme()
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const [urlParams, setUrlParams] = useSearchParams()

  // Search & Filter State
  const [searchInput, setSearchInput] = useState<string>(urlParams.get('search') || '')
  const [debouncedSearch] = useDebounce(searchInput, 300)
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>(
    (urlParams.get('status') as UserStatus) || 'ALL',
  )
  const [roleFilter, setRoleFilter] = useState<string>(urlParams.get('role') || 'ALL')
  const [sortBy, setSortBy] = useState<string>(urlParams.get('sortBy') || 'createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (urlParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  )
  const [page, setPage] = useState<number>(Number(urlParams.get('page')) || 1)
  const [perPage, setPerPage] = useState<number>(Number(urlParams.get('perPage')) || 10)

  // Selection state for bulk operations
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // Action Menus & Modals state
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedUser, setSelectedUser] = useState<UserDirectoryItemDTO | null>(null)

  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState<boolean>(false)
  const [isAssignRolesOpen, setIsAssignRolesOpen] = useState<boolean>(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [bulkAction, setBulkAction] = useState<
    'ACTIVATE' | 'DEACTIVATE' | 'SUSPEND' | 'DELETE' | null
  >(null)

  // Filter params object
  const filterParams: UserDirectoryFilterParams = useMemo(
    () => ({
      page,
      perPage,
      search: debouncedSearch.trim() || undefined,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      role: roleFilter === 'ALL' ? undefined : roleFilter,
      sortBy,
      sortOrder,
    }),
    [page, perPage, debouncedSearch, statusFilter, roleFilter, sortBy, sortOrder],
  )

  // Queries
  const {
    data: usersResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useUsersQuery(filterParams)

  const { data: rolesResponse } = useRolesQuery()

  // Mutations
  const updateStatusMutation = useUpdateUserStatusMutation()
  const sendPasswordResetMutation = useSendPasswordResetMutation()
  const exportUsersMutation = useExportUsersMutation()

  const usersList: UserDirectoryItemDTO[] = useMemo(() => {
    return usersResponse?.data?.data || []
  }, [usersResponse])

  const meta = useMemo(() => {
    return (
      usersResponse?.data?.meta || {
        total: usersList.length,
        perPage,
        currentPage: page,
        lastPage: Math.ceil(usersList.length / perPage) || 1,
        firstPage: 1,
      }
    )
  }, [usersResponse, usersList, perPage, page])

  const roles = useMemo(() => {
    return rolesResponse?.data || []
  }, [rolesResponse])

  // Selection handlers
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = usersList.map((u) => u.id)
      setSelectedIds(allIds)
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const isAllSelected = usersList.length > 0 && selectedIds.length === usersList.length
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < usersList.length

  // Quick Action Menu Handlers
  const handleOpenActionMenu = (
    event: React.MouseEvent<HTMLElement>,
    user: UserDirectoryItemDTO,
  ) => {
    event.stopPropagation()
    setActionMenuAnchor(event.currentTarget)
    setSelectedUser(user)
  }

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null)
  }

  const handleViewProfile = (user: UserDirectoryItemDTO) => {
    handleCloseActionMenu()
    navigate(Path.admin.users.user_profile.replace(':id', String(user.id)))
  }

  const handleOpenEdit = (user: UserDirectoryItemDTO) => {
    handleCloseActionMenu()
    setSelectedUser(user)
    setIsEditDrawerOpen(true)
  }

  const handleOpenAssignRoles = (user: UserDirectoryItemDTO) => {
    handleCloseActionMenu()
    setSelectedUser(user)
    setIsAssignRolesOpen(true)
  }

  const handleToggleStatus = (user: UserDirectoryItemDTO) => {
    handleCloseActionMenu()
    const nextStatus: UserStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    updateStatusMutation.mutate({
      id: user.id,
      data: {
        status: nextStatus,
        reason: `Status changed from ${user.status} to ${nextStatus}`,
      },
    })
  }

  const handleSendResetPassword = (user: UserDirectoryItemDTO) => {
    handleCloseActionMenu()
    sendPasswordResetMutation.mutate(user.id)
  }

  const handleOpenDelete = (user: UserDirectoryItemDTO) => {
    handleCloseActionMenu()
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const handleExport = () => {
    exportUsersMutation.mutate({
      filters: filterParams,
      fallbackData: usersList,
    })
  }

  const handleResetFilters = () => {
    setSearchInput('')
    setStatusFilter('ALL')
    setRoleFilter('ALL')
    setPage(1)
  }

  // Render Status Badge
  const renderStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Chip
            size='small'
            label='Active'
            icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
            sx={{
              bgcolor: alpha(theme.palette.success.main, 0.12),
              color: theme.palette.success.dark,
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: 'var(--sf-radius-xs, 4px)',
            }}
          />
        )
      case 'SUSPENDED':
        return (
          <Chip
            size='small'
            label='Suspended'
            icon={<BlockIcon sx={{ fontSize: '14px !important' }} />}
            sx={{
              bgcolor: alpha(theme.palette.warning.main, 0.12),
              color: theme.palette.warning.dark,
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: 'var(--sf-radius-xs, 4px)',
            }}
          />
        )
      case 'BANNED':
        return (
          <Chip
            size='small'
            label='Banned'
            icon={<HighlightOffIcon sx={{ fontSize: '14px !important' }} />}
            sx={{
              bgcolor: alpha(theme.palette.error.main, 0.12),
              color: theme.palette.error.dark,
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: 'var(--sf-radius-xs, 4px)',
            }}
          />
        )
      default:
        return (
          <Chip
            size='small'
            label='Inactive'
            sx={{
              bgcolor: alpha(theme.palette.text.secondary, 0.1),
              color: theme.palette.text.secondary,
              fontWeight: 600,
              fontSize: '0.75rem',
              borderRadius: 'var(--sf-radius-xs, 4px)',
            }}
          />
        )
    }
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      sx={{ p: { xs: 2, md: 4 }, maxWidth: 1440, mx: 'auto' }}
    >
      {/* Header Banner */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent='space-between'
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        mb={3.5}
      >
        <Box>
          <Stack direction='row' spacing={1.5} alignItems='center' mb={0.5}>
            <Typography variant='h4' fontWeight={800} letterSpacing='-0.02em'>
              User Directory
            </Typography>
            {isFetching && !isLoading && (
              <CircularProgress size={16} sx={{ color: 'text.secondary' }} />
            )}
          </Stack>
          <Typography variant='body2' color='text.secondary'>
            Manage organization members, security statuses, roles, and administrative credentials.
          </Typography>
        </Box>

        <Stack direction='row' spacing={1.5} alignItems='center' width={{ xs: '100%', sm: 'auto' }}>
          <Button
            variant='outlined'
            startIcon={
              exportUsersMutation.isPending ? (
                <CircularProgress size={16} color='inherit' />
              ) : (
                <GetAppIcon />
              )
            }
            onClick={handleExport}
            disabled={exportUsersMutation.isPending}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 'var(--sf-radius-md, 8px)',
              px: 2.5,
              minHeight: 44,
              borderColor: alpha(theme.palette.divider, 0.2),
            }}
          >
            Export CSV
          </Button>
          <Button
            variant='contained'
            startIcon={<PersonAddIcon />}
            onClick={() => setIsInviteModalOpen(true)}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 'var(--sf-radius-md, 8px)',
              px: 3,
              minHeight: 44,
              boxShadow: 'var(--sf-shadow-glow)',
            }}
          >
            Invite User
          </Button>
        </Stack>
      </Stack>

      {/* Main table surface — shared AdminTableCard (16px, hairline divider) */}
      <AdminTableCard>
        {/* Status Filter Chips Bar */}
        <Box
          sx={{
            p: 2,
            px: 3,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            overflowX: 'auto',
          }}
        >
          {STATUS_OPTIONS.map((opt) => {
            const isSelected = statusFilter === opt.value
            return (
              <Chip
                key={opt.value}
                label={opt.label}
                onClick={() => {
                  setStatusFilter(opt.value)
                  setPage(1)
                }}
                variant={isSelected ? 'filled' : 'outlined'}
                color={isSelected ? 'primary' : 'default'}
                sx={{
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.8125rem',
                  borderRadius: 'var(--sf-radius-xs, 4px)',
                  px: 0.5,
                  cursor: 'pointer',
                  borderColor: isSelected ? 'primary.main' : alpha(theme.palette.divider, 0.15),
                  '&:hover': {
                    bgcolor: isSelected
                      ? theme.palette.primary.dark
                      : alpha(theme.palette.text.primary, 0.04),
                  },
                }}
              />
            )
          })}
        </Box>

        {/* Toolbar & Search Bar */}
        <Box
          sx={{
            p: 2.5,
            px: 3,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            bgcolor: alpha(theme.palette.background.default, 0.3),
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          }}
        >
          {/* Search Input */}
          <TextField
            size='small'
            placeholder='Search by name, email, or department...'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon fontSize='small' sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: searchInput ? (
                  <InputAdornment position='end'>
                    <IconButton size='small' aria-label='Clear search' onClick={() => setSearchInput('')}>
                      <ClearIcon fontSize='small' />
                    </IconButton>
                  </InputAdornment>
                ) : null,
                sx: { borderRadius: 'var(--sf-radius-md, 8px)', bgcolor: 'background.paper', minHeight: 44 },
              },
            }}
            sx={{ width: { xs: '100%', md: 340 } }}
          />

          {/* Role & Sorting Selectors */}
          <Stack direction='row' spacing={1.5} alignItems='center' flexWrap='wrap'>
            <FormControl size='small' sx={{ minWidth: 140 }}>
              <Select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setPage(1)
                }}
                displayEmpty
                sx={{ borderRadius: 'var(--sf-radius-md, 8px)', bgcolor: 'background.paper', minHeight: 40 }}
              >
                <MenuItem value='ALL'>All Roles</MenuItem>
                {roles.map((r) => (
                  <MenuItem key={r.id} value={String(r.id)}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size='small' sx={{ minWidth: 150 }}>
              <Select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortBy(field)
                  setSortOrder(order as 'asc' | 'desc')
                }}
                sx={{ borderRadius: 'var(--sf-radius-md, 8px)', bgcolor: 'background.paper', minHeight: 40 }}
              >
                <MenuItem value='createdAt-desc'>Newest First</MenuItem>
                <MenuItem value='createdAt-asc'>Oldest First</MenuItem>
                <MenuItem value='lastName-asc'>Name (A - Z)</MenuItem>
                <MenuItem value='lastName-desc'>Name (Z - A)</MenuItem>
                <MenuItem value='email-asc'>Email (A - Z)</MenuItem>
              </Select>
            </FormControl>

            <Tooltip title='Refresh Directory'>
              <IconButton
                aria-label='Refresh Directory'
                onClick={() => refetch()}
                size='small'
                sx={{
                  border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                  borderRadius: 'var(--sf-radius-md, 8px)',
                  width: 44,
                  height: 44,
                  minWidth: 44,
                  minHeight: 44,
                }}
              >
                <RefreshIcon fontSize='small' />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Floating Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <Box
            sx={{
              p: 1.5,
              px: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            <Stack direction='row' spacing={1.5} alignItems='center'>
              <LayersIcon fontSize='small' color='primary' />
              <Typography variant='body2' fontWeight={700} color='primary.main'>
                {selectedIds.length} user{selectedIds.length > 1 ? 's' : ''} selected
              </Typography>
            </Stack>

            <Stack direction='row' spacing={1} alignItems='center'>
              <Button
                size='small'
                variant='outlined'
                color='success'
                onClick={() => setBulkAction('ACTIVATE')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 'var(--sf-radius-xs, 4px)',
                  minHeight: 36,
                }}
              >
                Activate
              </Button>
              <Button
                size='small'
                variant='outlined'
                color='warning'
                onClick={() => setBulkAction('SUSPEND')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 'var(--sf-radius-xs, 4px)',
                  minHeight: 36,
                }}
              >
                Suspend
              </Button>
              <Button
                size='small'
                variant='outlined'
                color='error'
                onClick={() => setBulkAction('DELETE')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 'var(--sf-radius-xs, 4px)',
                  minHeight: 36,
                }}
              >
                Delete
              </Button>
              <Button
                size='small'
                color='inherit'
                onClick={() => setSelectedIds([])}
                sx={{ textTransform: 'none', ml: 1, minHeight: 36, fontWeight: 600 }}
              >
                Clear Selection
              </Button>
            </Stack>
          </Box>
        )}

        {/* Error State */}
        {isError && (
          <Box sx={{ p: 3 }}>
            <Alert
              severity='error'
              action={
                <Button color='inherit' size='small' onClick={() => refetch()}>
                  Retry
                </Button>
              }
            >
              {(error as any)?.message || 'Failed to load user directory. Please try again.'}
            </Alert>
          </Box>
        )}

        {/* Data Table */}
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <AdminTableHead>
              <TableRow>
                <TableCell padding='checkbox' sx={{ pl: 3, borderColor: 'divider' }}>
                  <Checkbox
                    indeterminate={isSomeSelected}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    color='primary'
                  />
                </TableCell>
                <AdminTableHeadCell>{t('auth.userList.colUser', 'User')}</AdminTableHeadCell>
                <AdminTableHeadCell>{t('auth.userList.colStatus', 'Status')}</AdminTableHeadCell>
                <AdminTableHeadCell>{t('auth.userList.colRoles', 'Roles')}</AdminTableHeadCell>
                <AdminTableHeadCell>
                  {t('auth.userList.colDepartment', 'Department')}
                </AdminTableHeadCell>
                <AdminTableHeadCell>
                  {t('auth.userList.colJoined', 'Joined Date')}
                </AdminTableHeadCell>
                <AdminTableHeadCell align='right' sx={{ pr: 3 }}>
                  {t('auth.userList.colActions', 'Actions')}
                </AdminTableHeadCell>
              </TableRow>
            </AdminTableHead>

            <TableBody>
              {/* Loading Skeletons */}
              {isLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell padding='checkbox' sx={{ pl: 3 }}>
                      <Skeleton
                        variant='rectangular'
                        width={20}
                        height={20}
                        sx={{ borderRadius: 0.5 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction='row' spacing={2} alignItems='center'>
                        <Skeleton variant='circular' width={40} height={40} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant='text' width={140} height={20} />
                          <Skeleton variant='text' width={180} height={16} />
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Skeleton variant='rounded' width={70} height={24} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant='rounded' width={90} height={24} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant='text' width={100} height={20} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant='text' width={80} height={20} />
                    </TableCell>
                    <TableCell align='right' sx={{ pr: 3 }}>
                      <Skeleton variant='circular' width={28} height={28} sx={{ ml: 'auto' }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : usersList.length === 0 ? (
                /* Empty State */
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 8, textAlign: 'center' }}>
                    <Box sx={{ maxWidth: 360, mx: 'auto' }}>
                      <Avatar
                        sx={{
                          width: 64,
                          height: 64,
                          mx: 'auto',
                          mb: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          color: theme.palette.primary.main,
                        }}
                      >
                        <PeopleOutlineIcon fontSize='large' />
                      </Avatar>
                      <Typography variant='h6' fontWeight={700} gutterBottom>
                        No users found
                      </Typography>
                      <Typography variant='body2' color='text.secondary' mb={3}>
                        {searchInput || statusFilter !== 'ALL' || roleFilter !== 'ALL'
                          ? 'No results matched your search criteria. Try adjusting your active filters.'
                          : 'Your directory is currently empty. Invite your team members to get started.'}
                      </Typography>
                      <Stack direction='row' spacing={1.5} justifyContent='center'>
                        {(searchInput || statusFilter !== 'ALL' || roleFilter !== 'ALL') && (
                          <Button
                            variant='outlined'
                            onClick={handleResetFilters}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                          >
                            Reset Filters
                          </Button>
                        )}
                        <Button
                          variant='contained'
                          startIcon={<PersonAddIcon />}
                          onClick={() => setIsInviteModalOpen(true)}
                          sx={{ textTransform: 'none', fontWeight: 700 }}
                        >
                          Invite User
                        </Button>
                      </Stack>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                /* Data Rows */
                usersList.map((user) => {
                  const isSelected = selectedIds.includes(user.id)
                  return (
                    <TableRow
                      key={user.id}
                      hover
                      selected={isSelected}
                      onClick={() => handleViewProfile(user)}
                      sx={{
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                        '&.Mui-selected': {
                          bgcolor: alpha(theme.palette.primary.main, 0.06),
                        },
                      }}
                    >
                      <TableCell
                        padding='checkbox'
                        sx={{ pl: 3 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectOne(user.id)
                        }}
                      >
                        <Checkbox checked={isSelected} color='primary' />
                      </TableCell>

                      {/* User Info Column */}
                      <TableCell>
                        <Stack direction='row' spacing={1.75} alignItems='center'>
                          <Avatar
                            src={user.avatarUrl || undefined}
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: theme.palette.primary.main,
                              fontSize: '0.9rem',
                              fontWeight: 700,
                            }}
                          >
                            {user.firstName?.[0] || user.fullName?.[0] || 'U'}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant='body2'
                              fontWeight={700}
                              color='text.primary'
                              noWrap
                              sx={{
                                '&:hover': {
                                  color: 'primary.main',
                                  textDecoration: 'underline',
                                },
                              }}
                            >
                              {user.fullName || `${user.firstName} ${user.lastName}`}
                            </Typography>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                              noWrap
                              display='block'
                            >
                              {user.email}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* Status Column */}
                      <TableCell>{renderStatusBadge(user.status)}</TableCell>

                      {/* Roles Column */}
                      <TableCell>
                        <Stack direction='row' spacing={0.5} flexWrap='wrap' gap={0.5}>
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((r, idx) => (
                              <Chip
                                key={idx}
                                label={typeof r === 'object' ? r.name : r}
                                size='small'
                                variant='outlined'
                                sx={{
                                  fontSize: '0.7rem',
                                  height: 22,
                                  fontWeight: 600,
                                  borderRadius: 'var(--sf-radius-xs, 4px)',
                                  borderColor: alpha(theme.palette.divider, 0.2),
                                }}
                              />
                            ))
                          ) : (
                            <Typography variant='caption' color='text.secondary'>
                              Standard User
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>

                      {/* Department / Job Title */}
                      <TableCell>
                        <Typography variant='body2' fontWeight={500}>
                          {user.department || user.jobTitle || '—'}
                        </Typography>
                        {user.department && user.jobTitle && (
                          <Typography variant='caption' color='text.secondary'>
                            {user.jobTitle}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Created Date */}
                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : '—'}
                        </Typography>
                      </TableCell>

                      {/* Actions Menu */}
                      <TableCell align='right' sx={{ pr: 3 }} onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          size='small'
                          aria-label='Open actions menu'
                          onClick={(e) => handleOpenActionMenu(e, user)}
                          sx={{
                            color: 'text.secondary',
                            width: 44,
                            height: 44,
                            minWidth: 44,
                            minHeight: 44,
                            borderRadius: 'var(--sf-radius-md, 8px)',
                            '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.05) },
                          }}
                        >
                          <MoreVertIcon fontSize='small' />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Table Footer & Pagination */}
        <Box
          sx={{
            p: 2,
            px: 3,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            bgcolor: alpha(theme.palette.background.default, 0.3),
          }}
        >
          <Typography variant='caption' color='text.secondary'>
            Showing{' '}
            <strong>
              {usersList.length > 0 ? (page - 1) * perPage + 1 : 0}-
              {Math.min(page * perPage, meta.total)}
            </strong>{' '}
            of <strong>{meta.total}</strong> users
          </Typography>

          <Stack direction='row' spacing={2} alignItems='center'>
            <FormControl size='small'>
              <Select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value))
                  setPage(1)
                }}
                sx={{ height: 36, fontSize: '0.8125rem', borderRadius: 'var(--sf-radius-xs, 4px)' }}
              >
                <MenuItem value={10}>10 per page</MenuItem>
                <MenuItem value={25}>25 per page</MenuItem>
                <MenuItem value={50}>50 per page</MenuItem>
              </Select>
            </FormControl>

            <Pagination
              count={meta.lastPage || 1}
              page={page}
              onChange={(_, val) => setPage(val)}
              color='primary'
              shape='rounded'
              size='small'
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 'var(--sf-radius-xs, 4px)',
                  fontWeight: 700,
                },
              }}
            />
          </Stack>
        </Box>
      </AdminTableCard>

      {/* Row Action Context Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseActionMenu}
        slotProps={{
          paper: {
            sx: {
              minWidth: 200,
              borderRadius: 'var(--sf-radius-md, 8px)',
              boxShadow: 'var(--sf-shadow-lg)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            },
          },
        }}
      >
        <MenuItem onClick={() => selectedUser && handleViewProfile(selectedUser)}>
          <ListItemIcon>
            <VisibilityIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText primary='View Details' />
        </MenuItem>

        <MenuItem onClick={() => selectedUser && handleOpenEdit(selectedUser)}>
          <ListItemIcon>
            <EditIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText primary='Edit Profile' />
        </MenuItem>

        <MenuItem onClick={() => selectedUser && handleOpenAssignRoles(selectedUser)}>
          <ListItemIcon>
            <SecurityIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText primary='Assign Roles' />
        </MenuItem>

        <MenuItem onClick={() => selectedUser && handleSendResetPassword(selectedUser)}>
          <ListItemIcon>
            <LockResetIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText primary='Reset Password' />
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        {selectedUser?.status === 'ACTIVE' ? (
          <MenuItem onClick={() => selectedUser && handleToggleStatus(selectedUser)}>
            <ListItemIcon>
              <BlockIcon fontSize='small' color='warning' />
            </ListItemIcon>
            <ListItemText primary='Suspend User' sx={{ color: 'warning.main' }} />
          </MenuItem>
        ) : (
          <MenuItem onClick={() => selectedUser && handleToggleStatus(selectedUser)}>
            <ListItemIcon>
              <CheckCircleIcon fontSize='small' color='success' />
            </ListItemIcon>
            <ListItemText primary='Activate User' sx={{ color: 'success.main' }} />
          </MenuItem>
        )}

        <MenuItem onClick={() => selectedUser && handleOpenDelete(selectedUser)}>
          <ListItemIcon>
            <DeleteIcon fontSize='small' color='error' />
          </ListItemIcon>
          <ListItemText primary='Delete User' sx={{ color: 'error.main' }} />
        </MenuItem>
      </Menu>

      {/* Wired Modals & Drawers */}
      <InviteUserModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={() => refetch()}
      />

      <EditUserDrawer
        open={isEditDrawerOpen}
        userId={selectedUser?.id || null}
        initialUser={selectedUser}
        onClose={() => setIsEditDrawerOpen(false)}
        onSuccess={() => refetch()}
      />

      <AssignRolesModal
        open={isAssignRolesOpen}
        userId={selectedUser?.id || null}
        userName={selectedUser?.fullName}
        currentRoles={selectedUser?.roles}
        onClose={() => setIsAssignRolesOpen(false)}
        onSuccess={() => refetch()}
      />

      <DeleteUserDialog
        open={isDeleteDialogOpen}
        user={selectedUser}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={() => refetch()}
      />

      <BulkActionModal
        open={Boolean(bulkAction)}
        action={bulkAction}
        selectedUserIds={selectedIds}
        onClose={() => setBulkAction(null)}
        onSuccess={() => {
          setSelectedIds([])
          refetch()
        }}
      />
    </Box>
  )
}
