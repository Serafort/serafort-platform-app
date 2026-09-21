import React, { useMemo, useState } from 'react'
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
  Button,
  TextField,
  InputAdornment,
  useTheme,
  alpha,
  type SxProps,
  type Theme,
  Stack,
  Tooltip,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import ShieldIcon from '@mui/icons-material/Shield'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import LayersIcon from '@mui/icons-material/Layers'
import GroupIcon from '@mui/icons-material/Group'
import BusinessIcon from '@mui/icons-material/Business'
import SettingsIcon from '@mui/icons-material/Settings'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import FilterListIcon from '@mui/icons-material/FilterList'
import { useTranslation } from 'react-i18next'

import {
  usePermissions,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
} from '@auth/authorization-engine/hooks/useAdminQuery'
import { Permission } from '@auth/authorization-engine/services/adminService'
import ConfirmationDialog from '@auth/modules/authentication-core/components/shared/Modals/ConfirmationDialog'
import { toast } from 'react-toastify'
import { MONO_FONT } from '@auth/authorization-engine/components/tokens'
import {
  AdminDataState,
  AdminPageHeader,
  AdminRowActionButton,
  AdminTableCard,
  AdminTableHead,
  AdminTableHeadCell,
  AdminTableRow,
} from '@auth/authentication-core/components/shared/admin'

const CATEGORY_ICON: Record<string, React.ReactElement<{ fontSize?: 'small'; sx?: SxProps<Theme> }>> = {
  user: <GroupIcon />,
  org: <BusinessIcon />,
  default: <ShieldIcon />,
}

function getCategoryIcon(resource: string) {
  return CATEGORY_ICON[resource.toLowerCase()] ?? CATEGORY_ICON.default
}

