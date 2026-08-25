import React, { useState, useRef } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, Button, Avatar, Divider, Stack, Tab, Tabs, List, ListItem, ListItemText, ListItemIcon, Switch, FormControlLabel, alpha, CircularProgress, Alert, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

import AdminPanelSettings from '@mui/icons-material/AdminPanelSettings';
import Security from '@mui/icons-material/Security';
import History from '@mui/icons-material/History';
import Block from '@mui/icons-material/Block';
import VpnKey from '@mui/icons-material/VpnKey';
import Login from '@mui/icons-material/Login';
import Info from '@mui/icons-material/Info';
import Edit from '@mui/icons-material/Edit';
import Gavel from '@mui/icons-material/Gavel';
import Verified from '@mui/icons-material/Verified';
import Add from '@mui/icons-material/Add';
import Shield from '@mui/icons-material/Shield';
import Delete from '@mui/icons-material/Delete';
import PriorityHigh from '@mui/icons-material/PriorityHigh';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import { Path } from '@cap/module-auth/routes/path';

import { useUser, useBanUser, useUnbanUser, useImpersonateUser, useResetUserMfa, useAuditLogs, useUpdateUser } from '@idaas/authentication-core/hooks/useAdminQuery';
import { ConfirmationDialog } from '@idaas/authentication-core/components/shared';
import ResetPasswordDialog from '../../../components/ResetPasswordDialog';
import { adminService } from '../../../../authorization-engine/services/adminService';

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
  sx?: any
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, sx, ...other } = props
  return (
    <div role='tabpanel' hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3, ...(sx as any) }}>{children}</Box>}
    </div>
  )
}

