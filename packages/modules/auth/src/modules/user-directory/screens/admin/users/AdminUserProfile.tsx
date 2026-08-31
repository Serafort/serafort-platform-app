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
        <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />
        <Card sx={{ p: 4, borderRadius: 3, mb: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
            <Skeleton variant="circular" width={80} height={80} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width={220} height={36} />
              <Skeleton variant="text" width={300} height={24} />
            </Box>
          </Stack>
        </Card>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      </Box>
    )
  }

  if (isUserError || !user) {
    return (
      <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetchUser()}>
              Retry
            </Button>
          }
        >
          {(userError as any)?.message || 'Failed to load user profile. The user may not exist.'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/users')}
          sx={{ mt: 2, textTransform: 'none' }}
        >
          Back to User Directory
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1280, mx: 'auto' }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/admin/users')}
        sx={{
          mb: 2.5,
          textTransform: 'none',
          fontWeight: 600,
          color: 'text.secondary',
          '&:hover': { color: 'text.primary' },
        }}
      >
        Back to User Directory
      </Button>

      {/* Main Profile Header Card */}
      <Card
        sx={{
          borderRadius: 3,
          p: { xs: 2.5, md: 4 },
          mb: 3.5,
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.04)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
        >
          {/* User Info Avatar & Name */}
          <Stack direction="row" spacing={2.5} alignItems="center">
            <Avatar
              src={user.avatarUrl || undefined}
              sx={{
                width: 80,
                height: 80,
                bgcolor: theme.palette.primary.main,
                fontSize: '1.75rem',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
            >
              {user.firstName?.[0] || user.fullName?.[0] || 'U'}
            </Avatar>

            <Box>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" mb={0.5}>
                <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em">
                  {user.fullName || `${user.firstName} ${user.lastName}`}
                </Typography>

                {user.status === 'ACTIVE' ? (
                  <Chip
                    size="small"
                    label="Active"
                    color="success"
                    icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                    sx={{ fontWeight: 700 }}
                  />
                ) : user.status === 'SUSPENDED' ? (
                  <Chip
                    size="small"
                    label="Suspended"
                    color="warning"
                    icon={<BlockIcon sx={{ fontSize: '14px !important' }} />}
                    sx={{ fontWeight: 700 }}
                  />
                ) : (
                  <Chip size="small" label={user.status} sx={{ fontWeight: 600 }} />
                )}

                {user.isEmailVerified && (
                  <Chip
                    size="small"
                    label="Verified"
                    color="info"
                    variant="outlined"
                    icon={<VerifiedUserIcon sx={{ fontSize: '14px !important' }} />}
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Stack>

              <Typography variant="body2" color="text.secondary">
                {user.email} {user.jobTitle ? `• ${user.jobTitle}` : ''}{' '}
                {user.department ? `(${user.department})` : ''}
              </Typography>

              <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((r, idx) => (
                    <Chip
                      key={idx}
                      label={typeof r === 'object' ? r.name : r}
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                    />
                  ))
                ) : (
                  <Chip label="User" size="small" variant="outlined" />
                )}
              </Stack>
            </Box>
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mt: { xs: 2, md: 0 } }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setIsEditDrawerOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
            >
              Edit Profile
            </Button>
            <Button
              variant="outlined"
              startIcon={<AdminPanelSettingsIcon />}
              onClick={() => setIsAssignRolesOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
            >
              Assign Roles
            </Button>
            <Button
              variant="contained"
              color={user.status === 'ACTIVE' ? 'warning' : 'success'}
              startIcon={user.status === 'ACTIVE' ? <BlockIcon /> : <CheckCircleIcon />}
              onClick={handleToggleStatus}
              disabled={updateStatusMutation.isPending}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
            >
              {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
            </Button>
            <IconButton
              color="error"
              onClick={() => setIsDeleteDialogOpen(true)}
              sx={{
                border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                borderRadius: 2,
              }}
            >
              <DeleteIcon fontSize="small" />
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
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: 'none',
              bgcolor: alpha(theme.palette.background.paper, 0.8),
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                }}
              >
                <DevicesIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Active Sessions
                </Typography>
                <Typography variant="h6" fontWeight={700}>
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
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: 'none',
              bgcolor: alpha(theme.palette.background.paper, 0.8),
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: 'success.main',
                }}
              >
                <FingerprintIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Passkeys Configured
                </Typography>
                <Typography variant="h6" fontWeight={700}>
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
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: 'none',
              bgcolor: alpha(theme.palette.background.paper, 0.8),
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  color: 'info.main',
                }}
              >
                <ShieldOutlinedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Two-Factor (MFA)
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {user.mfaEnabled ? 'Enrolled' : 'Disabled'}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: 'none',
              bgcolor: alpha(theme.palette.background.paper, 0.8),
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  color: 'warning.main',
                }}
              >
                <AccessTimeIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Last Login
                </Typography>
                <Typography variant="body2" fontWeight={700} noWrap>
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Never'}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Container */}
      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.04)',
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
            <Tab icon={<PersonIcon fontSize="small" />} iconPosition="start" label="Overview" />
            <Tab
              icon={<AdminPanelSettingsIcon fontSize="small" />}
              iconPosition="start"
              label="Roles & Permissions"
            />
            <Tab icon={<DevicesIcon fontSize="small" />} iconPosition="start" label="Active Sessions" />
            <Tab icon={<HistoryIcon fontSize="small" />} iconPosition="start" label="Activity Log" />
            <Tab icon={<SecurityIcon fontSize="small" />} iconPosition="start" label="Security Actions" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3.5 }}>
          {/* Tab 0: Overview */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={2}>
                  Personal & Contact Information
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    borderColor: alpha(theme.palette.divider, 0.1),
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <PersonIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Full Name
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {user.fullName || `${user.firstName} ${user.lastName}`}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <EmailIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Email Address
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {user.email}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <PhoneIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Phone Number
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {user.phoneNumber || 'Not provided'}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <LocationOnIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Location
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {user.location || 'Not provided'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={2}>
                  Organization & Localization
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    borderColor: alpha(theme.palette.divider, 0.1),
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <BusinessIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Department & Company
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {user.department || 'General'}{' '}
                          {user.company ? `• ${user.company}` : ''}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <WorkIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Job Title
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {user.jobTitle || 'Team Member'}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <LanguageIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Locale & Language
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {user.locale || 'en-us'}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Timezone
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {user.timezone || 'UTC'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>

              {user.bio && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>
                    Biography / Notes
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2.5, borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.4) }}
                  >
                    <Typography variant="body2">{user.bio}</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}

          {/* Tab 1: Roles & Permissions */}
          {activeTab === 1 && (
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Assigned Tenant Roles
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Roles determine effective authorization rules across resources
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AdminPanelSettingsIcon />}
                  onClick={() => setIsAssignRolesOpen(true)}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Modify Roles
                </Button>
              </Stack>

              <Grid container spacing={2}>
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role: any) => (
                    <Grid key={role.id || role} size={{ xs: 12, sm: 6 }}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          bgcolor: alpha(theme.palette.primary.main, 0.02),
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                          <SecurityIcon color="primary" fontSize="small" />
                          <Typography variant="subtitle2" fontWeight={700}>
                            {role.name || role}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {role.description || 'Assigned tenant security role'}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))
                ) : (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="info">No custom roles assigned. User has default tenant access.</Alert>
                  </Grid>
                )}
              </Grid>

              {/* Effective Permissions Tags */}
              <Box mt={2}>
                <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                  Effective Granted Permissions:
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {(user.permissions || ['users:view', 'profile:read', 'sessions:manage']).map(
                    (perm, idx) => (
                      <Chip
                        key={idx}
                        label={perm}
                        size="small"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          bgcolor: alpha(theme.palette.text.primary, 0.06),
                        }}
                      />
                    )
                  )}
                </Stack>
              </Box>
            </Stack>
          )}

          {/* Tab 2: Active Sessions */}
          {activeTab === 2 && (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" fontWeight={700}>
                Connected Devices & Sessions
              </Typography>

              {isSessionsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : sessions.length === 0 ? (
                <Alert severity="info">No active sessions found for this user.</Alert>
              ) : (
                <List sx={{ p: 0 }}>
                  {sessions.map((sess, idx) => (
                    <Paper
                      key={sess.id || idx}
                      variant="outlined"
                      sx={{ p: 2, mb: 1.5, borderRadius: 2 }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={2} alignItems="center">
                          <DevicesIcon color="action" />
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2" fontWeight={700}>
                                {sess.device || sess.browser || 'Web Browser'} • {sess.os || 'Desktop'}
                              </Typography>
                              {sess.isCurrent && (
                                <Chip label="Current Session" size="small" color="success" sx={{ height: 20 }} />
                              )}
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
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
              <Typography variant="subtitle2" fontWeight={700}>
                Audit & Activity Timeline
              </Typography>

              {isActivityLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : activityLogs.length === 0 ? (
                <Alert severity="info">No recent activity logs recorded for this account.</Alert>
              ) : (
                <List sx={{ p: 0 }}>
                  {activityLogs.map((log, idx) => (
                    <Paper
                      key={log.id || idx}
                      variant="outlined"
                      sx={{ p: 2, mb: 1.5, borderRadius: 2 }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <HistoryIcon color="action" fontSize="small" />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {log.action}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.description}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
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
              <Typography variant="subtitle2" fontWeight={700}>
                Administrative Security Overrides
              </Typography>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      Trigger Password Reset
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                      Dispatches an email containing a secure token for the user to set a new password.
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<LockResetIcon />}
                      onClick={handleSendResetPassword}
                      disabled={sendPasswordResetMutation.isPending}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Send Password Reset Link
                    </Button>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      Reset MFA Enrollment
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                      Clears authenticator apps and passkeys, requiring the user to re-enroll next login.
                    </Typography>
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<VpnKeyIcon />}
                      onClick={handleResetMfa}
                      disabled={resetMfaMutation.isPending}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Reset Two-Factor Authentication
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
        onSuccess={() => navigate('/admin/users')}
      />
    </Box>
  )
}
