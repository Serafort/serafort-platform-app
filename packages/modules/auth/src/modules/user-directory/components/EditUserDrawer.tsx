// EditUserDrawer.tsx
// High-fidelity slide-in drawer for editing user attributes, roles, and status

import React, { useState, useEffect, useMemo } from 'react'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Tabs,
  Tab,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  OutlinedInput,
  Avatar,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  useTheme,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import SecurityIcon from '@mui/icons-material/Security'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { editUserSchema, EditUserFormData } from '../schemas/userDirectory.schema'
import { UserDirectoryItemDTO, UserDetailDTO } from '../types/userDirectory.types'
import { useUserDetailQuery, useRolesQuery } from '../hooks/useUserDirectoryQuery'
import { useUpdateUserMutation, useUpdateUserStatusMutation } from '../hooks/useUserDirectoryMutations'

export interface EditUserDrawerProps {
  open: boolean
  userId: string | number | null
  initialUser?: UserDirectoryItemDTO | UserDetailDTO | null
  onClose: () => void
  onSuccess?: () => void
}

const TIMEZONES = [
  { label: 'UTC (Universal Coordinated Time)', value: 'utc' },
  { label: 'EST (Eastern Standard Time, UTC-5)', value: 'est' },
  { label: 'CST (Central Standard Time, UTC-6)', value: 'cst' },
  { label: 'PST (Pacific Standard Time, UTC-8)', value: 'pst' },
  { label: 'CET (Central European Time, UTC+1)', value: 'cet' },
  { label: 'IST (India Standard Time, UTC+5:30)', value: 'ist' },
]

const LOCALES = [
  { label: 'English (US)', value: 'en-us' },
  { label: 'English (UK)', value: 'en-gb' },
  { label: 'Spanish (ES)', value: 'es' },
  { label: 'French (FR)', value: 'fr' },
  { label: 'German (DE)', value: 'de' },
]