export default function AdminUserProfile() {
  const { t } = useTranslation('common')
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [confirmBanOpen, setConfirmBanOpen] = useState(false)
  const [confirmUnbanOpen, setConfirmUnbanOpen] = useState(false)
  const [confirmResetMfaOpen, setConfirmResetMfaOpen] = useState(false)
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)

  React.useEffect(() => {
    if (window.location.hash === '#history') {
      setTab(2)
    }
  }, [])

  const { data, isLoading, isError } = useUser(id)
  const userData = data?.data
  const isSuspended = userData?.status === 'SUSPENDED' || !userData?.isActif

  const banUserMutation = useBanUser()
  const unbanUserMutation = useUnbanUser()
  const impersonateUserMutation = useImpersonateUser()
  const resetMfaMutation = useResetUserMfa()
  const updateUserMutation = useUpdateUser()
  const banLockRef = useRef(false)

  const handleBanAction = () => {
    if (userData) {
      if (isSuspended) {
        setConfirmUnbanOpen(true)
      } else {
        setConfirmBanOpen(true)
      }
    }
  }

  const handleUnbanConfirm = () => {
    if (!userData || unbanUserMutation.isPending) return
    unbanUserMutation.mutate(userData.id, {
      onSuccess: () => {
        setConfirmUnbanOpen(false)
        toast.success('User has been unbanned successfully')
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to unban user')
      },
    })
  }

  const handleBanConfirm = () => {
    if (!userData || banUserMutation.isPending || banLockRef.current) return
    banLockRef.current = true
    banUserMutation.mutate(
      { id: userData.id, reason: 'Admin Manual Action' },
      {
        onSuccess: () => {
          setConfirmBanOpen(false)
          toast.success(t('auth.admin.successBan'))
        },
        onError: (error: any) => {
          toast.error(error.message || t('auth.admin.errorBan'))
        },
        onSettled: () => {
          banLockRef.current = false
        },
      },
    )
  }

  const handleImpersonate = () => {
    if (userData) {
      impersonateUserMutation.mutate(userData.id, {
        onSuccess: (res) => {
          const token = (res.data as any).token || (res as any).token
          if (token) {
            toast.success(t('auth.admin.successImpersonate'))
            const impersonateUrl = `/impersonate?token=${encodeURIComponent(token)}`
            window.open(impersonateUrl, '_blank')
          }
        },
        onError: (error: any) => {
          toast.error(error.message || t('auth.admin.errorImpersonate'))
        },
      })
    }
  }

  const handleResetPassword = () => {
    if (userData) {
      setResetPasswordOpen(true)
    }
  }

  const handleResetMfa = () => {
    if (userData) {
      setConfirmResetMfaOpen(true)
    }
  }

  const handleEditRoles = () => {
    if (userData) {
      navigate(Path.admin.roles)
    }
  }

  const handleViewViolationReports = () => {
    if (userData) {
      setTab(2) // Jump to the History tab where logs/violations exist
    }
  }

  const handleResetMfaConfirm = () => {
    if (userData) {
      resetMfaMutation.mutate(userData.id, {
        onSuccess: () => {
          setConfirmResetMfaOpen(false)
          toast.success(t('auth.admin.successMfaReset'))
        },
        onError: (error: any) => {
          toast.error(error.message || t('auth.admin.errorMfaReset'))
        },
      })
    }
  }

  const handleToggleApiAccess = () => {
    if (userData) {
      updateUserMutation.mutate(
        {
          id: userData.id,
          data: { apiAccessEnabled: !userData.apiAccessEnabled },
        },
        {
          onSuccess: () => {
            toast.success(t('auth.admin.successBan'))
          },
          onError: (error: any) => {
            toast.error(error.message || t('auth.admin.errorBan'))
          },
        },
      )
    }
  }

  const handleToggleMaintenanceBypass = () => {
    if (userData) {
      updateUserMutation.mutate(
        {
          id: userData.id,
          data: { maintenanceModeBypass: !userData.maintenanceModeBypass },
        },
        {
          onSuccess: () => {
            toast.success(t('auth.admin.successBan'))
          },
          onError: (error: any) => {
            toast.error(error.message || t('auth.admin.errorBan'))
          },
        },
      )
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError || !userData) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity='error'>User not found or failed to load.</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Top Banner / Action Area */}
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
              width: { xs: 56, md: 80 },
              height: { xs: 56, md: 80 },
              fontSize: '2rem',
              bgcolor: 'primary.main',
              boxShadow: 3,
            }}
          >
            {userData.firstName?.[0] ?? userData.email?.[0] ?? '?'}
          </Avatar>
          <Box>
            <Typography
              variant='h4'
              sx={{
                fontWeight: 900,
                letterSpacing: '-0.027em',
                fontSize: { xs: '1.5rem', md: '2.125rem' },
              }}
            >
              {userData.firstName} {userData.lastName}
            </Typography>
            <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap'>
              <Typography variant='body2' color='text.secondary'>
                ID: {userData.id} â€¢ {userData.email}
              </Typography>
              <Chip
                label={userData.isActif ? t('auth.common.active') : t('auth.common.inactive')}
                size='small'
                color={userData.isActif ? 'success' : 'default'}
                variant='outlined'
                sx={{ fontWeight: 700, height: 20 }}
              />
            </Stack>
          </Box>
        </Box>
        <Stack
          direction='row'
          spacing={2}
          sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}
        >
          <Button
            variant='contained'
            startIcon={<Login />}
            onClick={handleImpersonate}
            sx={{
              bgcolor: 'info.main',
              color: 'white',
              boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
              '&:hover': { bgcolor: 'info.dark' },
              textTransform: 'none',
              fontWeight: 700,
              flex: { xs: 1, sm: 'none' },
            }}
          >
            {t('auth.admin.impersonate')}
          </Button>
          <Button
            variant='outlined'
            color={isSuspended ? 'success' : 'error'}
            startIcon={<Block />}
            onClick={handleBanAction}
            sx={{ textTransform: 'none', fontWeight: 700, flex: { xs: 1, sm: 'none' } }}
          >
            {isSuspended ? t('auth.admin.unbanUser') : t('auth.admin.banUser')}
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Tabs
          value={tab}
          onChange={(_: React.SyntheticEvent, v: number) => setTab(v)}
          aria-label='admin user tabs'
          sx={{ mb: 2 }}
        >
          <Tab
            label={t('auth.admin.overview').toUpperCase()}
            icon={<Info />}
            iconPosition='start'
            sx={{ fontWeight: 700 }}
          />
          <Tab
            label={t('auth.admin.securityMfa').toUpperCase()}
            icon={<Security />}
            iconPosition='start'
            sx={{ fontWeight: 700 }}
          />
          <Tab
            label={t('auth.admin.history').toUpperCase()}
            icon={<History />}
            iconPosition='start'
            sx={{ fontWeight: 700 }}
          />
          <Tab
            label={t('auth.admin.permissions').toUpperCase()}
            icon={<AdminPanelSettings />}
            iconPosition='start'
            sx={{ fontWeight: 700 }}
          />
        </Tabs>
      </Box>

      <TabPanel value={tab} index={0}>
        <Grid container spacing={3}>
          {/* Main Column */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box
              sx={{
                width: '100%',
              }}
            >
              <Grid size={{ xl: 12 }}>
                <Card
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                    mb: 3,
                    width: '100%',
                  }}
                >
                  <CardContent>
                    <Typography
                      variant='h6'
                      sx={{ fontWeight: 800, mb: 3, textTransform: 'uppercase' }}
                    >
                      {t('auth.admin.basicInfo').toUpperCase()}
                    </Typography>
                    <Grid container spacing={2} columns={12} wrap='wrap' sx={{ width: '100%' }}>
                      <Grid size={{ xs: 12, sm: 4 }} sx={{ minWidth: 0 }}>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {t('auth.admin.statusVerification')}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            mt: 1,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: userData.isActif ? '#22C55E' : '#EF4444',
                              }}
                            />
                            <Typography variant='body2' sx={{ fontWeight: 700 }}>
                              {userData.isActif
                                ? t('auth.common.active')
                                : t('auth.common.inactive')}
                            </Typography>
                          </Box>
                          {userData.emailVerified && (
                            <Chip
                              icon={<Verified sx={{ fontSize: '0.9rem !important' }} />}
                              label={t('auth.common.emailVerified')}
                              size='small'
                              color='success'
                              variant='filled'
                              sx={{ fontWeight: 700, height: 22, fontSize: '0.65rem' }}
                            />
                          )}
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, lg: 4 }} sx={{ minWidth: 0 }}>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {t('auth.admin.regDate')}
                        </Typography>
                        <Typography variant='body2' sx={{ mt: 1, fontWeight: 800 }}>
                          {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, lg: 4 }} sx={{ minWidth: 0 }}>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {t('auth.admin.lastSeen')}
                        </Typography>
                        <Typography variant='body2' sx={{ mt: 1, fontWeight: 800 }}>
                          {userData.updatedAt ? new Date(userData.updatedAt).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Grid>

                      <Grid size={12}>
                        <Divider sx={{ my: 1, opacity: 0.5 }} />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6, lg: 4 }} sx={{ minWidth: 0 }}>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {t('auth.user_form.phone', 'Phone')}
                        </Typography>
                        <Typography variant='body2' sx={{ mt: 1, fontWeight: 800 }}>
                          {userData.phone || '-'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, lg: 4 }} sx={{ minWidth: 0 }}>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {t('auth.admin.gender')}
                        </Typography>
                        <Typography variant='body2' sx={{ mt: 1, fontWeight: 800 }}>
                          {userData.sexe || '-'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              {import.meta.env.DEV && (
                <Grid size={{ xl: 12 }}>
                  <Card
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 'none',
                      bgcolor: (theme) => alpha((theme.palette as any).primary.main, 0.02),
                      mt: 4,
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant='h6'
                        sx={{ fontWeight: 800, mb: 2, textTransform: 'uppercase' }}
                      >
                        {t('auth.admin.internalDebug')}
                      </Typography>
                      <Divider sx={{ my: 1, opacity: 0.5 }} />
                      <Box
                        sx={{
                          color: 'text.secondary',
                          fontFamily: 'monospace',
                          wordBreak: 'break-all',
                          lineHeight: 1.5,
                          bgcolor: (theme) => alpha(theme.palette.text.primary, 0.05),
                          p: 2,
                          borderRadius: 0,
                          width: 'calc(100% + 32px)',
                          mx: -2,
                          mb: -2,
                          overflowX: 'auto',
                        }}
                      >
                        <strong>{t('auth.admin.rawData')}:</strong>
                        <pre style={{ margin: 0, marginTop: '8px' }}>
                          {JSON.stringify(userData, null, 2)}
                        </pre>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Box>
          </Grid>

          {/* Side Panel */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                bgcolor: (theme) => alpha((theme.palette as any).primary.main, 0.02),
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AdminPanelSettings sx={{ color: '#EAB308' }} />
                  <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>
                    {t('auth.admin.moderatorActions').toUpperCase()}
                  </Typography>
                </Box>
                <Stack spacing={2}>
                  <Button
                    fullWidth
                    variant='outlined'
                    startIcon={<Edit />}
                    onClick={handleEditRoles}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none', fontWeight: 700 }}
                  >
                    {t('auth.admin.editRoles')}
                  </Button>
                  <Button
                    fullWidth
                    variant='outlined'
                    startIcon={<VpnKey />}
                    onClick={handleResetPassword}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none', fontWeight: 700 }}
                  >
                    {t('auth.admin.forcePasswordReset')}
                  </Button>
                  <Button
                    fullWidth
                    variant='outlined'
                    startIcon={<Gavel />}
                    onClick={handleViewViolationReports}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none', fontWeight: 700 }}
                  >
                    {t('auth.admin.viewViolationReports')}
                  </Button>
                  <Divider />
                  <Typography variant='caption' sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    {t('auth.admin.quickOverride').toUpperCase()}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userData.apiAccessEnabled}
                        onChange={handleToggleApiAccess}
                        disabled={updateUserMutation.isPending}
                      />
                    }
                    label={t('auth.admin.apiAccessEnabled')}
                    sx={{ '& .MuiFormControlLabel-label': { fontWeight: 600 } }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userData.maintenanceModeBypass}
                        onChange={handleToggleMaintenanceBypass}
                        disabled={updateUserMutation.isPending}
                      />
                    }
                    label={t('auth.admin.maintenanceModeBypass')}
                    sx={{ '& .MuiFormControlLabel-label': { fontWeight: 600 } }}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
          <CardContent>
            <Typography variant='h6' sx={{ fontWeight: 800, mb: 3, textTransform: 'uppercase' }}>
              {t('auth.admin.securityPosture').toUpperCase()}
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Stack direction='row' spacing={2} alignItems='center'>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <Security />
                    </Avatar>
                    <Box>
                      <Typography variant='subtitle2' sx={{ fontWeight: 800 }}>
                        {t('auth.mfa.status')}
                      </Typography>
                      <Chip
                        label={
                          userData.mfaEnabled ? t('auth.common.enabled') : t('auth.common.disabled')
                        }
                        size='small'
                        color={userData.mfaEnabled ? 'success' : 'error'}
                        sx={{ mt: 0.5, fontWeight: 700 }}
                      />
                    </Box>
                  </Stack>
                  <Button
                    color='error'
                    size='small'
                    variant='text'
                    onClick={handleResetMfa}
                    disabled={!userData.mfaEnabled || resetMfaMutation.isPending}
                    sx={{ mt: 1, textTransform: 'none' }}
                  >
                    {t('auth.admin.resetMfa')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <AuditHistoryTab userId={userData.id} />
      </TabPanel>

      <TabPanel value={tab} index={3}>
        <PermissionOverrideTab userId={userData.id} />
      </TabPanel>

      <ConfirmationDialog
        open={confirmBanOpen}
        onClose={() => setConfirmBanOpen(false)}
        onConfirm={handleBanConfirm}
        title={t('auth.admin.confirmBan')}
        message={t('auth.admin.confirmBan_message')}
        confirmLabel={t('auth.admin.banUser')}
        severity='error'
        isSubmitting={banUserMutation.isPending}
      />

      <ConfirmationDialog
        open={confirmUnbanOpen}
        onClose={() => setConfirmUnbanOpen(false)}
        onConfirm={handleUnbanConfirm}
        title={t('auth.admin.confirmUnban')}
        message={t('auth.admin.confirmUnban_message')}
        confirmLabel={t('auth.admin.unbanUser')}
        severity='info'
        isSubmitting={unbanUserMutation.isPending}
      />

      <ConfirmationDialog
        open={confirmResetMfaOpen}
        onClose={() => setConfirmResetMfaOpen(false)}
        onConfirm={handleResetMfaConfirm}
        title={t('auth.admin.confirmResetMfa')}
        message={t('auth.admin.confirmResetMfa_message')}
        confirmLabel={t('auth.admin.resetMfa')}
        severity='warning'
        isSubmitting={resetMfaMutation.isPending}
      />

      <ResetPasswordDialog
        open={resetPasswordOpen}
        onClose={() => setResetPasswordOpen(false)}
        userId={userData.id}
      />
    </Box>
  )
}

