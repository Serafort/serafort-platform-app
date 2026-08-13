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
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  useTheme,
  alpha,
  Stack,
  Tooltip,
  Avatar,
  CircularProgress,
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
} from "@auth/authorization-engine/hooks/useAdminQuery"
import { Permission } from "@auth/authorization-engine/services/adminService"
import ConfirmationDialog from '@auth/modules/authentication-core/components/shared/Modals/ConfirmationDialog'
import { toast } from 'react-toastify';

const CATEGORY_ICON: Record<string, React.ReactNode> = {
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

  const { data: permissionsResponse, isLoading } = usePermissions()
  const permissions: Permission[] = useMemo(() => {
    const rawData = permissionsResponse?.data
    if (!rawData) return []
    if (Array.isArray(rawData)) return rawData
    if (typeof rawData === 'object' && 'data' in rawData && Array.isArray((rawData as any).data)) {
      return (rawData as any).data
    }
    return []
  }, [permissionsResponse?.data])

  const createPermission = useCreatePermission({
    onSuccess: () => {
      toast.success(t('auth.admin.permissionCreated'))
      setDialogOpen(false)
    },
    onError: (err: any) =>
      toast.error(err.message || t('auth.admin.errorCreatePermission')),
  })

  const updatePermission = useUpdatePermission({
    onSuccess: () => {
      toast.success(t('auth.admin.permissionUpdated'))
      setDialogOpen(false)
    },
    onError: (err: any) =>
      toast.error(err.message || t('auth.admin.errorUpdatePermission')),
  })

  const deletePermission = useDeletePermission({
    onSuccess: () => {
      toast.success(t('auth.admin.permissionDeleted'))
      setConfirmDeleteOpen(false)
    },
    onError: (err: any) =>
      toast.error(err.message || t('auth.admin.errorDeletePermission')),
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
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
            }}
          >
            <ShieldIcon sx={{ fontSize: 28 }} />
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
              {t('auth.admin.permissionRegistry')}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
              {t('auth.admin.permissionRegistry_subtitle')}
            </Typography>
          </Box>
        </Box>

        <Stack
          direction='row'
          spacing={1.5}
          sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}
        >
          <Button
            variant='outlined'
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              flex: { xs: 1, sm: 'none' },
              height: 44,
              borderRadius: 2,
            }}
          >
            {t('auth.admin.exportJson')}
          </Button>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
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
              flex: { xs: 1, sm: 'none' },
              height: 44,
              px: 3,
              borderRadius: 2,
            }}
          >
            {t('auth.admin.defineNewAction')}
          </Button>
        </Stack>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* â”€â”€ Category summary cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
              borderRadius: 4,
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
                  borderRadius: '14px',
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
                <Typography variant='h5' sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
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
                borderRadius: 4,
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
                    borderRadius: '14px',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    boxShadow: `0 6px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}
                >
                  {React.cloneElement(getCategoryIcon(cat.label) as any, { fontSize: 'small' })}
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
                  <Typography variant='h5' sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
                    {cat.count}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

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
            placeholder={t('auth.admin.filterPermissions')}
            size='small'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                  borderRadius: 1.5,
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
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                {[
                  t('auth.admin.actionSlug'),
                  t('auth.admin.resource'),
                  t('auth.admin.guard'),
                  t('auth.admin.description'),
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
                  {t('auth.common.actions')}
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align='center' sx={{ py: 10 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align='center' sx={{ py: 12 }}>
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
                          {search || activeCategory
                            ? t('auth.common.noResults')
                            : t('auth.admin.noPermissions')}
                        </Typography>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{ maxWidth: 300, mx: 'auto' }}
                        >
                          {t('auth.admin.noPermissionsHint')}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((perm) => (
                  <TableRow key={perm.id} hover>
                    {/* Slug */}
                    <TableCell>
                      <Chip
                        label={perm.name}
                        size='small'
                        icon={<VpnKeyIcon sx={{ fontSize: '12px !important' }} />}
                        sx={{
                          fontWeight: 700,
                          fontFamily: theme.typography.fontFamily,
                          borderRadius: 1.5,
                          maxWidth: 240,
                          height: 22,
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                        }}
                        color='primary'
                        variant='outlined'
                      />
                    </TableCell>

                    {/* Resource */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ color: 'text.secondary', display: 'flex', fontSize: 16 }}>
                          {React.cloneElement(getCategoryIcon(perm.resource || '') as any, {
                            sx: { fontSize: 18, opacity: 0.7 },
                          })}
                        </Box>
                        <Typography
                          variant='body2'
                          sx={{ fontWeight: 700, textTransform: 'capitalize' }}
                        >
                          {perm.resource || 'â€”'}
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
                          borderRadius: 1.5,
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
                        {perm.description || 'â€”'}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align='right'>
                      <Stack direction='row' spacing={0.5} justifyContent='flex-end'>
                        <Tooltip title={t('auth.admin.editDefinition')}>
                          <IconButton
                            size='small'
                            aria-label={`Edit ${perm.name}`}
                            onClick={() => handleOpenDialog(perm)}
                          >
                            <SettingsIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('auth.common.delete')}>
                          <IconButton
                            size='small'
                            color='error'
                            aria-label={`Delete ${perm.name}`}
                            onClick={() => handleDeleteClick(perm)}
                          >
                            <DeleteIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, pb: 1 }}>
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
          <Button onClick={() => setDialogOpen(false)} sx={{ fontWeight: 700 }}>
            {t('auth.common.cancel')}
          </Button>
          <Button
            variant='contained'
            onClick={handleSave}
            disabled={createPermission.isPending || updatePermission.isPending || !formData.name}
            sx={{ fontWeight: 800, borderRadius: 2, px: 3 }}
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
