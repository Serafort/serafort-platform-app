import React, { useState } from 'react'
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
  Tooltip,
  useTheme,
  alpha,
  Pagination,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Container,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import AddIcon from '@mui/icons-material/Add'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import BusinessIcon from '@mui/icons-material/Business'
import LaunchIcon from '@mui/icons-material/Launch'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import BlockIcon from '@mui/icons-material/Block'
import DeleteIcon from '@mui/icons-material/Delete'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Path } from '@cap/module-auth/routes/path'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'
import { secureTokenManager } from '@cap/platform-core'
import {
  useOrganizations,
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
  useImpersonateOrganization,
} from '@idaas/authentication-core/hooks/useAdminQuery'

import { Organization } from '@auth/authorization-engine/services/adminService'
import {
  AdminTableCard,
  AdminTableHead,
  AdminTableHeadCell,
  AdminTableRow,
} from '@auth/modules/authentication-core/components/shared/admin'

export default function OrganizationListDashboard() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const theme = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)

  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [newOrgData, setNewOrgData] = useState({ name: '', slug: '', domain: '' })

  const {
    data: orgsResponse,
    isLoading,
    refetch,
  } = useOrganizations({
    search: searchTerm || undefined,
    page,
    limit: 5,
  })

  const createOrgMutation = useCreateOrganization({
    onSuccess: () => {
      setCreateOpen(false)
      setNewOrgData({ name: '', slug: '', domain: '' })
      refetch()
    },
  })

  const impersonateMutation = useImpersonateOrganization({
    onSuccess: (response) => {
      const data = response.data
      if (data?.token) {
        secureTokenManager.setTokens({
          accessToken: data.token,
          expiresAt: Date.now() + 3600 * 1000, // Default to 1 hour
        })
        window.location.href = '/' // Redirect to dashboard
      }
    },
  })

  const updateOrgMutation = useUpdateOrganization({
    onSuccess: () => {
      setSuspendDialogOpen(false)
      handleMenuClose()
      refetch()
    },
  })

  const deleteOrgMutation = useDeleteOrganization({
    onSuccess: () => {
      setDeleteDialogOpen(false)
      handleMenuClose()
      refetch()
    },
  })

  // Handle both raw array response and paginated response formats
  const responseData = orgsResponse?.data as any
  const orgs = (Array.isArray(responseData) ? responseData : responseData?.data) || []
  const meta = responseData?.meta

  const handleCreateSubmit = () => {
    if (!newOrgData.name || !newOrgData.slug) return
    createOrgMutation.mutate(newOrgData)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, org: Organization) => {
    setAnchorEl(event.currentTarget)
    setSelectedOrg(org)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleImpersonate = () => {
    if (selectedOrg?.id) {
      impersonateMutation.mutate(selectedOrg.id)
    }
    handleMenuClose()
  }

  const handleSuspendConfirm = () => {
    if (selectedOrg?.id) {
      updateOrgMutation.mutate({
        id: selectedOrg.id,
        data: { status: selectedOrg.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED' },
      })
    }
  }

  const handleDeleteConfirm = () => {
    if (selectedOrg?.id) {
      deleteOrgMutation.mutate(selectedOrg.id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Container maxWidth='xl' sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2.5,
            mb: 4,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 'var(--sf-radius-lg, 24px)',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BusinessIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography
                variant='h4'
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  mb: 0.5,
                }}
              >
                {t('auth.admin.orgListTitle')}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {t('auth.admin.orgListSubtitle')}
              </Typography>
            </Box>
          </Box>

          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              minHeight: 48,
              px: 3,
              borderRadius: 'var(--sf-radius-md, 8px)',
              width: { xs: '100%', sm: 'auto' },
              flexShrink: 0,
              boxShadow: 'none',
            }}
          >
            {t('auth.admin.newOrg')}
          </Button>
        </Box>

      <AdminTableCard
        sx={(theme) => ({
          ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
        })}
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
            placeholder={t('auth.common.searchOrgs') || 'Search organizations…'}
            size='small'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: { xs: '100%', sm: 340 },
              '& .MuiOutlinedInput-root': {
                minHeight: 44,
                borderRadius: 'var(--sf-radius-md, 8px)',
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            startIcon={<FilterListIcon />}
            sx={{
              minHeight: 44,
              px: 2.5,
              color: 'text.primary',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 'var(--sf-radius-md, 8px)',
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
            }}
          >
            {t('auth.common.filters')}
          </Button>
        </Box>

        <Divider sx={{ opacity: 0.5 }} />

        {/* Table */}
        <TableContainer sx={{ borderRadius: 0, boxShadow: 'none' }}>
          <Table sx={{ minWidth: 800 }}>
            <AdminTableHead>
              <TableRow>
                {[
                  t('auth.admin.colOrganization'),
                  t('auth.common.status'),
                  t('auth.admin.colTier'),
                  t('auth.admin.colMembers'),
                  t('auth.admin.colEnterprise'),
                  t('auth.admin.colHealth'),
                ].map((col) => (
                  <AdminTableHeadCell key={col} sx={{ py: 2.5 }}>
                    {col}
                  </AdminTableHeadCell>
                ))}
                <AdminTableHeadCell align='right'>
                  {t('auth.admin.colActions')}
                </AdminTableHeadCell>
              </TableRow>
            </AdminTableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align='center' sx={{ py: 10 }}>
                    <Typography variant='body2' color='text.secondary'>
                      {t('auth.common.loading')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : orgs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align='center' sx={{ py: 10 }}>
                    <Typography variant='body2' color='text.secondary'>
                      {t('auth.common.noResults')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orgs.map((org: Organization) => (
                  <AdminTableRow
                    key={org.id}
                    clickable
                    onClick={() =>
                      navigate(Path.admin.organizationProfile.replace(':id', org.id.toString()))
                    }
                    aria-label={org.name}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={org.logo_url || undefined}
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 'var(--sf-radius-md, 8px)',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            fontWeight: 800,
                            fontSize: '0.95rem',
                          }}
                        >
                          {org.name[0]}
                        </Avatar>
                        <Box>
                          <Typography
                            variant='body2'
                            sx={{ fontWeight: 700, color: 'text.primary' }}
                          >
                            {org.name}
                          </Typography>
                          <Typography
                            variant='caption'
                            sx={{
                              display: 'block',
                              fontWeight: 700,
                              color: 'text.secondary',
                            }}
                          >
                            /{org.slug}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={
                          org.status === 'SUSPENDED'
                            ? t('auth.common.suspended')
                            : t('auth.common.active')
                        }
                        size='small'
                        sx={{
                          fontWeight: 800,
                          height: 22,
                          fontSize: '0.625rem',
                          borderRadius: 'var(--sf-radius-xs, 4px)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                          color: org.status === 'SUSPENDED' ? 'error.main' : 'success.main',
                          borderColor: alpha(
                            org.status === 'SUSPENDED'
                              ? theme.palette.error.main
                              : theme.palette.success.main,
                            0.25,
                          ),
                          bgcolor: alpha(
                            org.status === 'SUSPENDED'
                              ? theme.palette.error.main
                              : theme.palette.success.main,
                            0.12,
                          ),
                          border: '1px solid',
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 700 }}>
                        {t('auth.admin.colEnterprise')}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {typeof org.members_count === 'number'
                          ? org.members_count.toLocaleString()
                          : '0'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Tooltip
                        title={org.domain ? `SSO Enabled for ${org.domain}` : 'Password Only'}
                      >
                        <Box
                          sx={{
                            color: org.domain ? 'success.main' : 'text.disabled',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <VpnKeyIcon sx={{ fontSize: 18 }} />
                        </Box>
                      </Tooltip>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 4,
                            bgcolor: alpha(theme.palette.divider, 0.1),
                            borderRadius: 'var(--sf-radius-xs, 4px)',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              bgcolor: 'success.main',
                            }}
                          />
                        </Box>
                        <Typography
                          variant='caption'
                          sx={{ fontWeight: 800, color: 'text.primary' }}
                        >
                          100%
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell align='right'>
                      <IconButton
                        size='small'
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMenuOpen(e, org as any)
                        }}
                        aria-label={`More options for ${org.name}`}
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 'var(--sf-radius-md, 8px)',
                        }}
                      >
                        <MoreVertIcon fontSize='small' />
                      </IconButton>
                    </TableCell>
                  </AdminTableRow>
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
            justifyContent: 'center',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Pagination
            count={meta?.lastPage || meta?.last_page || 1}
            page={page}
            onChange={(_, v) => setPage(v)}
            size='small'
            color='primary'
            sx={{
              '& .MuiPaginationItem-root': {
                fontWeight: 700,
                borderRadius: 'var(--sf-radius-xs, 4px)',
              },
            }}
          />
        </Box>
      </AdminTableCard>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          handleMenuClose()
          setSelectedOrg(null)
        }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 'var(--sf-radius-md, 8px)',
              boxShadow: 'var(--sf-shadow-lg)',
              minWidth: 200,
              mt: 1,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose()
            if (selectedOrg?.id) {
              navigate(Path.admin.organizationProfile.replace(':id', selectedOrg.id.toString()))
            }
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize='small' />
          </ListItemIcon>
          {t('auth.admin.editProfile')}
        </MenuItem>
        <MenuItem onClick={handleImpersonate}>
          <ListItemIcon>
            <LaunchIcon fontSize='small' />
          </ListItemIcon>
          {t('auth.admin.loginAsAdmin')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose()
            setSuspendDialogOpen(true)
          }}
          sx={{ color: selectedOrg?.status === 'SUSPENDED' ? 'success.main' : 'error.main' }}
        >
          <ListItemIcon>
            {selectedOrg?.status === 'SUSPENDED' ? (
              <LaunchIcon fontSize='small' color='success' />
            ) : (
              <BlockIcon fontSize='small' color='error' />
            )}
          </ListItemIcon>
          {selectedOrg?.status === 'SUSPENDED'
            ? t('auth.admin.activateTenant')
            : t('auth.admin.suspendTenant')}
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem
          onClick={() => {
            handleMenuClose()
            setDeleteDialogOpen(true)
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize='small' color='error' />
          </ListItemIcon>
          {t('auth.admin.deleteOrganization')}
        </MenuItem>
      </Menu>

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth='xs'
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 'var(--sf-radius-lg, 16px)',
              p: 1,
              backgroundImage: 'none',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
          {t('auth.admin.newOrg')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label={t('auth.admin.organizationName')}
              fullWidth
              size='small'
              value={newOrgData.name}
              onChange={(e) => setNewOrgData({ ...newOrgData, name: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  minHeight: 44,
                  borderRadius: 'var(--sf-radius-md, 8px)',
                },
              }}
            />
            <TextField
              label={t('auth.admin.workspaceSlug')}
              fullWidth
              size='small'
              value={newOrgData.slug}
              onChange={(e) => setNewOrgData({ ...newOrgData, slug: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  minHeight: 44,
                  borderRadius: 'var(--sf-radius-md, 8px)',
                },
              }}
            />
            <TextField
              label={t('auth.admin.domainName')}
              fullWidth
              size='small'
              value={newOrgData.domain}
              onChange={(e) => setNewOrgData({ ...newOrgData, domain: e.target.value })}
              placeholder='nexus-corp.com'
              sx={{
                '& .MuiOutlinedInput-root': {
                  minHeight: 44,
                  borderRadius: 'var(--sf-radius-md, 8px)',
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setCreateOpen(false)}
            sx={{
              minHeight: 44,
              px: 2.5,
              fontWeight: 600,
              color: 'text.secondary',
              textTransform: 'none',
              borderRadius: 'var(--sf-radius-md, 8px)',
            }}
          >
            {t('auth.common.cancel')}
          </Button>
          <Button
            onClick={handleCreateSubmit}
            variant='contained'
            disabled={createOrgMutation.isPending || !newOrgData.name || !newOrgData.slug}
            sx={{
              minHeight: 44,
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 'var(--sf-radius-md, 8px)',
              px: 3,
              boxShadow: 'none',
            }}
          >
            {createOrgMutation.isPending ? t('auth.common.loading') : t('auth.admin.create')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={suspendDialogOpen}
        onClose={() => {
          setSuspendDialogOpen(false)
          setSelectedOrg(null)
        }}
        maxWidth='xs'
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 'var(--sf-radius-lg, 16px)',
              p: 1,
              backgroundImage: 'none',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
          {selectedOrg?.status === 'SUSPENDED'
            ? t('auth.admin.activateTenant')
            : t('auth.admin.suspendTenant')}
        </DialogTitle>
        <DialogContent>
          <Typography variant='body1'>
            {selectedOrg?.status === 'SUSPENDED' ? (
              <>
                {t('auth.admin.activateConfirmPrefix')} <strong>{selectedOrg?.name}</strong>
                {t('auth.admin.activateConfirmSuffix')}
              </>
            ) : (
              <>
                {t('auth.admin.suspendConfirmPrefix')} <strong>{selectedOrg?.name}</strong>
                {t('auth.admin.suspendConfirmSuffix')}
              </>
            )}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setSuspendDialogOpen(false)}
            sx={{
              minHeight: 44,
              px: 2.5,
              fontWeight: 600,
              color: 'text.secondary',
              textTransform: 'none',
              borderRadius: 'var(--sf-radius-md, 8px)',
            }}
          >
            {t('auth.common.cancel')}
          </Button>
          <Button
            onClick={handleSuspendConfirm}
            variant='contained'
            color={selectedOrg?.status === 'SUSPENDED' ? 'success' : 'error'}
            disabled={updateOrgMutation.isPending}
            sx={{
              minHeight: 44,
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 'var(--sf-radius-md, 8px)',
              px: 3,
            }}
          >
            {updateOrgMutation.isPending
              ? t('auth.common.loading')
              : selectedOrg?.status === 'SUSPENDED'
                ? t('auth.admin.activate')
                : t('auth.admin.suspend')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setSelectedOrg(null)
        }}
        maxWidth='xs'
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 'var(--sf-radius-lg, 16px)',
              p: 1,
              backgroundImage: 'none',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
          {t('auth.admin.deleteOrganization')}
        </DialogTitle>
        <DialogContent>
          <Typography variant='body1'>
            {t('auth.admin.deleteConfirmPrefix')} <strong>{selectedOrg?.name}</strong>
            {t('auth.admin.deleteConfirmSuffix')}
          </Typography>
          <Alert
            severity='warning'
            sx={{
              mt: 2,
              borderRadius: 'var(--sf-radius-md, 12px)',
            }}
          >
            {t('auth.admin.deleteWarningMsg')}
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              minHeight: 44,
              px: 2.5,
              fontWeight: 600,
              color: 'text.secondary',
              textTransform: 'none',
              borderRadius: 'var(--sf-radius-md, 8px)',
            }}
          >
            {t('auth.common.cancel')}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant='contained'
            color='error'
            disabled={deleteOrgMutation.isPending}
            sx={{
              minHeight: 44,
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 'var(--sf-radius-md, 8px)',
              px: 3,
            }}
          >
            {deleteOrgMutation.isPending ? t('auth.common.loading') : t('auth.common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </motion.div>
  )
}
