import { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  alpha,
  useTheme,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Skeleton,
} from '@mui/material'
import Search from '@mui/icons-material/Search'
import Add from '@mui/icons-material/Add'
import Delete from '@mui/icons-material/Delete'
import Layers from '@mui/icons-material/Layers'
import Edit from '@mui/icons-material/Edit'
import VpnKey from '@mui/icons-material/VpnKey'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { AuthScope } from '@auth/modules/authorization-engine/services/adminService'
import {
  useScopes,
  useCreateScope,
  useUpdateScope,
  useDeleteScope,
} from '@idaas/authentication-core/hooks/useAdminQuery'

export default function ScopesRegistry() {
  const theme = useTheme()
  const { t } = useTranslation('common')
  const [searchTerm, setSearchTerm] = useState('')

  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingScope, setEditingScope] = useState<AuthScope | null>(null)
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
  })

  // Queries & Mutations
  const { data: scopesResponse, isLoading } = useScopes()
  const createScope = useCreateScope()
  const updateScope = useUpdateScope()
  const deleteScope = useDeleteScope()

  const openForm = (scope?: AuthScope) => {
    if (scope) {
      setEditingScope(scope)
      setFormData({
        name: scope.name,
        displayName: scope.displayName || '',
        description: scope.description || '',
      })
    } else {
      setEditingScope(null)
      setFormData({ name: '', displayName: '', description: '' })
    }
    setIsDialogOpen(true)
  }

  const closeForm = () => {
    setIsDialogOpen(false)
    setEditingScope(null)
  }

  const handleFormSubmit = () => {
    if (!formData.name) {
      toast.error(t('auth.developer.nameRequired', 'Scope name is required.'), {})
      return
    }

    if (editingScope) {
      updateScope.mutate(
        { id: Number(editingScope.id), data: formData },
        {
          onSuccess: () => {
            toast.success(t('auth.developer.scopeUpdated', 'Scope updated successfully.'), {})
            closeForm()
          },
          onError: () => {
            toast.error(t('auth.developer.scopeUpdateFailed', 'Failed to update scope.'), {})
          },
        },
      )
    } else {
      createScope.mutate(formData, {
        onSuccess: () => {
          toast.success(t('auth.developer.scopeCreated', 'Scope created successfully.'), {})
          closeForm()
        },
        onError: () => {
          toast.error(t('auth.developer.scopeCreateFailed', 'Failed to create scope.'), {})
        },
      })
    }
  }

  const handleDelete = () => {
    if (deleteConfirmationId !== null) {
      deleteScope.mutate(deleteConfirmationId, {
        onSuccess: () => {
          toast.success(t('auth.developer.scopeDeleted', 'Scope deleted successfully.'), {})
          setDeleteConfirmationId(null)
        },
        onError: () => {
          toast.error(t('auth.developer.scopeDeleteFailed', 'Failed to delete scope.'), {})
        },
      })
    }
  }

  const filtered = useMemo(() => {
    const scopeList = scopesResponse?.data || []
    return scopeList.filter(
      (s: AuthScope) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()),
    )
  }, [scopesResponse?.data, searchTerm])

  const isSaving = createScope.isPending || updateScope.isPending

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      {/* â”€â”€ Page Header â”€â”€ */}
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <VpnKey color='primary' sx={{ fontSize: 28 }} />
          <Box>
            <Typography
              variant='h4'
              sx={{ fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.15 }}
            >
              {t('auth.developer.scopesRegistry', 'Scopes Registry')}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
              {t(
                'auth.developer.scopesDesc',
                'Define OAuth2/OIDC scopes and map them to internal granular permissions.',
              )}
            </Typography>
          </Box>
        </Box>

        <Button
          variant='contained'
          startIcon={<Add />}
          onClick={() => openForm()}
          sx={{
            bgcolor: 'info.main',
            color: 'white',
            boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
            '&:hover': { bgcolor: 'info.dark' },
            textTransform: 'none',
            fontWeight: 700,
            height: 44,
            px: 3,
            flexShrink: 0,
          }}
        >
          {t('auth.developer.createScope', 'Create New Scope')}
        </Button>
      </Box>

      {/* â”€â”€ Main Table Card â”€â”€ */}
      <Paper
        sx={{
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
          overflow: 'hidden',
        }}
      >
        {/* Toolbar */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <TextField
            placeholder={t('auth.developer.searchScopes', 'Search scopesâ€¦')}
            size='small'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ maxWidth: 400, flex: 1 }}
          />
          <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto', fontWeight: 700 }}>
            {filtered.length} {t('auth.developer.results', 'results')}
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: alpha(theme.palette.action.hover, 0.3) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>
                  {t('auth.developer.scopeName', 'Scope Name')}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('auth.developer.type', 'Type')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  {t('auth.developer.mappedPermissions', 'Mapped Permissions')}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  {t('auth.developer.description', 'Description')}
                </TableCell>
                <TableCell align='right' sx={{ fontWeight: 700 }}>
                  {t('auth.developer.actions', 'Actions')}
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                Array.from(new Array(3)).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton width='60%' />
                    </TableCell>
                    <TableCell>
                      <Skeleton width='40px' height='20px' variant='rounded' />
                    </TableCell>
                    <TableCell>
                      <Skeleton width='100px' />
                    </TableCell>
                    <TableCell>
                      <Skeleton width='80%' />
                    </TableCell>
                    <TableCell align='right'>
                      <Skeleton width='60px' sx={{ display: 'inline-block' }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length > 0 ? (
                filtered.map((scope: AuthScope) => (
                  <TableRow key={scope.id} hover>
                    {/* Scope Name */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Layers sx={{ fontSize: 18 }} />
                        </Box>
                        <Box>
                          <Typography variant='body2' sx={{ fontWeight: 800 }}>
                            {scope.name}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {scope.displayName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Type chip */}
                    <TableCell>
                      <Chip
                        label={
                          scope.isSystem
                            ? t('auth.developer.system', 'System')
                            : t('auth.developer.custom', 'Custom')
                        }
                        size='small'
                        sx={{
                          fontWeight: 900,
                          height: 20,
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                          bgcolor: alpha(
                            theme.palette[scope.isSystem ? 'secondary' : 'primary'].main,
                            0.12,
                          ),
                          color: scope.isSystem ? 'secondary.main' : 'primary.main',
                          border: 'none',
                        }}
                      />
                    </TableCell>

                    {/* Permission chips */}
                    <TableCell>
                      <Stack direction='row' spacing={0.5} flexWrap='wrap' useFlexGap>
                        {scope.permissionsMapping && scope.permissionsMapping.length > 0 ? (
                          scope.permissionsMapping.map((perm: string) => (
                            <Chip
                              key={perm}
                              label={perm}
                              size='small'
                              variant='outlined'
                              sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                            />
                          ))
                        ) : (
                          <Typography variant='body2' color='text.disabled'>
                            {t('auth.developer.noMappedPermissions', 'None')}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>

                    {/* Description */}
                    <TableCell>
                      <Typography variant='body2' color='text.secondary'>
                        {scope.description}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align='right'>
                      <Stack direction='row' spacing={1} justifyContent='flex-end'>
                        <Tooltip title={t('auth.developer.editScope', 'Edit Scope')}>
                          <IconButton size='small' onClick={() => openForm(scope)}>
                            <Edit fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        {!scope.isSystem && (
                          <Tooltip title={t('auth.developer.deleteScope', 'Delete Scope')}>
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() => setDeleteConfirmationId(Number(scope.id))}
                            >
                              <Delete fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                /* â”€â”€ Empty State â”€â”€ */
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6 }}>
                    <Layers sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                    <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
                      {t('auth.developer.noScopes', 'No scopes match your search.')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* â”€â”€ Info Tip â”€â”€ */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.info.main, 0.05),
          border: '1px solid',
          borderColor: alpha(theme.palette.info.main, 0.1),
        }}
      >
        <Typography
          variant='subtitle2'
          sx={{
            fontWeight: 800,
            mb: 0.5,
            color: 'info.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          PLATFORM TIP
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
          System scopes (openid, profile, email) are protected and cannot be deleted. Custom scopes
          can be freely mapped to any granular permission string your backend enforces.
        </Typography>
      </Box>

      {/* â”€â”€ Scope Create/Edit Dialog â”€â”€ */}
      <Dialog open={isDialogOpen} onClose={closeForm} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingScope
            ? t('auth.developer.editScopeTitle', 'Edit Scope')
            : t('auth.developer.createScopeTitle', 'Create Scope')}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label={t('auth.developer.formScopeName', 'Scope Name')}
              required
              fullWidth
              disabled={!!editingScope?.isSystem}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder='e.g. read:finances'
            />
            <TextField
              label={t('auth.developer.formDisplayName', 'Display Name')}
              fullWidth
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder='e.g. Finance Access'
            />
            <TextField
              label={t('auth.developer.formDescription', 'Description')}
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeForm} color='inherit' sx={{ fontWeight: 700 }}>
            {t('auth.common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleFormSubmit}
            variant='contained'
            disabled={isSaving}
            sx={{ fontWeight: 700, px: 3 }}
          >
            {isSaving ? (
              <CircularProgress size={24} color='inherit' />
            ) : (
              t('auth.common.save', 'Save')
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* â”€â”€ Delete Confirmation Dialog â”€â”€ */}
      <Dialog open={deleteConfirmationId !== null} onClose={() => setDeleteConfirmationId(null)}>
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>
          {t('auth.developer.deleteScopeConfirmTitle', 'Delete Scope')}
        </DialogTitle>
        <DialogContent>
          <Typography variant='body2'>
            {t(
              'auth.developer.deleteScopeConfirmDesc',
              'Are you sure you want to delete this scope? This action cannot be undone and may break applications relying on it.',
            )}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteConfirmationId(null)}
            color='inherit'
            sx={{ fontWeight: 700 }}
          >
            {t('auth.common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleDelete}
            color='error'
            variant='contained'
            disabled={deleteScope.isPending}
            sx={{ fontWeight: 700 }}
          >
            {deleteScope.isPending ? (
              <CircularProgress size={24} color='inherit' />
            ) : (
              t('auth.common.delete', 'Delete')
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