export default function PermissionRegistry() {
  const { t } = useTranslation('common')
  const theme = useTheme()

  const { data: permissionsResponse, isLoading, isError, refetch } = usePermissions()
  const permissions: Permission[] = useMemo(() => {
    const rawData = permissionsResponse?.data
    if (!rawData) return []
    if (Array.isArray(rawData)) return rawData
    const nested = (rawData as { data?: unknown }).data
    if (Array.isArray(nested)) return nested as Permission[]
    return []
  }, [permissionsResponse?.data])

  const createPermission = useCreatePermission({
    onSuccess: () => {
      toast.success(t('auth.admin.permissionCreated'))
      setDialogOpen(false)
    },
    onError: (err: Error) => toast.error(err.message || t('auth.admin.errorCreatePermission')),
  })

  const updatePermission = useUpdatePermission({
    onSuccess: () => {
      toast.success(t('auth.admin.permissionUpdated'))
      setDialogOpen(false)
    },
    onError: (err: Error) => toast.error(err.message || t('auth.admin.errorUpdatePermission')),
  })

  const deletePermission = useDeletePermission({
    onSuccess: () => {
      toast.success(t('auth.admin.permissionDeleted'))
      setConfirmDeleteOpen(false)
    },
    onError: (err: Error) => toast.error(err.message || t('auth.admin.errorDeletePermission')),
  })

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    resource: '',
    guard_name: 'web',
  })

  const categories = useMemo(() => {
    const counts: Record<string, number> = {}
    permissions.forEach((p) => {
      const cat = p.resource || 'General'
      counts[cat] = (counts[cat] || 0) + 1
    })
    return Object.entries(counts).map(([label, count]) => ({ label, count }))
  }, [permissions])

  const filtered = useMemo(() => {
    return permissions.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.resource || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(search.toLowerCase())
      const matchCat = !activeCategory || (p.resource || 'General') === activeCategory
      return matchSearch && matchCat
    })
  }, [permissions, search, activeCategory])

  const handleOpenDialog = (perm: Permission | null = null) => {
    if (perm) {
      setEditingPermission(perm)
      setFormData({
        name: perm.name,
        description: perm.description || '',
        resource: perm.resource || '',
        guard_name: perm.guard_name || 'web',
      })
    } else {
      setEditingPermission(null)
      setFormData({
        name: '',
        description: '',
        resource: '',
        guard_name: 'web',
      })
    }
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (editingPermission) {
      updatePermission.mutate({ id: editingPermission.id, data: formData })
    } else {
      createPermission.mutate(formData)
    }
  }

  const handleDeleteClick = (perm: Permission) => {
    setPermissionToDelete(perm)
    setConfirmDeleteOpen(true)
  }

  const handleConfirmDelete = () => {
    if (permissionToDelete) {
      deletePermission.mutate(permissionToDelete.id)
    }
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(permissions, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'permissions.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <AdminPageHeader
        icon={<ShieldIcon sx={{ fontSize: 28 }} />}
        title={t('auth.admin.permissionRegistry')}
        description={t('auth.admin.permissionRegistry_subtitle')}
        actions={
          <>
            <Button
              variant='outlined'
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                flex: { xs: 1, sm: 'none' },
                minHeight: 44,
                borderRadius: 'var(--sf-radius-md, 8px)',
              }}
            >
              {t('auth.admin.exportJson')}
            </Button>
            <Button
              variant='contained'
              color='info'
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                boxShadow: `0 4px 14px 0 ${alpha(theme.palette.info.main, 0.39)}`,
                '&:hover': {
                  bgcolor: 'info.dark',
                  boxShadow: `0 6px 20px 0 ${alpha(theme.palette.info.main, 0.5)}`,
                },
                textTransform: 'none',
                fontWeight: 700,
                flex: { xs: 1, sm: 'none' },
                minHeight: 44,
                px: 3,
                borderRadius: 'var(--sf-radius-md, 8px)',
              }}
            >
              {t('auth.admin.defineNewAction')}
            </Button>
          </>
        }
      />

      {/* ── Category summary cards ──────────────────────────────────────── */}
      {!isLoading && categories.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 3,
            mb: 4,
          }}
        >
          {/* "All" Card */}
          <Card
            onClick={() => setActiveCategory(null)}
            sx={{
              border: '1px solid',
              borderColor: activeCategory === null ? 'primary.main' : 'divider',
              boxShadow: 'none',
              borderRadius: 'var(--sf-radius-lg, 16px)',
              cursor: 'pointer',
              bgcolor:
                activeCategory === null ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
              transition: 'transform 0.15s ease, border-color 0.15s ease',
              '&:hover': { transform: 'translateY(-2px)', borderColor: 'primary.main' },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 3 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--sf-radius-md, 12px)',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  boxShadow: `0 6px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <LayersIcon fontSize='small' />
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
                  {t('common.all') || 'All'}
                </Typography>
                <Typography variant='h5' sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {permissions.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Dynamic Category Cards */}
          {categories.slice(0, 3).map((cat) => (
            <Card
              key={cat.label}
              onClick={() => setActiveCategory(cat.label === activeCategory ? null : cat.label)}
              sx={{
                border: '1px solid',
                borderColor: activeCategory === cat.label ? 'primary.main' : 'divider',
                boxShadow: 'none',
                borderRadius: 'var(--sf-radius-lg, 16px)',
                cursor: 'pointer',
                bgcolor:
                  activeCategory === cat.label
                    ? alpha(theme.palette.primary.main, 0.04)
                    : 'transparent',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
                '&:hover': { transform: 'translateY(-2px)', borderColor: 'primary.main' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 3 }}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--sf-radius-md, 12px)',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    boxShadow: `0 6px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}
                >
                  {React.cloneElement(getCategoryIcon(cat.label), { fontSize: 'small' })}
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
                    {cat.label}
                  </Typography>
                  <Typography variant='h5' sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                    {cat.count}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

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
            placeholder={t('auth.admin.filterPermissions')}
            size='small'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              width: { xs: '100%', sm: 340 },
              '& .MuiOutlinedInput-root': { borderRadius: 'var(--sf-radius-md, 8px)' },
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
            {activeCategory && (
              <Chip
                label={activeCategory}
                size='small'
                onDelete={() => setActiveCategory(null)}
                icon={<FilterListIcon sx={{ fontSize: '14px !important' }} />}
                sx={{
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  borderRadius: 'var(--sf-radius-sm, 6px)',
                  height: 24,
                }}
              />
            )}
            {filtered.length} {t('auth.common.of')} {permissions.length} {t('auth.admin.actions')}
          </Stack>
        </Box>

        <Divider sx={{ opacity: 0.5 }} />

        {/* Table */}
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <AdminTableHead>
              <TableRow>
                {[
                  t('auth.admin.actionSlug'),
                  t('auth.admin.resource'),
                  t('auth.admin.guard'),
                  t('auth.admin.description'),
                ].map((col) => (
                  <AdminTableHeadCell key={col} sx={{ py: 2 }}>
                    {col}
                  </AdminTableHeadCell>
                ))}
                <AdminTableHeadCell align='right'>
                  {t('auth.common.actions')}
                </AdminTableHeadCell>
              </TableRow>
            </AdminTableHead>

            <TableBody>
              <AdminDataState
                asTableRow
                skeletonColumns={5}
                loading={isLoading}
                error={isError || undefined}
                onRetry={() => void refetch()}
                empty={filtered.length === 0}
                emptyIcon={<ShieldIcon sx={{ fontSize: 32 }} />}
                emptyTitle={
                  search || activeCategory
                    ? t('auth.common.noResults')
                    : t('auth.admin.noPermissions')
                }
                emptyDescription={t('auth.admin.noPermissionsHint')}
              >
                {filtered.map((perm) => (
                  <AdminTableRow key={perm.id}>
                    {/* Slug */}
                    <TableCell>
                      <Chip
                        label={perm.name}
                        size='small'
                        icon={<VpnKeyIcon sx={{ fontSize: '12px !important' }} />}
                        sx={{
                          fontWeight: 700,
                          fontFamily: MONO_FONT,
                          borderRadius: 'var(--sf-radius-sm, 6px)',
                          maxWidth: 260,
                          height: 24,
                          fontSize: '0.75rem',
                        }}
                        color='primary'
                        variant='outlined'
                      />
                    </TableCell>

                    {/* Resource */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ color: 'text.secondary', display: 'flex', fontSize: 16 }}>
                          {React.cloneElement(getCategoryIcon(perm.resource || ''), {
                            sx: { fontSize: 18, opacity: 0.7 },
                          })}
                        </Box>
                        <Typography
                          variant='body2'
                          sx={{ fontWeight: 700, textTransform: 'capitalize' }}
                        >
                          {perm.resource || '—'}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Guard */}
                    <TableCell>
                      <Chip
                        label={perm.guard_name}
                        size='small'
                        variant='outlined'
                        sx={{
                          fontWeight: 800,
                          height: 20,
                          borderRadius: 'var(--sf-radius-sm, 6px)',
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                        }}
                      />
                    </TableCell>

                    {/* Description */}
                    <TableCell sx={{ maxWidth: 340 }}>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {perm.description || '—'}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align='right'>
                      <Stack direction='row' spacing={0.5} justifyContent='flex-end'>
                        <Tooltip title={t('auth.admin.editDefinition')}>
                          <AdminRowActionButton
                            aria-label={t('auth.admin.editRoleNamed', {
                              name: perm.name,
                              defaultValue: 'Edit {{name}}',
                            })}
                            onClick={() => handleOpenDialog(perm)}
                          >
                            <SettingsIcon fontSize='small' />
                          </AdminRowActionButton>
                        </Tooltip>
                        <Tooltip title={t('auth.common.delete')}>
                          <AdminRowActionButton
                            color='error'
                            aria-label={t('auth.admin.deleteNamed', {
                              name: perm.name,
                              defaultValue: 'Delete {{name}}',
                            })}
                            onClick={() => handleDeleteClick(perm)}
                          >
                            <DeleteIcon fontSize='small' />
                          </AdminRowActionButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </AdminTableRow>
                ))}
              </AdminDataState>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer count */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant='caption'
            color='text.disabled'
            sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.075em' }}
          >
            {t('auth.admin.permissionsCount', {
              count: filtered.length,
              total: permissions.length,
            })}
          </Typography>
        </Box>
      </AdminTableCard>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{ sx: { borderRadius: 'var(--sf-radius-lg, 16px)' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          {editingPermission ? t('auth.admin.editAction') : t('auth.admin.defineNewAction')}
        </DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3, fontWeight: 500 }}>
            {t('auth.admin.actionsDescription')}
          </Typography>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label={t('auth.admin.actionKey')}
              placeholder={t('auth.admin.actionKeyPlaceholder') || 'e.g., users:create'}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              helperText={t('auth.admin.actionKeyHelper')}
              required
            />
            <TextField
              fullWidth
              label={t('auth.admin.resourceCategory')}
              placeholder={
                t('auth.admin.resourceCategoryPlaceholder') || 'e.g., users, billing, system'
              }
              value={formData.resource}
              onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
            />
            <TextField
              fullWidth
              label={t('auth.admin.guardName')}
              value={formData.guard_name}
              onChange={(e) => setFormData({ ...formData, guard_name: e.target.value })}
            />
            <TextField
              fullWidth
              label={t('auth.admin.description')}
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ minHeight: 44, borderRadius: 'var(--sf-radius-md, 8px)', fontWeight: 700 }}>
            {t('auth.common.cancel')}
          </Button>
          <Button
            variant='contained'
            onClick={handleSave}
            disabled={createPermission.isPending || updatePermission.isPending || !formData.name}
            sx={{ minHeight: 44, fontWeight: 800, borderRadius: 'var(--sf-radius-md, 8px)', px: 3 }}
          >
            {editingPermission ? t('auth.admin.updateDefinition') : t('auth.admin.createAction')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={confirmDeleteOpen}
        title={t('auth.admin.deleteActionTitle') || 'Delete Action Definition?'}
        message={
          t('auth.admin.deleteActionMessage', { name: permissionToDelete?.name }) ||
          `Are you sure you want to permanently delete the "${permissionToDelete?.name}" action? This may break existing roles that depend on it.`
        }
        confirmLabel={t('auth.admin.deletePermanently') || 'Delete Permanently'}
        severity='error'
        isSubmitting={deletePermission.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setConfirmDeleteOpen(false)}
      />
    </Box>
  )
}
