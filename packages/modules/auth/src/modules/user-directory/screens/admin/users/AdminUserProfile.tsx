// AdminUserProfile.tsx
// High-fidelity User Details & Administration Screen matching the visual design of profile.tsx

import React, { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Avatar,
  Divider,
  Stack,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  alpha,
  useTheme,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Skeleton,
  Paper,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import SecurityIcon from '@mui/icons-material/Security'
import LockResetIcon from '@mui/icons-material/LockReset'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import DeleteIcon from '@mui/icons-material/Delete'
import HistoryIcon from '@mui/icons-material/History'
import DevicesIcon from '@mui/icons-material/Devices'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import BusinessIcon from '@mui/icons-material/Business'
import WorkIcon from '@mui/icons-material/Work'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import LanguageIcon from '@mui/icons-material/Language'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import FingerprintIcon from '@mui/icons-material/Fingerprint'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'

import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import Path from '../../path'
import {
  useUserDetailQuery,
  useUserSessionsQuery,
  useUserActivityQuery,
  useRolesQuery,
} from '../../../hooks/useUserDirectoryQuery'
import {
  useUpdateUserStatusMutation,
  useSendPasswordResetMutation,
  useResetMfaMutation,
} from '../../../hooks/useUserDirectoryMutations'
import { getPlainErrorMessage } from '../../../types/api.types'
import { UserStatus } from '../../../types/userDirectory.types'

import EditUserDrawer from '../../../components/EditUserDrawer'
import AssignRolesModal from '../../../components/AssignRolesModal'
import DeleteUserDialog from '../../../components/DeleteUserDialog'

export default function AdminUserProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const theme = useTheme()
  const { t } = useTranslation('common')
  const [activeTab, setActiveTab] = useState<number>(0)

  // Dialog & Drawer States
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [isAssignRolesOpen, setIsAssignRolesOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Query Hooks
  const {
    data: userDetailResponse,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
    refetch: refetchUser,
  } = useUserDetailQuery(id)

  const { data: sessionsResponse, isLoading: isSessionsLoading } = useUserSessionsQuery(id)
  const { data: activityResponse, isLoading: isActivityLoading } = useUserActivityQuery(id)
  const { data: rolesResponse } = useRolesQuery()

  // Mutations
  const updateStatusMutation = useUpdateUserStatusMutation({
    onSuccess: () => refetchUser(),
  })
  const sendPasswordResetMutation = useSendPasswordResetMutation()
  const resetMfaMutation = useResetMfaMutation()

  const user = userDetailResponse?.data
  const sessions = sessionsResponse?.data || []
  const activityLogs = activityResponse?.data || []

  const isSuspended = user?.status === 'SUSPENDED' || user?.status === 'BANNED'

  const handleToggleStatus = () => {
    if (!user || !id) return
    const nextStatus: UserStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    updateStatusMutation.mutate({
      id,
      data: {
        status: nextStatus,
        reason: `Status changed by admin to ${nextStatus}`,
      },
    })
  }

  const handleSendResetPassword = () => {
    if (id) sendPasswordResetMutation.mutate(id)
  }

  const handleResetMfa = () => {
    if (id) resetMfaMutation.mutate(id)
  }

  if (isUserLoading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        <Skeleton variant='text' width={120} height={32} sx={{ mb: 2 }} />
        <Card sx={{ p: 4, borderRadius: 'var(--sf-radius-lg, 12px)', mb: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems='center'>
            <Skeleton variant='circular' width={80} height={80} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant='text' width={220} height={36} />
              <Skeleton variant='text' width={300} height={24} />
            </Box>
          </Stack>
        </Card>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant='rectangular' height={260} sx={{ borderRadius: 'var(--sf-radius-lg, 12px)' }} />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton variant='rectangular' height={260} sx={{ borderRadius: 'var(--sf-radius-lg, 12px)' }} />
          </Grid>
        </Grid>
      </Box>
    )
  }

  if (isUserError || !user) {
    return (
      <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Alert
          severity='error'
          action={
            <Button color='inherit' size='small' sx={{ minHeight: 44 }} onClick={() => refetchUser()}>
              {t('auth.userDirectory.userProfile.retry', 'Retry')}
            </Button>
          }
        >
          {getPlainErrorMessage(userError) ||
            t('auth.userDirectory.userProfile.loadError', 'Failed to load user profile. The user may not exist.')}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(Path.admin.users.list)}
          sx={{
            mt: 2,
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 'var(--sf-radius-md, 8px)',
            minHeight: 44,
          }}
        >
          {t('auth.userDirectory.userProfile.backToUserDirectory', 'Back to User Directory')}
        </Button>
      </Box>
    )
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      sx={{ p: { xs: 2, md: 4 }, maxWidth: 1280, mx: 'auto' }}
    >
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(Path.admin.users.list)}
        sx={{
          mb: 2.5,
          textTransform: 'none',
          fontWeight: 700,
          color: 'text.secondary',
          minHeight: 44,
          borderRadius: 'var(--sf-radius-md, 8px)',
          '&:hover': { color: 'primary.main', bgcolor: 'transparent' },
        }}
      >
        {t('auth.userDirectory.userProfile.backToUserDirectory', 'Back to User Directory')}
      </Button>

      {/* Main Profile Header Card */}
      <Card
        sx={{
          borderRadius: 'var(--sf-radius-lg, 16px)',
          p: { xs: 2.5, md: 4 },
          mb: 3.5,
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.04)}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent='space-between'
        >
          {/* User Info Avatar & Name */}
          <Stack direction='row' spacing={2.5} alignItems='center'>
            <Avatar
              src={user.avatarUrl || undefined}
              sx={{
                width: 80,
                height: 80,
                borderRadius: 'var(--sf-radius-lg, 24px)',
                bgcolor: theme.palette.primary.main,
                fontSize: '1.75rem',
                fontWeight: 700,
                boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
              }}
            >
              {user.firstName?.[0] || user.fullName?.[0] || 'U'}
            </Avatar>

            <Box>
              <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap' mb={0.5}>
                <Typography variant='h5' fontWeight={800} letterSpacing='-0.02em'>
                  {user.fullName || `${user.firstName} ${user.lastName}`}
                </Typography>

                {user.status === 'ACTIVE' ? (
                  <Chip
                    size='small'
                    label={t('auth.userDirectory.userProfile.active', 'Active')}
                    color='success'
                    icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                    sx={{ fontWeight: 700, borderRadius: 'var(--sf-radius-xs, 4px)' }}
                  />
                ) : user.status === 'SUSPENDED' ? (
                  <Chip
                    size='small'
                    label={t('auth.userDirectory.userProfile.suspended', 'Suspended')}
                    color='warning'
                    icon={<BlockIcon sx={{ fontSize: '14px !important' }} />}
                    sx={{ fontWeight: 700, borderRadius: 'var(--sf-radius-xs, 4px)' }}
                  />
                ) : (
                  <Chip
                    size='small'
                    label={user.status}
                    sx={{ fontWeight: 600, borderRadius: 'var(--sf-radius-xs, 4px)' }}
                  />
                )}

                {user.isEmailVerified && (
                  <Chip
                    size='small'
                    label={t('auth.userDirectory.userProfile.verified', 'Verified')}
                    color='info'
                    variant='outlined'
                    icon={<VerifiedUserIcon sx={{ fontSize: '14px !important' }} />}
                    sx={{ fontWeight: 600, borderRadius: 'var(--sf-radius-xs, 4px)' }}
                  />
                )}
              </Stack>

              <Typography variant='body2' color='text.secondary'>
                {user.email} {user.jobTitle ? `• ${user.jobTitle}` : ''}{' '}
                {user.department ? `(${user.department})` : ''}
              </Typography>

              <Stack direction='row' spacing={1} mt={1} flexWrap='wrap'>
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((r, idx) => (
                    <Chip
                      key={idx}
                      label={typeof r === 'object' ? r.name : r}
                      size='small'
                      variant='outlined'
                      color='primary'
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        borderRadius: 'var(--sf-radius-xs, 4px)',
                      }}
                    />
                  ))
                ) : (
                  <Chip
                    label={t('auth.userDirectory.userProfile.user', 'User')}
                    size='small'
                    variant='outlined'
                    sx={{ borderRadius: 'var(--sf-radius-xs, 4px)' }}
                  />
                )}
              </Stack>
            </Box>
          </Stack>

          {/* Action Buttons */}
          <Stack direction='row' spacing={1.5} flexWrap='wrap' sx={{ mt: { xs: 2, md: 0 } }}>
            <Button
              variant='outlined'
              startIcon={<EditIcon />}
              onClick={() => setIsEditDrawerOpen(true)}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 'var(--sf-radius-md, 8px)',
                minHeight: 44,
                px: 2,
              }}
            >
              {t('auth.userDirectory.userProfile.editProfile', 'Edit Profile')}
            </Button>
            <Button
              variant='outlined'
              startIcon={<AdminPanelSettingsIcon />}
              onClick={() => setIsAssignRolesOpen(true)}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 'var(--sf-radius-md, 8px)',
                minHeight: 44,
                px: 2,
              }}
            >
              {t('auth.userDirectory.userProfile.assignRoles', 'Assign Roles')}
            </Button>
            <Button
              variant='contained'
              color={user.status === 'ACTIVE' ? 'warning' : 'success'}
              startIcon={user.status === 'ACTIVE' ? <BlockIcon /> : <CheckCircleIcon />}
              onClick={handleToggleStatus}
              disabled={updateStatusMutation.isPending}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 'var(--sf-radius-md, 8px)',
                minHeight: 44,
                px: 2.5,
              }}
            >
              {user.status === 'ACTIVE'
                ? t('auth.userDirectory.userProfile.suspend', 'Suspend')
                : t('auth.userDirectory.userProfile.activate', 'Activate')}
            </Button>
            <IconButton
              color='error'
              aria-label={t('auth.userDirectory.userProfile.deleteUser', 'Delete user')}
              onClick={() => setIsDeleteDialogOpen(true)}
              sx={{
                border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                borderRadius: 'var(--sf-radius-md, 8px)',
                width: 44,
                height: 44,
                minWidth: 44,
                minHeight: 44,
              }}
            >
              <DeleteIcon fontSize='small' />
            </IconButton>
          </Stack>
        </Stack>
      </Card>

      {/* Quick Security Metrics Row */}
      <Grid container spacing={2.5} mb={3.5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 'var(--sf-radius-lg, 16px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: 'none',
              bgcolor: alpha(theme.palette.background.paper, 0.8),
            }}
          >
            <Stack direction='row' spacing={1.5} alignItems='center'>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 'var(--sf-radius-md, 8px)',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                }}
              >
                <DevicesIcon fontSize='small' />
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary' fontWeight={600}>
                  {t('auth.userDirectory.userProfile.activeSessions', 'Active Sessions')}
                </Typography>
                <Typography variant='h6' fontWeight={700}>
                  {user.securitySummary?.activeSessionsCount || sessions.length || 1}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 'var(--sf-radius-lg, 16px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: 'none',
              bgcolor: alpha(theme.palette.background.paper, 0.8),
            }}
          >
            <Stack direction='row' spacing={1.5} alignItems='center'>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 'var(--sf-radius-md, 8px)',
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: 'success.main',
                }}
              >
                <FingerprintIcon fontSize='small' />
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary' fontWeight={600}>
                  {t('auth.userDirectory.userProfile.passkeysConfigured', 'Passkeys Configured')}
                </Typography>
                <Typography variant='h6' fontWeight={700}>
                  {user.securitySummary?.passkeysCount || 0}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 'var(--sf-radius-lg, 16px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: 'none',
              bgcolor: alpha(theme.palette.background.paper, 0.8),
            }}
          >
            <Stack direction='row' spacing={1.5} alignItems='center'>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 'var(--sf-radius-md, 8px)',
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  color: 'info.main',
                }}
              >
                <ShieldOutlinedIcon fontSize='small' />
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary' fontWeight={600}>
                  {t('auth.userDirectory.userProfile.twoFactorMfa', 'Two-Factor (MFA)')}
                </Typography>
                <Typography variant='h6' fontWeight={700}>
                  {user.mfaEnabled ? t('auth.userDirectory.userProfile.mfaEnrolled', 'Enrolled') : t('auth.userDirectory.userProfile.mfaDisabled', 'Disabled')}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 'var(--sf-radius-lg, 16px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: 'none',
              bgcolor: alpha(theme.palette.background.paper, 0.8),
            }}
          >
            <Stack direction='row' spacing={1.5} alignItems='center'>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 'var(--sf-radius-md, 8px)',
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  color: 'warning.main',
                }}
              >
                <AccessTimeIcon fontSize='small' />
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary' fontWeight={600}>
                  {t('auth.userDirectory.userProfile.lastLogin', 'Last Login')}
                </Typography>
                <Typography variant='body2' fontWeight={700} noWrap>
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })
                    : t('auth.userDirectory.userProfile.never', 'Never')}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Container */}
      <Card
        sx={{
          borderRadius: 'var(--sf-radius-lg, 16px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.04)}`,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ px: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            sx={{
              minHeight: 48,
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
              },
            }}
          >
            <Tab icon={<PersonIcon fontSize='small' />} iconPosition='start' label={t('auth.userDirectory.userProfile.overview', 'Overview')} />
            <Tab
              icon={<AdminPanelSettingsIcon fontSize='small' />}
              iconPosition='start'
              label={t('auth.userDirectory.userProfile.rolesPermissions', 'Roles & Permissions')}
            />
            <Tab
              icon={<DevicesIcon fontSize='small' />}
              iconPosition='start'
              label={t('auth.userDirectory.userProfile.activeSessions', 'Active Sessions')}
            />
            <Tab
              icon={<HistoryIcon fontSize='small' />}
              iconPosition='start'
              label={t('auth.userDirectory.userProfile.activityLog', 'Activity Log')}
            />
            <Tab
              icon={<SecurityIcon fontSize='small' />}
              iconPosition='start'
              label={t('auth.userDirectory.userProfile.securityActions', 'Security Actions')}
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 3.5 }}>
          {/* Tab 0: Overview */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='subtitle2' fontWeight={700} mb={2}>
                  {t('auth.userDirectory.userProfile.personalContactInformation', 'Personal & Contact Information')}
                </Typography>
                <Paper
                  variant='outlined'
                  sx={{
                    p: 2.5,
                    borderRadius: 'var(--sf-radius-md, 8px)',
                    borderColor: alpha(theme.palette.divider, 0.1),
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction='row' spacing={1.5} alignItems='center'>
                      <PersonIcon fontSize='small' color='action' />
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          {t('auth.userDirectory.userProfile.fullName', 'Full Name')}
                        </Typography>
                        <Typography variant='body2' fontWeight={600}>
                          {user.fullName || `${user.firstName} ${user.lastName}`}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction='row' spacing={1.5} alignItems='center'>
                      <EmailIcon fontSize='small' color='action' />
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          {t('auth.userDirectory.userProfile.emailAddress', 'Email Address')}
                        </Typography>
                        <Typography variant='body2' fontWeight={600}>
                          {user.email}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction='row' spacing={1.5} alignItems='center'>
                      <PhoneIcon fontSize='small' color='action' />
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          {t('auth.userDirectory.userProfile.phoneNumber', 'Phone Number')}
                        </Typography>
                        <Typography variant='body2' fontWeight={600}>
                          {user.phoneNumber || t('auth.userDirectory.userProfile.notProvided', 'Not provided')}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction='row' spacing={1.5} alignItems='center'>
                      <LocationOnIcon fontSize='small' color='action' />
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          {t('auth.userDirectory.userProfile.location', 'Location')}
                        </Typography>
                        <Typography variant='body2' fontWeight={600}>
                          {user.location || t('auth.userDirectory.userProfile.notProvided', 'Not provided')}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='subtitle2' fontWeight={700} mb={2}>
                  {t('auth.userDirectory.userProfile.organizationLocalization', 'Organization & Localization')}
                </Typography>
                <Paper
                  variant='outlined'
                  sx={{
                    p: 2.5,
                    borderRadius: 'var(--sf-radius-md, 8px)',
                    borderColor: alpha(theme.palette.divider, 0.1),
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction='row' spacing={1.5} alignItems='center'>
                      <BusinessIcon fontSize='small' color='action' />
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          {t('auth.userDirectory.userProfile.departmentCompany', 'Department & Company')}
                        </Typography>
                        <Typography variant='body2' fontWeight={600}>
                          {user.department || t('auth.userDirectory.userProfile.notProvided', 'Not provided')}{' '}
                          {user.company ? `• ${user.company}` : ''}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction='row' spacing={1.5} alignItems='center'>
                      <WorkIcon fontSize='small' color='action' />
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          {t('auth.userDirectory.userProfile.jobTitle', 'Job Title')}
                        </Typography>
                        <Typography variant='body2' fontWeight={600}>
                          {user.jobTitle || t('auth.userDirectory.userProfile.notProvided', 'Not provided')}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction='row' spacing={1.5} alignItems='center'>
                      <LanguageIcon fontSize='small' color='action' />
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          {t('auth.userDirectory.userProfile.localeLanguage', 'Locale & Language')}
                        </Typography>
                        <Typography variant='body2' fontWeight={600}>
                          {user.locale || 'en-us'}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction='row' spacing={1.5} alignItems='center'>
                      <AccessTimeIcon fontSize='small' color='action' />
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          {t('auth.userDirectory.userProfile.timezone', 'Timezone')}
                        </Typography>
                        <Typography variant='body2' fontWeight={600}>
                          {user.timezone || 'UTC'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>

              {user.bio && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant='subtitle2' fontWeight={700} mb={1}>
                    {t('auth.userDirectory.userProfile.biographyNotes', 'Biography / Notes')}
                  </Typography>
                  <Paper
                    variant='outlined'
                    sx={{
                      p: 2.5,
                      borderRadius: 'var(--sf-radius-md, 8px)',
                      bgcolor: alpha(theme.palette.background.default, 0.4),
                    }}
                  >
                    <Typography variant='body2'>{user.bio}</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}

          {/* Tab 1: Roles & Permissions */}
          {activeTab === 1 && (
            <Stack spacing={3}>
              <Stack direction='row' justifyContent='space-between' alignItems='center'>
                <Box>
                  <Typography variant='subtitle2' fontWeight={700}>
                    {t('auth.userDirectory.userProfile.assignedTenantRoles', 'Assigned Tenant Roles')}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {t('auth.userDirectory.userProfile.rolesDetermineEffectiveAuthorization', 'Roles determine effective authorization rules across resources')}
                  </Typography>
                </Box>
                <Button
                  size='small'
                  variant='outlined'
                  startIcon={<AdminPanelSettingsIcon />}
                  onClick={() => setIsAssignRolesOpen(true)}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  {t('auth.userDirectory.userProfile.modifyRoles', 'Modify Roles')}
                </Button>
              </Stack>

              <Grid container spacing={2}>
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <Grid key={role.id} size={{ xs: 12, sm: 6 }}>
                      <Paper
                        variant='outlined'
                        sx={{
                          p: 2.5,
                          borderRadius: 'var(--sf-radius-md, 8px)',
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          bgcolor: alpha(theme.palette.primary.main, 0.02),
                        }}
                      >
                        <Stack direction='row' spacing={1.5} alignItems='center' mb={1}>
                          <SecurityIcon color='primary' fontSize='small' />
                          <Typography variant='subtitle2' fontWeight={700}>
                            {role.name}
                          </Typography>
                        </Stack>
                        <Typography variant='caption' color='text.secondary'>
                          {role.description || t('auth.userDirectory.userProfile.roleFallbackDescription', 'Assigned tenant security role')}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))
                ) : (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity='info'>
                      {t('auth.userDirectory.userProfile.noCustomRolesAssigned', 'No custom roles assigned. User has default tenant access.')}
                    </Alert>
                  </Grid>
                )}
              </Grid>

              {/* Effective Permissions Tags */}
              <Box mt={2}>
                <Typography variant='subtitle2' fontWeight={700} mb={1.5}>
                  {t('auth.userDirectory.userProfile.effectiveGrantedPermissions', 'Effective Granted Permissions:')}
                </Typography>
                <Stack direction='row' flexWrap='wrap' gap={1}>
                  {(user.permissions || ['users:view', 'profile:read', 'sessions:manage']).map(
                    (perm, idx) => (
                      <Chip
                        key={idx}
                        label={perm}
                        size='small'
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          bgcolor: alpha(theme.palette.text.primary, 0.06),
                        }}
                      />
                    ),
                  )}
                </Stack>
              </Box>
            </Stack>
          )}

          {/* Tab 2: Active Sessions */}
          {activeTab === 2 && (
            <Stack spacing={2.5}>
              <Typography variant='subtitle2' fontWeight={700}>
                {t('auth.userDirectory.userProfile.connectedDevicesSessions', 'Connected Devices & Sessions')}
              </Typography>

              {isSessionsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : sessions.length === 0 ? (
                <Alert severity='info'>{t('auth.userDirectory.userProfile.noActiveSessionsFound', 'No active sessions found for this user.')}</Alert>
              ) : (
                <List sx={{ p: 0 }}>
                  {sessions.map((sess, idx) => (
                    <Paper
                      key={sess.id || idx}
                      variant='outlined'
                      sx={{ p: 2, mb: 1.5, borderRadius: 'var(--sf-radius-md, 8px)' }}
                    >
                      <Stack direction='row' justifyContent='space-between' alignItems='center'>
                        <Stack direction='row' spacing={2} alignItems='center'>
                          <DevicesIcon color='action' />
                          <Box>
                            <Stack direction='row' spacing={1} alignItems='center'>
                              <Typography variant='body2' fontWeight={700}>
                                {sess.device || sess.browser || t('auth.userDirectory.userProfile.unknownBrowser', 'Web browser')} •{' '}
                                {sess.os || t('auth.userDirectory.userProfile.unknownOs', 'Desktop')}
                              </Typography>
                              {sess.isCurrent && (
                                <Chip
                                  label={t('auth.userDirectory.userProfile.currentSession', 'Current Session')}
                                  size='small'
                                  color='success'
                                  sx={{ height: 20 }}
                                />
                              )}
                            </Stack>
                            <Typography variant='caption' color='text.secondary'>
                              IP: {sess.ipAddress || '127.0.0.1'} • Last active:{' '}
                              {new Date(sess.lastActiveAt || sess.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </List>
              )}
            </Stack>
          )}

          {/* Tab 3: Activity Log */}
          {activeTab === 3 && (
            <Stack spacing={2.5}>
              <Typography variant='subtitle2' fontWeight={700}>
                {t('auth.userDirectory.userProfile.auditActivityTimeline', 'Audit & Activity Timeline')}
              </Typography>

              {isActivityLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : activityLogs.length === 0 ? (
                <Alert severity='info'>{t('auth.userDirectory.userProfile.noRecentActivityLogs', 'No recent activity logs recorded for this account.')}</Alert>
              ) : (
                <List sx={{ p: 0 }}>
                  {activityLogs.map((log, idx) => (
                    <Paper
                      key={log.id || idx}
                      variant='outlined'
                      sx={{ p: 2, mb: 1.5, borderRadius: 'var(--sf-radius-md, 8px)' }}
                    >
                      <Stack direction='row' spacing={2} alignItems='center'>
                        <HistoryIcon color='action' fontSize='small' />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant='body2' fontWeight={600}>
                            {log.action}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {log.description}
                          </Typography>
                        </Box>
                        <Typography variant='caption' color='text.secondary'>
                          {new Date(log.createdAt).toLocaleString()}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </List>
              )}
            </Stack>
          )}

          {/* Tab 4: Security Actions */}
          {activeTab === 4 && (
            <Stack spacing={3}>
              <Typography variant='subtitle2' fontWeight={700}>
                {t('auth.userDirectory.userProfile.administrativeSecurityOverrides', 'Administrative Security Overrides')}
              </Typography>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper variant='outlined' sx={{ p: 2.5, borderRadius: 'var(--sf-radius-md, 8px)' }}>
                    <Typography variant='subtitle2' fontWeight={700} gutterBottom>
                      {t('auth.userDirectory.userProfile.triggerPasswordReset', 'Trigger Password Reset')}
                    </Typography>
                    <Typography variant='caption' color='text.secondary' display='block' mb={2}>
                      {t(
                        'auth.userDirectory.userProfile.resetHint',
                        'Dispatches an email containing a secure token for the user to set a new password.',
                      )}
                    </Typography>
                    <Button
                      variant='outlined'
                      startIcon={<LockResetIcon />}
                      onClick={handleSendResetPassword}
                      disabled={sendPasswordResetMutation.isPending}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        minHeight: 44,
                        borderRadius: 'var(--sf-radius-md, 8px)',
                      }}
                    >
                      {t('auth.userDirectory.userProfile.sendPasswordResetLink', 'Send Password Reset Link')}
                    </Button>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper
                    variant='outlined'
                    sx={{ p: 2.5, borderRadius: 'var(--sf-radius-md, 12px)' }}
                  >
                    <Typography variant='subtitle2' fontWeight={700} gutterBottom>
                      {t('auth.userDirectory.userProfile.resetMfaEnrollment', 'Reset MFA Enrollment')}
                    </Typography>
                    <Typography variant='caption' color='text.secondary' display='block' mb={2}>
                      {t(
                        'auth.userDirectory.userProfile.mfaResetHint',
                        'Clears authenticator apps and passkeys, requiring the user to re-enroll next login.',
                      )}
                    </Typography>
                    <Button
                      variant='outlined'
                      color='warning'
                      startIcon={<VpnKeyIcon />}
                      onClick={handleResetMfa}
                      disabled={resetMfaMutation.isPending}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        minHeight: 44,
                        borderRadius: 'var(--sf-radius-md, 8px)',
                      }}
                    >
                      {t('auth.userDirectory.userProfile.resetTwoFactorAuthentication', 'Reset Two-Factor Authentication')}
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </Stack>
          )}
        </Box>
      </Card>

      {/* Wired Modals & Drawers */}
      <EditUserDrawer
        open={isEditDrawerOpen}
        userId={user.id}
        initialUser={user}
        onClose={() => setIsEditDrawerOpen(false)}
        onSuccess={() => refetchUser()}
      />

      <AssignRolesModal
        open={isAssignRolesOpen}
        userId={user.id}
        userName={user.fullName}
        currentRoles={user.roles}
        onClose={() => setIsAssignRolesOpen(false)}
        onSuccess={() => refetchUser()}
      />

      <DeleteUserDialog
        open={isDeleteDialogOpen}
        user={user}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={() => navigate(Path.admin.users.list)}
      />
    </Box>
  )
}