// Local UI type that extends MemberOverride with display fields
interface PermissionOverrideUI {
  id: number
  memberId: number
  permissionId: number
  grant: boolean
  resource: string
  action: string
  effect: 'allow' | 'deny'
  organizationId?: number
}

function PermissionOverrideTab({ userId }: { userId: number }) {
  const [overrides, setOverrides] = useState<PermissionOverrideUI[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newOverride, setNewOverride] = useState({ resource: '', action: 'read', effect: 'allow' })
  const [submitting, setSubmitting] = useState(false)

  const fetchOverrides = async () => {
    setLoading(true)
    try {
      const response = await adminService.listOrganizations()
      const orgId = response.data?.data?.[0]?.id ?? 1

      // Mocking the list for UI demonstration
      setOverrides([
        { id: 1, resource: 'vault:secrets', action: 'read', effect: 'allow', memberId: userId, permissionId: 0, grant: true, organizationId: orgId }
      ])
    } catch (error) {
      toast.error('Failed to load permission overrides')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchOverrides()
  }, [userId])

  const handleAddOverride = async () => {
    setSubmitting(true)
    try {
      // Map UI fields to service signature: { permissionId, grant }
      await adminService.addMemberOverride(userId, 1, {
        permissionId: 0, // Would be a real permissionId from a permission picker
        grant: newOverride.effect === 'allow',
      })
      toast.success('Override added successfully')
      setAddDialogOpen(false)
      fetchOverrides()
    } catch (error) {
      toast.error('Failed to add override')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteOverride = async (overrideId: number) => {
    try {
      await adminService.removeMemberOverride(userId, 1, overrideId)
      toast.info('Override removed')
      fetchOverrides()
    } catch (error) {
      toast.error('Failed to remove override')
    }
  }

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant='h6' sx={{ fontWeight: 800, textTransform: 'uppercase', mb: 0.5 }}>
              Permission Overrides
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Directly grant or deny specific permissions for this user, bypassing role assignments.
            </Typography>
          </Box>
          <Button
            variant='contained'
            startIcon={<Add />}
            onClick={() => setAddDialogOpen(true)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: 'info.main' }}
          >
            Add Override
          </Button>
        </Box>

        <Paper variant='outlined' sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>
          ) : (
            <List disablePadding>
              {overrides.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant='body2' color='text.secondary'>No active overrides for this user.</Typography>
                </Box>
              ) : (
                overrides.map((override, idx) => (
                  <React.Fragment key={override.id}>
                    <ListItem sx={{ py: 2, px: 3 }}>
                      <ListItemIcon>
                        <Shield color={override.effect === 'allow' ? 'success' : 'error'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant='body2' sx={{ fontWeight: 800 }}>
                              {override.resource}
                            </Typography>
                            <Chip label={override.action} size='small' variant='outlined' sx={{ height: 20, fontWeight: 700 }} />
                          </Box>
                        }
                        secondary={
                          <Typography variant='caption' sx={{ color: override.effect === 'allow' ? 'success.main' : 'error.main', fontWeight: 800 }}>
                            EFFECT: {override.effect.toUpperCase()}
                          </Typography>
                        }
                      />
                      <Stack direction='row' spacing={1}>
                        <IconButton size='small' color='error' onClick={() => handleDeleteOverride(override.id)}>
                          <Delete fontSize='small' />
                        </IconButton>
                      </Stack>
                    </ListItem>
                    {idx < overrides.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </List>
          )}
        </Paper>

        <Alert severity='warning' icon={<PriorityHigh />} sx={{ mt: 4, borderRadius: 3 }}>
          <Typography variant='caption' sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
            Security Warning
          </Typography>
          <Typography variant='caption'>
            Permission overrides represent a deviation from standard RBAC/ABAC policies. They should be used sparingly for emergency access or temporary troubleshooting.
          </Typography>
        </Alert>
      </CardContent>

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>ADD PERMISSION OVERRIDE</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            fullWidth
            label="Resource"
            placeholder="e.g. vault:secrets"
            value={newOverride.resource}
            onChange={(e) => setNewOverride({ ...newOverride, resource: e.target.value })}
            size="small"
          />
          <TextField
            fullWidth
            label="Action"
            placeholder="e.g. read"
            value={newOverride.action}
            onChange={(e) => setNewOverride({ ...newOverride, action: e.target.value })}
            size="small"
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              fullWidth
              variant={newOverride.effect === 'allow' ? 'contained' : 'outlined'}
              color="success"
              onClick={() => setNewOverride({ ...newOverride, effect: 'allow' })}
            >
              Allow
            </Button>
            <Button
              fullWidth
              variant={newOverride.effect === 'deny' ? 'contained' : 'outlined'}
              color="error"
              onClick={() => setNewOverride({ ...newOverride, effect: 'deny' })}
            >
              Deny
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddOverride} disabled={!newOverride.resource || submitting}>
            {submitting ? <CircularProgress size={20} /> : 'Save Override'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

function AuditHistoryTab({ userId }: { userId: number }) {
  const { t } = useTranslation()
  const { data, isLoading } = useAuditLogs({ user_id: userId, limit: 50 })
  const logs = data?.data?.logs ?? []

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
      <CardContent>
        <Typography variant='h6' sx={{ fontWeight: 800, mb: 3, textTransform: 'uppercase' }}>
          {t('auth.admin.history').toUpperCase()}
        </Typography>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : logs.length === 0 ? (
          <Alert severity='info'>{t('auth.admin.noAuditLogs')}</Alert>
        ) : (
          <List disablePadding>
            {logs.map((log: any, idx: number) => (
              <React.Fragment key={log.id}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <History fontSize='small' color='action' />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>
                        {log.action?.replace(/_/g, ' ')}
                      </Typography>
                    }
                    secondary={
                      <Typography variant='caption' color='text.secondary'>
                        {new Date(log.createdAt).toLocaleString()}
                        {log.ipAddress ? ` Â· IP: ${log.ipAddress}` : ''}
                      </Typography>
                    }
                  />
                  {log.impersonatedBy && (
                    <Chip label='Impersonated' size='small' color='warning' sx={{ ml: 1 }} />
                  )}
                </ListItem>
                {idx < logs.length - 1 && <Divider component='li' />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  )
}

