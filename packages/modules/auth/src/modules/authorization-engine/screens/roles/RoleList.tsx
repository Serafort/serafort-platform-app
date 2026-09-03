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
  Tooltip,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import AddIcon from '@mui/icons-material/Add'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
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

  const { data: rolesResponse, isLoading } = useRoles({ page, limit, search: debouncedSearch })
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
      {/* â”€â”€ Page Header â€” mirrors OrganizationProfile top banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
              borderRadius: '20px',
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
                fontWeight: 900,
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
          startIcon={<AddIcon />}
          onClick={() => navigate(Path.roleDetail.replace(':id', 'new'))}
          sx={{
            bgcolor: 'info.main',
            color: 'white',
            boxShadow: `0 4px 14px 0 ${alpha(theme.palette.info.main, 0.39)}`,
            '&:hover': {
              bgcolor: 'info.dark',
              boxShadow: `0 6px 20px 0 ${alpha(theme.palette.info.main, 0.5)}`,
            },
            textTransform: 'none',
            fontWeight: 700,
            height: 44,
            px: 3,
            borderRadius: 2,
            width: { xs: '100%', sm: 'auto' },
            flexShrink: 0,
          }}
        >
          {t('auth.admin.createRole')}
        </Button>
      </Box>

      {/* â”€â”€ Stat Cards â€” same card anatomy as OrganizationProfile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
            value: stats?.totalPermissions ?? 'â€¦',
            icon: <ShieldIcon />,
            color: 'success' as const,
          },
          {
            label: t('auth.admin.activeMemberships'),
            value: stats?.totalMemberships ?? 'â€¦',
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
              borderRadius: 4,
              transition: 'transform 0.15s ease',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
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
                <Typography variant='h5' sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
                  {stat.value}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* â”€â”€ Roles Table Card â€” unified Card following OrganizationProfile â”€â”€â”€ */}
      <Card
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
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
          <Stack direction='row' spacing={2} alignItems='center' sx={{ flexShrink: 0 }}>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {totalItems} {t('auth.admin.results')}
            </Typography>
            <Button
              startIcon={<FilterListIcon />}
              sx={{
                color: 'text.primary',
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 2,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
              }}
            >
              {t('auth.common.filters')}
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ opacity: 0.5 }} />

        {/* Table */}
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                {[
                  t('auth.admin.colRoleName'),
                  t('auth.admin.colScope'),
                  t('auth.admin.colPermissions'),
                  t('auth.admin.colMembers'),
                  t('auth.admin.colLastUpdated'),
                ].map((col) => (
                  <TableCell
                    key={col}
                    sx={{
                      py: 2,
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.075em',
                    }}
                  >
                    {col}
                  </TableCell>
                ))}
                <TableCell
                  align='right'
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.075em',
                  }}
                >
                  {t('auth.admin.colActions')}
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
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 12 }}>
                    <Stack spacing={2} alignItems='center'>
                      <Avatar
                        sx={{
                          width: 64,
                          height: 64,
                          bgcolor: 'action.hover',
                          color: 'text.disabled',
                        }}
                      >
                        <ShieldIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant='h6' sx={{ fontWeight: 800, mb: 0.5 }}>
                          {t('auth.admin.noRolesFound')}
                        </Typography>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{ maxWidth: 300, mx: 'auto' }}
                        >
                          {t('auth.admin.noRolesHint')}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow
                    key={role.id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    {/* Role Name + Description */}
                    <TableCell
                      onClick={() => navigate(Path.roleDetail.replace(':id', role.id.toString()))}
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
                          borderRadius: 1.5,
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
                        <Tooltip title={t('auth.admin.editRole')}>
                          <IconButton
                            size='small'
                            onClick={() =>
                              navigate(Path.roleDetail.replace(':id', role.id.toString()))
                            }
                            aria-label={`Edit ${role.name}`}
                          >
                            <EditIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size='small'
                          onClick={(e) => handleMenuOpen(e, role)}
                          aria-label={`More options for ${role.name}`}
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
            {t('auth.admin.page')} {page} {t('auth.admin.of')} {totalPages || 1}
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            size='small'
            color='primary'
            sx={{
              '& .MuiPaginationItem-root': { fontWeight: 700, borderRadius: 1.5 },
            }}
          />
        </Box>
      </Card>

      {/* â”€â”€ Context Menu â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', minWidth: 180, mt: 1 },
        }}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose()
            navigate(Path.roleDetail.replace(':id', selectedRole?.id.toString() || ''))
          }}
        >
          <ListItemIcon>
            <SecurityIcon fontSize='small' />
          </ListItemIcon>
          {t('auth.admin.permissions')}
        </MenuItem>
        <MenuItem onClick={handleDuplicateRole} disabled={duplicateRole.isPending}>
          <ListItemIcon>
            <ContentCopyIcon fontSize='small' />
          </ListItemIcon>
          {t('auth.common.duplicate')}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteRole} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize='small' color='error' />
          </ListItemIcon>
          {t('auth.admin.deleteRole')}
        </MenuItem>
      </Menu>

      {/* â”€â”€ Delete Confirmation Dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        maxWidth='xs'
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1, backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.375rem', letterSpacing: '-0.02em' }}>
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
            sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'none' }}
          >
            {t('auth.common.cancel')}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color='error'
            variant='contained'
            disabled={deleteRole.isPending}
            sx={{
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: 2,
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
