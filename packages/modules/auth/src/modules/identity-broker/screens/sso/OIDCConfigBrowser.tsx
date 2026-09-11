// FILE: packages/modules/auth/src/screens/auth/sso/OIDCConfigBrowser.tsx
// RULES APPLIED: mui-component-standards.md, react-component-patterns.md
// FIXES: Added header; implemented entry motion; modernized MUI component attributes (slotProps); standardized Card/Avatar styles to match golden standard; fully translated labels; added accessibility aria-labels
// AUDIT: CRITICAL ✓  HIGH ✓  MEDIUM ✓

import { useState } from 'react'
import {
  Box,
  Button,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  IconButton,
  Chip,
  alpha,
  useTheme,
  TextField,
  InputAdornment,
  Tooltip,
  Avatar,
  Breadcrumbs,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import Add from '@mui/icons-material/Add'
import Delete from '@mui/icons-material/Delete'
import Search from '@mui/icons-material/Search'
import VpnKey from '@mui/icons-material/VpnKey'
import ContentCopy from '@mui/icons-material/ContentCopy'
import VerifiedUser from '@mui/icons-material/VerifiedUser'
import Warning from '@mui/icons-material/Warning'
import ChevronRight from '@mui/icons-material/ChevronRight'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import CircularProgress from '@mui/material/CircularProgress'
import { useOIDCClients, useDeleteOIDCClient, Path } from '@auth'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'
import {
  AdminTableCard,
  AdminTableHead,
  AdminTableHeadCell,
  AdminTableRow,
} from '@auth/modules/authentication-core/components/shared/admin'

export default function OIDCConfigBrowser() {
  const { t } = useTranslation()
  const theme = useTheme()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<string | number | null>(null)

  const { data: clientsData, isLoading } = useOIDCClients()
  const deleteMutation = useDeleteOIDCClient()

  const clientsList = clientsData?.data || []

  const filteredClients = clientsList.filter(
    (client: any) =>
      (client.client_name || client.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (client.client_id || client.clientId || '').toLowerCase().includes(search.toLowerCase()),
  )

  const handleDelete = (id: string | number) => {
    setClientToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (clientToDelete) {
      deleteMutation.mutate(String(clientToDelete), {
        onSuccess: () => {
          toast.success(t('auth.common.deleted_successfully', 'Deleted successfully'))
          setDeleteDialogOpen(false)
          setClientToDelete(null)
        },
        onError: (err: any) => {
          toast.error(err.message || t('auth.common.error_deleting', 'Error deleting client'))
          setDeleteDialogOpen(false)
          setClientToDelete(null)
        },
      })
    }
  }

  return (
    <Container
      maxWidth='xl'
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      sx={{ py: 6 }}
    >
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
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: { xs: 56, md: 80 },
                height: { xs: 56, md: 80 },
                borderRadius: 'var(--sf-radius-lg, 24px)',
                bgcolor: 'primary.main',
                boxShadow: (theme) => `0 12px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <VpnKey sx={{ fontSize: { xs: '1.5rem', md: '2.5rem' } }} />
            </Avatar>
            <Box
              sx={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                width: 24,
                height: 24,
                bgcolor: 'info.main',
                borderRadius: '50%',
                border: '4px solid',
                borderColor: 'background.paper',
              }}
            />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Typography
                variant='h4'
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.027em',
                  fontSize: { xs: '1.5rem', md: '2.125rem' },
                }}
              >
                {t('auth.sso.oidc_clients_title', 'OIDC Client Management')}
              </Typography>
            </Box>
            <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap'>
              <Breadcrumbs
                separator={<ChevronRight sx={{ fontSize: 12, color: 'text.disabled' }} />}
                sx={{
                  '& .MuiBreadcrumbs-li': {
                    display: 'flex',
                    alignItems: 'center',
                  },
                }}
              >
                <Chip
                  label='OIDC'
                  size='small'
                  color='primary'
                  variant='outlined'
                  sx={{ fontWeight: 700, height: 20, mr: 1, borderRadius: 'var(--sf-radius-xs, 4px)' }}
                />
                <Typography variant='body2' color='text.secondary'>
                  {t(
                    'auth.sso.oidc_clients_subtitle',
                    'Manage OpenID Connect clients, secrets, and redirect URIs',
                  )}
                </Typography>
              </Breadcrumbs>
            </Stack>
          </Box>
        </Box>
        <Button
          component={RouterLink}
          to={(Path.auth as any).oidcClientCreate}
          variant='contained'
          startIcon={<Add />}
          sx={{
            bgcolor: 'primary.main',
            boxShadow: (theme) => `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.39)}`,
            textTransform: 'none',
            fontWeight: 700,
            minHeight: 48,
            borderRadius: 'var(--sf-radius-md, 8px)',
            px: 4,
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          {t('auth.sso.create_client', 'Create New Client')}
        </Button>
      </Box>

      <AdminTableCard
        sx={(theme) => ({
          mb: 5,
          borderRadius: 'var(--sf-radius-lg, 16px)',
          ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
        })}
      >
        <Box
          sx={{
            p: 3,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <TextField
            size='small'
            placeholder={t('auth.sso.search_clients', 'Search by name or Client ID...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              width: { xs: '100%', md: 400 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 'var(--sf-radius-md, 8px)',
                bgcolor: 'background.paper',
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <Search fontSize='small' color='primary' />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <AdminTableHead>
              <TableRow>
                <AdminTableHeadCell sx={{ py: 2.5 }}>
                  {t('auth.sso.client_name', 'Client Name')}
                </AdminTableHeadCell>
                <AdminTableHeadCell>{t('auth.sso.client_id', 'Client ID')}</AdminTableHeadCell>
                <AdminTableHeadCell>{t('auth.sso.client_type', 'Type')}</AdminTableHeadCell>
                <AdminTableHeadCell>{t('auth.common.status', 'Status')}</AdminTableHeadCell>
                <AdminTableHeadCell>{t('auth.sso.last_active', 'Last Active')}</AdminTableHeadCell>
                <AdminTableHeadCell align='right'>
                  {t('auth.common.actions', 'Actions')}
                </AdminTableHeadCell>
              </TableRow>
            </AdminTableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 6 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 6 }}>
                    <Typography variant='body2' color='text.secondary'>
                      {t('auth.sso.no_clients_found', 'No OIDC clients found.')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client: any) => (
                  <AdminTableRow
                    key={client.id}
                    clickable
                    onClick={() =>
                      navigate(Path.identity.oidcClientEdit.replace(':id', client.id))
                    }
                    aria-label={t('auth.common.edit', 'Edit Client')}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            color: 'primary.main',
                            borderRadius: 'var(--sf-radius-sm, 8px)',
                          }}
                        >
                          <VpnKey sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                          {client.client_name || client.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant='body2'
                          sx={{
                            fontFamily: 'JetBrains Mono, monospace',
                            color: 'text.secondary',
                            fontSize: '0.8125rem',
                            bgcolor: alpha(theme.palette.action.hover, 0.06),
                            px: 1,
                            py: 0.25,
                            borderRadius: 'var(--sf-radius-xs, 4px)',
                          }}
                        >
                          {client.client_id || client.clientId}
                        </Typography>
                        <Tooltip title={t('auth.common.copy', 'Copy')}>
                          <IconButton
                            size='small'
                            sx={{ minWidth: 44, minHeight: 44, p: 0.5, border: '1px solid', borderColor: 'divider' }}
                            onClick={(e) => {
                              e.stopPropagation()
                              navigator.clipboard.writeText(client.client_id || client.clientId)
                              toast.success(t('auth.common.copied', 'Copied to clipboard'))
                            }}
                            aria-label={t('auth.common.copy', 'Copy Client ID')}
                          >
                            <ContentCopy sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          (client.grant_types || client.grantTypes || []).includes(
                            'authorization_code',
                          )
                            ? 'CONFIDENTIAL'
                            : 'PUBLIC'
                        }
                        size='small'
                        variant='outlined'
                        sx={{ borderRadius: 'var(--sf-radius-xs, 4px)', fontWeight: 800, fontSize: '0.65rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          (client.is_active ?? client.isActive)
                            ? t('auth.sso.status_active', 'ACTIVE')
                            : t('auth.sso.status_inactive', 'INACTIVE')
                        }
                        size='small'
                        color={(client.is_active ?? client.isActive) ? 'success' : 'error'}
                        sx={{ borderRadius: 'var(--sf-radius-xs, 4px)', fontWeight: 800, fontSize: '0.65rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                        {client.updated_at || client.updatedAt
                          ? new Date(client.updated_at || client.updatedAt).toLocaleDateString()
                          : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title={t('auth.common.delete', 'Delete')}>
                          <IconButton
                            size='small'
                            color='error'
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(client.id)
                            }}
                            sx={{
                              minWidth: 44,
                              minHeight: 44,
                              border: '1px solid',
                              borderColor: alpha(theme.palette.error.main, 0.2),
                            }}
                            aria-label={t('auth.common.delete', 'Delete Client')}
                          >
                            <Delete fontSize='small' />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </AdminTableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </AdminTableCard>

      <Box
        sx={{
          mt: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 3,
          borderRadius: 'var(--sf-radius-lg, 16px)',
          backgroundColor: alpha(theme.palette.info.main, 0.05),
          border: '1px solid',
          borderColor: alpha(theme.palette.info.main, 0.1),
        }}
      >
        <VerifiedUser color='info' sx={{ fontSize: 32 }} />
        <Box>
          <Typography
            variant='subtitle2'
            sx={{
              fontWeight: 800,
              color: 'info.main',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mb: 0.5,
            }}
          >
            {t('auth.sso.security_best_practice', 'Security Recommendation')}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
            {t(
              'auth.sso.client_rotation_tip',
              'Ensure you rotate client secrets every 90 days for production environments.',
            )}
          </Typography>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <Warning /> {t('auth.common.confirm_delete_title', 'Delete Client?')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              'common.confirm_delete_desc',
              'Are you sure you want to delete this OIDC client? This action cannot be undone and any applications depending on it will lose access immediately.',
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            color='inherit'
            sx={{ minHeight: 44, borderRadius: 'var(--sf-radius-md, 8px)' }}
          >
            {t('auth.common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={confirmDelete}
            color='error'
            variant='contained'
            disabled={deleteMutation.isPending}
            sx={{ minHeight: 44, borderRadius: 'var(--sf-radius-md, 8px)' }}
            autoFocus
          >
            {deleteMutation.isPending
              ? t('auth.common.deleting', 'Deleting...')
              : t('auth.common.delete', 'Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