export default function EditUserDrawer({
  open,
  userId,
  initialUser,
  onClose,
  onSuccess,
}: EditUserDrawerProps) {
  const theme = useTheme()
  const [tabIndex, setTabIndex] = useState<number>(0)
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState<boolean>(false)

  // Fetch full details if needed
  const { data: userDetailResponse, isLoading: isDetailLoading } = useUserDetailQuery(
    open && userId ? userId : null
  )
  const { data: rolesResponse } = useRolesQuery()

  const availableRoles = useMemo(() => {
    return (
      rolesResponse?.data || [
        { id: 1, name: 'User', slug: 'user', description: 'Standard tenant user access' },
        { id: 2, name: 'Administrator', slug: 'admin', description: 'Full tenant admin privileges' },
        { id: 3, name: 'Manager', slug: 'manager', description: 'Department management' },
        { id: 4, name: 'Auditor', slug: 'auditor', description: 'Read-only audit log access' },
      ]
    )
  }, [rolesResponse])

  const user = useMemo(() => {
    return userDetailResponse?.data || initialUser || null
  }, [userDetailResponse, initialUser])

  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema) as any,
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      jobTitle: '',
      department: '',
      company: '',
      location: '',
      website: '',
      bio: '',
      timezone: 'utc',
      locale: 'en-us',
      dateFormat: 'mm-dd-yyyy',
      status: 'ACTIVE',
      roleIds: [1],
    },
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = form

  // Reset form when user data arrives
  useEffect(() => {
    if (user) {
      const assignedRoleIds = user.roles?.map((r: any) => (typeof r === 'object' ? r.id : Number(r))) || [1]
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        jobTitle: user.jobTitle || '',
        department: user.department || '',
        company: (user as any).company || '',
        location: (user as any).location || '',
        website: (user as any).website || '',
        bio: (user as any).bio || '',
        timezone: (user as any).timezone || 'utc',
        locale: (user as any).locale || 'en-us',
        dateFormat: (user as any).dateFormat || 'mm-dd-yyyy',
        status: user.status || 'ACTIVE',
        roleIds: assignedRoleIds.length > 0 ? assignedRoleIds : [1],
      })
    }
  }, [user, reset])

  const updateUserMutation = useUpdateUserMutation({
    onSuccess: () => {
      onSuccess?.()
      onClose()
    },
  })

  const updateStatusMutation = useUpdateUserStatusMutation()

  const handleFormSubmit = async (data: EditUserFormData) => {
    if (!userId) return

    // If status changed, update status endpoint
    if (user && data.status !== user.status) {
      await updateStatusMutation.mutateAsync({
        id: userId,
        data: { status: data.status, reason: 'Status updated via user drawer' },
      })
    }

    // Update profile & roles
    await updateUserMutation.mutateAsync({
      id: userId,
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        jobTitle: data.jobTitle,
        department: data.department,
        company: data.company,
        location: data.location,
        website: data.website,
        bio: data.bio,
        timezone: data.timezone,
        locale: data.locale,
        dateFormat: data.dateFormat,
        status: data.status,
        roleIds: data.roleIds,
      },
    })
  }

  const handleCloseAttempt = () => {
    if (isDirty) {
      setUnsavedDialogOpen(true)
    } else {
      onClose()
    }
  }

  const handleConfirmDiscard = () => {
    setUnsavedDialogOpen(false)
    reset()
    onClose()
  }

  const selectedRoleIds = form.watch('roleIds') || []

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleCloseAttempt}
        PaperProps={{
          sx: {
            width: { xs: '100vw', sm: 540 },
            maxWidth: '100vw',
            bgcolor: 'background.paper',
            boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            p: 3,
            pb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={user?.avatarUrl || undefined}
              sx={{
                width: 48,
                height: 48,
                bgcolor: theme.palette.primary.main,
                fontWeight: 700,
              }}
            >
              {user?.firstName?.[0] || user?.fullName?.[0] || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {user ? user.fullName || `${user.firstName} ${user.lastName}` : 'Edit User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email || 'Update user settings and access'}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={handleCloseAttempt} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Navigation Tabs */}
        <Box sx={{ px: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Tabs
            value={tabIndex}
            onChange={(_, val) => setTabIndex(val)}
            sx={{
              minHeight: 44,
              '& .MuiTab-root': {
                minHeight: 44,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
              },
            }}
          >
            <Tab icon={<PersonOutlineIcon fontSize="small" />} iconPosition="start" label="General Info" />
            <Tab icon={<SecurityIcon fontSize="small" />} iconPosition="start" label="Roles & Access" />
            <Tab icon={<VpnKeyIcon fontSize="small" />} iconPosition="start" label="Account Status" />
          </Tabs>
        </Box>

        {/* Drawer Body */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          {isDetailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <form id="edit-user-form" onSubmit={handleSubmit(handleFormSubmit)}>
              {/* Tab 1: General Info */}
              {tabIndex === 0 && (
                <Stack spacing={2.5}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Controller
                      name="firstName"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="First Name"
                          error={Boolean(fieldState.error)}
                          helperText={fieldState.error?.message}
                          required
                        />
                      )}
                    />
                    <Controller
                      name="lastName"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Last Name"
                          error={Boolean(fieldState.error)}
                          helperText={fieldState.error?.message}
                          required
                        />
                      )}
                    />
                  </Stack>

                  <Controller
                    name="email"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="email"
                        label="Email Address"
                        error={Boolean(fieldState.error)}
                        helperText={fieldState.error?.message}
                        required
                      />
                    )}
                  />

                  <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        value={field.value || ''}
                        fullWidth
                        label="Phone Number"
                        placeholder="+1 (555) 000-0000"
                        error={Boolean(fieldState.error)}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Controller
                      name="jobTitle"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          value={field.value || ''}
                          fullWidth
                          label="Job Title"
                          error={Boolean(fieldState.error)}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                    <Controller
                      name="department"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          value={field.value || ''}
                          fullWidth
                          label="Department"
                          error={Boolean(fieldState.error)}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Controller
                      name="timezone"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel id="timezone-label">Timezone</InputLabel>
                          <Select labelId="timezone-label" {...field} label="Timezone">
                            {TIMEZONES.map((tz) => (
                              <MenuItem key={tz.value} value={tz.value}>
                                {tz.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                    <Controller
                      name="locale"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel id="locale-label">Language / Locale</InputLabel>
                          <Select labelId="locale-label" {...field} label="Language / Locale">
                            {LOCALES.map((loc) => (
                              <MenuItem key={loc.value} value={loc.value}>
                                {loc.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Stack>

                  <Controller
                    name="bio"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        value={field.value || ''}
                        fullWidth
                        multiline
                        rows={3}
                        label="Bio / Notes"
                        placeholder="Brief summary or administrator notes..."
                        error={Boolean(fieldState.error)}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </Stack>
              )}

              {/* Tab 2: Roles & Access */}
              {tabIndex === 1 && (
                <Stack spacing={2.5}>
                  <Alert severity="info">
                    Roles define permissions and tenant administrative privileges. Multiple roles can be assigned simultaneously.
                  </Alert>

                  <Controller
                    name="roleIds"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FormControl fullWidth error={Boolean(fieldState.error)}>
                        <InputLabel id="edit-roles-label">Assigned Roles</InputLabel>
                        <Select
                          labelId="edit-roles-label"
                          multiple
                          value={field.value || []}
                          onChange={(e) => {
                            const val = e.target.value
                            field.onChange(typeof val === 'string' ? val.split(',').map(Number) : val)
                          }}
                          input={<OutlinedInput label="Assigned Roles" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((roleId: number) => {
                                const role = availableRoles.find((r) => r.id === roleId)
                                return (
                                  <Chip
                                    key={roleId}
                                    label={role?.name || `Role #${roleId}`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                )
                              })}
                            </Box>
                          )}
                        >
                          {availableRoles.map((role) => (
                            <MenuItem key={role.id} value={role.id}>
                              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" width="100%">
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    {role.name}
                                  </Typography>
                                  {role.description && (
                                    <Typography variant="caption" color="text.secondary">
                                      {role.description}
                                    </Typography>
                                  )}
                                </Box>
                                {selectedRoleIds?.includes(role.id) && (
                                  <CheckCircleOutlineIcon fontSize="small" color="primary" />
                                )}
                              </Stack>
                            </MenuItem>
                          ))}
                        </Select>
                        {fieldState.error && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                            {fieldState.error.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Stack>
              )}

              {/* Tab 3: Account Status */}
              {tabIndex === 2 && (
                <Stack spacing={2.5}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    User Account Status
                  </Typography>

                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel id="user-status-select-label">Account Status</InputLabel>
                        <Select labelId="user-status-select-label" {...field} label="Account Status">
                          <MenuItem value="ACTIVE">
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip label="ACTIVE" size="small" color="success" />
                              <Typography variant="body2">Active & Allowed to Login</Typography>
                            </Stack>
                          </MenuItem>
                          <MenuItem value="INACTIVE">
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip label="INACTIVE" size="small" color="default" />
                              <Typography variant="body2">Inactive (Login Disabled)</Typography>
                            </Stack>
                          </MenuItem>
                          <MenuItem value="SUSPENDED">
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip label="SUSPENDED" size="small" color="warning" />
                              <Typography variant="body2">Suspended / Temporarily Locked</Typography>
                            </Stack>
                          </MenuItem>
                          <MenuItem value="BANNED">
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip label="BANNED" size="small" color="error" />
                              <Typography variant="body2">Banned from Platform</Typography>
                            </Stack>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />

                  {form.watch('status') === 'SUSPENDED' && (
                    <Alert severity="warning">
                      Suspending this account will immediately revoke all active refresh tokens and terminate ongoing sessions.
                    </Alert>
                  )}
                  {form.watch('status') === 'BANNED' && (
                    <Alert severity="error">
                      Banning this user will block all authentication requests from their associated IP addresses and linked credentials.
                    </Alert>
                  )}
                </Stack>
              )}
            </form>
          )}
        </Box>

        {/* Drawer Footer */}
        <Box
          sx={{
            p: 3,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: alpha(theme.palette.background.default, 0.5),
          }}
        >
          <Button onClick={handleCloseAttempt} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-user-form"
            variant="contained"
            disabled={isSubmitting || !isDirty}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              borderRadius: 2,
              minWidth: 130,
            }}
          >
            {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
          </Button>
        </Box>
      </Drawer>

      {/* Unsaved Changes Confirmation Dialog */}
      <Dialog open={unsavedDialogOpen} onClose={() => setUnsavedDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WarningAmberIcon color="warning" />
          <Typography variant="h6" fontWeight={700}>
            Discard Unsaved Changes?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            You have unsaved changes in this drawer. If you close now, all modifications will be lost.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setUnsavedDialogOpen(false)} color="inherit" sx={{ textTransform: 'none' }}>
            Keep Editing
          </Button>
          <Button onClick={handleConfirmDiscard} color="error" variant="contained" sx={{ textTransform: 'none' }}>
            Discard Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
