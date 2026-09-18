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
import GroupsIcon from '@mui/icons-material/Groups'
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt'
import DeleteIcon from '@mui/icons-material/Delete'

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
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
            }}
          >
            <BusinessIcon sx={{ fontSize: 28 }} />
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
              {t('auth.admin.orgListTitle')}
            </Typography>
            <Typography variant='body2' color='text.primary' sx={{ fontWeight: 600 }}>
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
            height: 44,
            px: 3,
            borderRadius: 2,
            width: { xs: '100%', sm: 'auto' },
            flexShrink: 0,
            bgcolor: 'info.main',
            color: 'info.contrastText',
            boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.2)',
            '&:hover': {
              bgcolor: 'info.dark',
            },
          }}
        >
          {t('auth.admin.newOrg')}
        </Button>
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
            label: t('auth.admin.activeTenants'),
            value: '142', // Mock stat as in original
            icon: <BusinessIcon />,
            color: 'primary' as const,
          },
          {
            label: t('auth.admin.totalUsers'),
            value: '12.4k', // Mock stat as in original
            icon: <GroupsIcon />,
            color: 'info' as const,
          },
          {
            label: t('auth.admin.systemHealth'),
            value: '99.4%', // Mock stat as in original
            icon: <SignalCellularAltIcon />,
            color: 'success' as const,
          },
          {
            label: t('auth.admin.pendingTrials'),
            value: '8', // Mock stat as in original
            icon: <LaunchIcon />,
            color: 'warning' as const,
          },
        ].map((stat, idx) => (
          <Card
            key={idx}
            sx={(theme: any) => ({
              borderRadius: 4,
              transition: 'transform 0.15s ease',
              '&:hover': { transform: 'translateY(-2px)' },
              ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
            })}
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
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TextField
            placeholder={t('auth.common.searchOrgs') || 'Search organizationsâ€¦'}
            size='small'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: { xs: '100%', sm: 340 },
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
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
              color: 'text.primary',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
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
            <TableHead
              sx={{
                bgcolor: (theme) => alpha(theme.palette.action.hover, 0.4),
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <TableRow>
                {[
                  t('auth.admin.colOrganization'),
                  t('auth.common.status'),
                  t('auth.admin.colTier'),
                  t('auth.admin.colMembers'),
                  t('auth.admin.colEnterprise'),
                  t('auth.admin.colHealth'),
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
                  {t('auth.admin.colActions')}
                </TableCell>
              </TableRow>
            </TableHead>

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
                  <TableRow
                    key={org.id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      transition: 'background-color 0.2s ease',
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                      },
                    }}
                  >
                    <TableCell
                      onClick={() =>
                        navigate(Path.admin.organizationProfile.replace(':id', org.id.toString()))
                      }
                      sx={{ cursor: 'pointer', py: 2 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={org.logo_url || undefined}
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
                              color: (theme) =>
                                theme.palette.mode === 'dark'
                                  ? 'rgba(255, 255, 255, 0.9)'
                                  : 'text.secondary',
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
                            borderRadius: 2,
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
                        onClick={(e) => handleMenuOpen(e, org as any)}
                        aria-label={`More options for ${org.name}`}
                      >
                        <MoreVertIcon fontSize='small' />
                      </IconButton>
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
              '& .MuiPaginationItem-root': { fontWeight: 700, borderRadius: 1.5 },
            }}
          />
        </Box>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          handleMenuClose()
          setSelectedOrg(null)
        }}
        PaperProps={{
          sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', minWidth: 200, mt: 1 },
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
        PaperProps={{ sx: { borderRadius: 4, p: 1, backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.375rem', letterSpacing: '-0.02em' }}>
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
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label={t('auth.admin.workspaceSlug')}
              fullWidth
              size='small'
              value={newOrgData.slug}
              onChange={(e) => setNewOrgData({ ...newOrgData, slug: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label={t('auth.admin.domainName')}
              fullWidth
              size='small'
              value={newOrgData.domain}
              onChange={(e) => setNewOrgData({ ...newOrgData, domain: e.target.value })}
              placeholder='nexus-corp.com'
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setCreateOpen(false)}
            sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'none' }}
          >
            {t('auth.common.cancel')}
          </Button>
          {/* â”€â”€ SYSTEM PATTERN: cta_button (info.main) â”€â”€ */}
          <Button
            onClick={handleCreateSubmit}
            variant='contained'
            disabled={createOrgMutation.isPending || !newOrgData.name || !newOrgData.slug}
            sx={{
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              bgcolor: 'info.main',
              color: 'info.contrastText',
              boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.2)',
              '&:hover': { bgcolor: 'info.dark' },
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
        PaperProps={{ sx: { borderRadius: 4, p: 1, backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.375rem', letterSpacing: '-0.02em' }}>
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
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setSuspendDialogOpen(false)}
            sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'none' }}
          >
            {t('auth.common.cancel')}
          </Button>
          <Button
            onClick={handleSuspendConfirm}
            variant='contained'
            color={selectedOrg?.status === 'SUSPENDED' ? 'success' : 'error'}
            disabled={updateOrgMutation.isPending}
            sx={{
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: 2,
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
        PaperProps={{ sx: { borderRadius: 4, p: 1, backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.375rem', letterSpacing: '-0.02em' }}>
          {t('auth.admin.deleteOrganization')}
        </DialogTitle>
        <DialogContent>
          <Typography variant='body1'>
            {t('auth.admin.deleteConfirmPrefix')} <strong>{selectedOrg?.name}</strong>
            {t('auth.admin.deleteConfirmSuffix')}
          </Typography>
          <Alert severity='warning' sx={{ mt: 2 }}>
            {t('auth.admin.deleteWarningMsg')}
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'none' }}
          >
            {t('auth.common.cancel')}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant='contained'
            color='error'
            disabled={deleteOrgMutation.isPending}
            sx={{
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.error.main, 0.4)}`,
            }}
          >
            {deleteOrgMutation.isPending ? t('auth.common.loading') : t('auth.common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
