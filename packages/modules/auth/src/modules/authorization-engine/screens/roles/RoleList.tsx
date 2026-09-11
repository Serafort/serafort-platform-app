import React, { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  useTheme,
  alpha,
  Pagination,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import DeleteIcon from '@mui/icons-material/Delete'
import SecurityIcon from '@mui/icons-material/Security'
import GroupIcon from '@mui/icons-material/Group'
import ShieldIcon from '@mui/icons-material/Shield'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from 'use-debounce'
import { toast } from 'react-toastify'
import Path from '../../screens/path'
import {
  AdminDataState,
  AdminTableCard,
  AdminTableHead,
  AdminTableHeadCell,
  AdminTableRow,
} from '../../../authentication-core/components/shared/admin'

import {
  useRoles,
  useDeleteRole,
  useDuplicateRole,
  useRoleStats,
} from '@auth/authorization-engine/hooks/useAdminQuery'
import { Role } from '@auth/authorization-engine/services/adminService'

export default function RoleList() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const theme = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch] = useDebounce(searchTerm, 500)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const {
    data: rolesResponse,
    isLoading,
    isError,
    refetch,
  } = useRoles({ page, limit, search: debouncedSearch })
  const { data: statsResponse } = useRoleStats()
  const deleteRole = useDeleteRole()
  const duplicateRole = useDuplicateRole()

  const roles = useMemo(() => rolesResponse?.data?.data || [], [rolesResponse])
  const stats = statsResponse?.data
  const totalItems = useMemo(() => rolesResponse?.data?.meta?.total || 0, [rolesResponse])
  const totalPages = useMemo(() => Math.ceil(totalItems / limit), [totalItems, limit])

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, role: Role) => {
    setAnchorEl(event.currentTarget)
    setSelectedRole(role)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedRole(null)
  }

  const handleDeleteRole = () => {
    setAnchorEl(null)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedRole) return
    try {
      await deleteRole.mutateAsync(selectedRole.id)
      toast.success(t('auth.admin.successDelete'))
      setDeleteDialogOpen(false)
      setSelectedRole(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      toast.error(message || t('auth.admin.errorDelete'))
    }
  }

  const handleDuplicateRole = async () => {
    if (!selectedRole) return
    handleMenuClose()
    try {
      const timestamp = new Date().getTime().toString().slice(-4)
      await duplicateRole.mutateAsync({
        role: selectedRole,
        newName: `${selectedRole.name} (${t('auth.common.copy')}) ${timestamp}`,
      })
      toast.success(t('auth.admin.successDuplicate'))
      setSelectedRole(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      toast.error(message || t('auth.admin.errorDuplicate'))
    }
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setSelectedRole(null)
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* ── Page Header — mirrors OrganizationProfile top banner ─────────── */}
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
              width: { xs: 56, md: 64 },
              height: { xs: 56, md: 64 },
              borderRadius: 'var(--sf-radius-lg, 16px)',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
            }}
          >
            <SecurityIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography
              variant='h4'
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.027em',
                fontSize: { xs: '1.5rem', md: '2.125rem' },
                lineHeight: 1.1,
                mb: 0.5,
              }}
            >
              {t('auth.admin.roleListTitle')}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
              {t('auth.admin.roleListSubtitle')}
            </Typography>
          </Box>
        </Box>

        <Button
          variant='contained'
          color='info'
          startIcon={<AddIcon />}
          onClick={() => navigate(Path.roleDetail.replace(':id', 'new'))}
          sx={{
            boxShadow: `0 4px 14px 0 ${alpha(theme.palette.info.main, 0.39)}`,
            '&:hover': {
              boxShadow: `0 6px 20px 0 ${alpha(theme.palette.info.main, 0.5)}`,
            },
            textTransform: 'none',
            fontWeight: 700,
            minHeight: 44,
            px: 3,
            borderRadius: 'var(--sf-radius-md, 8px)',
            width: { xs: '100%', sm: 'auto' },
            flexShrink: 0,
          }}
        >
          {t('auth.admin.createRole')}
        </Button>
      </Box>

      {/* ── Stat Cards — same card anatomy as OrganizationProfile ─────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        {[
          {
            label: t('auth.admin.totalRoles'),
            value: stats?.totalRoles ?? totalItems ?? 0,
            icon: <SecurityIcon />,
            color: 'primary' as const,
          },
          {
            label: t('auth.admin.mappedPermissions'),
            value: stats?.totalPermissions ?? '…',
            icon: <ShieldIcon />,
            color: 'success' as const,
          },
          {
            label: t('auth.admin.activeMemberships'),
            value: stats?.totalMemberships ?? '…',
            icon: <GroupIcon />,
            color: 'info' as const,
          },
        ].map((stat, idx) => (
          <Card
            key={idx}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              borderRadius: 'var(--sf-radius-lg, 16px)',
              transition: 'transform 0.15s ease',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 3 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--sf-radius-md, 12px)',
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
                  color='text.secondary'
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.075em',
                    display: 'block',
                    mb: 0.25,
                    fontSize: '0.65rem',
                  }}
                >
                  {stat.label}
                </Typography>
                <Typography variant='h5' sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {stat.value}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* ── Roles Table Card — shared AdminTableCard (16px, hairline divider) ─ */}
      <AdminTableCard>
        {/* Toolbar */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TextField
            placeholder={t('auth.admin.searchRolesPlaceholder')}
            size='small'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: { xs: '100%', sm: 340 },
              '& .MuiOutlinedInput-root': { borderRadius: 'var(--sf-radius-md, 8px)' },
            }}
            slotProps={{
              htmlInput: { 'aria-label': t('auth.admin.searchRolesPlaceholder') },
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Stack direction='row' spacing={2} alignItems='center' sx={{ flexShrink: 0 }}>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {totalItems} {t('auth.admin.results')}
            </Typography>
          </Stack>
        </Box>

        <Divider sx={{ opacity: 0.5 }} />

        {/* Table */}
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <AdminTableHead>
              <TableRow>
                {[
                  t('auth.admin.colRoleName'),
                  t('auth.admin.colScope'),
                  t('auth.admin.colPermissions'),
                  t('auth.admin.colMembers'),
                  t('auth.admin.colLastUpdated'),
                ].map((col) => (
                  <AdminTableHeadCell key={col} sx={{ py: 2 }}>
                    {col}
                  </AdminTableHeadCell>
                ))}
                <AdminTableHeadCell align='right'>
                  {t('auth.admin.colActions')}
                </AdminTableHeadCell>
              </TableRow>
            </AdminTableHead>

            <TableBody>
              <AdminDataState
                asTableRow
                skeletonColumns={6}
                loading={isLoading}
                error={isError || undefined}
                onRetry={() => void refetch()}
                empty={roles.length === 0}
                emptyIcon={<ShieldIcon sx={{ fontSize: 32 }} />}
                emptyTitle={t('auth.admin.noRolesFound')}
                emptyDescription={t('auth.admin.noRolesHint')}
              >
                {roles.map((role) => (
                  <AdminTableRow
                    key={role.id}
                    clickable
                    onClick={() => navigate(Path.roleDetail.replace(':id', role.id.toString()))}
                    aria-label={t('auth.admin.editRoleNamed', {
                      name: role.name,
                      defaultValue: 'Edit {{name}}',
                    })}
                  >
                    {/* Role Name + Description */}
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 'var(--sf-radius-md, 10px)',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            fontWeight: 800,
                            fontSize: '0.95rem',
                          }}
                        >
                          {role.name[0]}
                        </Avatar>
                        <Box>
                          <Typography
                            variant='body2'
                            sx={{ fontWeight: 700, color: 'text.primary' }}
                          >
                            {role.name}
                          </Typography>
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            sx={{ display: 'block', fontWeight: 500, opacity: 0.8 }}
                          >
                            {role.description || t('auth.admin.noDescription')}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Scope Chip */}
                    <TableCell>
                      <Chip
                        label={
                          role.guard_name === 'api'
                            ? t('auth.admin.apiEngine')
                            : t('auth.admin.webPortal')
                        }
                        size='small'
                        variant='outlined'
                        sx={{
                          fontWeight: 800,
                          height: 22,
                          borderRadius: 'var(--sf-radius-sm, 6px)',
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                          borderColor: alpha(
                            role.guard_name === 'api'
                              ? theme.palette.primary.main
                              : theme.palette.secondary.main,
                            0.3,
                          ),
                          color: role.guard_name === 'api' ? 'primary.main' : 'secondary.main',
                          bgcolor: alpha(
                            role.guard_name === 'api'
                              ? theme.palette.primary.main
                              : theme.palette.secondary.main,
                            0.04,
                          ),
                        }}
                      />
                    </TableCell>

                    {/* Permissions count */}
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 700 }}>
                        {role.permissions?.length || 0}
                      </Typography>
                      <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                        {t('auth.admin.definedActions')}
                      </Typography>
                    </TableCell>

                    {/* Members count */}
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 700 }}>
                        {role.users_count || 0}
                      </Typography>
                      <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                        {t('auth.admin.members')}
                      </Typography>
                    </TableCell>

                    {/* Last updated */}
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {role.updated_at
                          ? new Date(role.updated_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : null}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align='right'>
                      <Stack direction='row' spacing={0.5} justifyContent='flex-end'>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMenuOpen(e, role)
                          }}
                          aria-label={t('auth.admin.moreOptionsNamed', {
                            name: role.name,
                            defaultValue: 'More options for {{name}}',
                          })}
                          sx={{ width: 44, height: 44 }}
                        >
                          <MoreVertIcon fontSize='small' />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </AdminTableRow>
                ))}
              </AdminDataState>
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
            {t('auth.admin.pageOf', { page, total: totalPages || 1 })}
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color='primary'
            sx={{
              '& .MuiPaginationItem-root': {
                fontWeight: 700,
                borderRadius: 'var(--sf-radius-sm, 6px)',
                minWidth: 44,
                height: 44,
              },
            }}
          />
        </Box>
      </AdminTableCard>

      {/* ── Context Menu ──────────────────────────────────────────────────── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 'var(--sf-radius-lg, 12px)',
            boxShadow: 'var(--sf-shadow-lg)',
            minWidth: 180,
            mt: 1,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose()
            navigate(Path.roleDetail.replace(':id', selectedRole?.id.toString() || ''))
          }}
          sx={{ minHeight: 44 }}
        >
          <ListItemIcon>
            <SecurityIcon fontSize='small' />
          </ListItemIcon>
          {t('auth.admin.permissions')}
        </MenuItem>
        <MenuItem
          onClick={handleDuplicateRole}
          disabled={duplicateRole.isPending}
          sx={{ minHeight: 44 }}
        >
          <ListItemIcon>
            <ContentCopyIcon fontSize='small' />
          </ListItemIcon>
          {t('auth.common.duplicate')}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteRole} sx={{ color: 'error.main', minHeight: 44 }}>
          <ListItemIcon>
            <DeleteIcon fontSize='small' color='error' />
          </ListItemIcon>
          {t('auth.admin.deleteRole')}
        </MenuItem>
      </Menu>

      {/* ── Delete Confirmation Dialog ────────────────────────────────────── */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        maxWidth='xs'
        fullWidth
        PaperProps={{
          sx: { borderRadius: 'var(--sf-radius-lg, 16px)', p: 1, backgroundImage: 'none' },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.375rem', letterSpacing: '-0.02em' }}>
          {t('auth.admin.deleteRoleTitle')} &rdquo;{selectedRole?.name}&rdquo;?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontWeight: 500 }}>
            {t('auth.admin.deleteRoleDesc')}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleCancelDelete}
            sx={{
              minHeight: 44,
              borderRadius: 'var(--sf-radius-md, 8px)',
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'none',
            }}
          >
            {t('auth.common.cancel')}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color='error'
            variant='contained'
            disabled={deleteRole.isPending}
            sx={{
              minHeight: 44,
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: 'var(--sf-radius-md, 8px)',
              px: 3,
              boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.4)}`,
            }}
          >
            {deleteRole.isPending ? t('auth.admin.deleting') : t('auth.admin.deleteRole')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
