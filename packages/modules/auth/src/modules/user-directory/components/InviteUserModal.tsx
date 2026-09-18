// InviteUserModal.tsx
// High-fidelity User Invite & Creation Modal with React Hook Form + Zod & Role Multi-Select

import React, { useState, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
  Box,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Chip,
  OutlinedInput,
  Stack,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  alpha,
  useTheme,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import SecurityIcon from '@mui/icons-material/Security'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import {
  inviteUserSchema,
  bulkInviteUserSchema,
  InviteUserFormData,
  BulkInviteUserFormData,
} from '../schemas/userDirectory.schema'
import { useRolesQuery } from '../hooks/useUserDirectoryQuery'
import {
  useInviteUserMutation,
  useBulkInviteUsersMutation,
} from '../hooks/useUserDirectoryMutations'

export interface InviteUserModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function InviteUserModal({ open, onClose, onSuccess }: InviteUserModalProps) {
  const { t } = useTranslation('common')
  const theme = useTheme()
  const [tabIndex, setTabIndex] = useState<number>(0)

  // Roles query
  const { data: rolesResponse, isLoading: isRolesLoading } = useRolesQuery()
  const availableRoles = useMemo(() => {
    return (
      rolesResponse?.data || [
        { id: 1, name: 'User', slug: 'user', description: 'Standard tenant user access' },
        {
          id: 2,
          name: 'Administrator',
          slug: 'admin',
          description: 'Full tenant admin privileges',
        },
        { id: 3, name: 'Manager', slug: 'manager', description: 'Department and team management' },
        {
          id: 4,
          name: 'Auditor',
          slug: 'auditor',
          description: 'Read-only audit and compliance log access',
        },
      ]
    )
  }, [rolesResponse])

  // Single User Form
  const singleForm = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema) as any,
    mode: 'onBlur',
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      roleIds: [1],
      department: '',
      jobTitle: '',
      sendInviteEmail: true,
      temporaryPassword: '',
    },
  })

  // Bulk User Form
  const bulkForm = useForm<BulkInviteUserFormData>({
    resolver: zodResolver(bulkInviteUserSchema) as any,
    mode: 'onBlur',
    defaultValues: {
      emails: '',
      roleIds: [1],
      department: '',
      sendInviteEmail: true,
    },
  })

  // Mutations
  const inviteSingleMutation = useInviteUserMutation({
    onSuccess: () => {
      singleForm.reset()
      onClose()
      onSuccess?.()
    },
    onError: (err: any) => {
      const fieldErrors = err?.response?.data?.errors
      if (fieldErrors && typeof fieldErrors === 'object') {
        Object.entries(fieldErrors).forEach(([field, msg]) => {
          singleForm.setError(field as any, { message: Array.isArray(msg) ? msg[0] : String(msg) })
        })
      }
    },
  })

  const inviteBulkMutation = useBulkInviteUsersMutation({
    onSuccess: () => {
      bulkForm.reset()
      onClose()
      onSuccess?.()
    },
  })

  const selectedRoleIds = tabIndex === 0 ? singleForm.watch('roleIds') : bulkForm.watch('roleIds')
  const selectedRoles = useMemo(() => {
    return availableRoles.filter((r) => selectedRoleIds?.includes(r.id))
  }, [availableRoles, selectedRoleIds])

  const handleSingleSubmit = (data: InviteUserFormData) => {
    inviteSingleMutation.mutate(data)
  }

  const handleBulkSubmit = (data: BulkInviteUserFormData) => {
    inviteBulkMutation.mutate(data)
  }

  const isSubmitting = inviteSingleMutation.isPending || inviteBulkMutation.isPending

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
          backgroundImage: 'none',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          p: 3,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Stack direction='row' spacing={1.5} alignItems='center'>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {tabIndex === 0 ? <PersonAddIcon /> : <GroupAddIcon />}
          </Box>
          <Box>
            <Typography variant='h6' fontWeight={700}>
              {tabIndex === 0 ? 'Invite Single User' : 'Bulk User Invitation'}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Provision access and roles for new directory members
            </Typography>
          </Box>
        </Stack>
        <IconButton
          onClick={onClose}
          size='small'
          disabled={isSubmitting}
          sx={{
            color: 'text.secondary',
            '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.05) },
          }}
        >
          <CloseIcon fontSize='small' />
        </IconButton>
      </DialogTitle>

      {/* Tabs */}
      <Box sx={{ px: 3, pt: 1, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
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
          <Tab icon={<PersonAddIcon fontSize='small' />} iconPosition='start' label='Single User' />
          <Tab icon={<GroupAddIcon fontSize='small' />} iconPosition='start' label='Bulk Import' />
        </Tabs>
      </Box>

      {/* Form Content */}
      <DialogContent sx={{ p: 3, py: 2.5 }}>
        {tabIndex === 0 ? (
          <form id='invite-single-form' onSubmit={singleForm.handleSubmit(handleSingleSubmit)}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name='firstName'
                  control={singleForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='First Name'
                      placeholder='e.g. John'
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                      required
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name='lastName'
                  control={singleForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Last Name'
                      placeholder='e.g. Doe'
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                      required
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name='email'
                  control={singleForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type='email'
                      label='Email Address'
                      placeholder='e.g. john.doe@company.com'
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                      required
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name='department'
                  control={singleForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Department'
                      placeholder='e.g. Engineering'
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name='jobTitle'
                  control={singleForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Job Title'
                      placeholder='e.g. Senior Software Engineer'
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              {/* Role Multi-Select */}
              <Grid size={{ xs: 12 }}>
                <Controller
                  name='roleIds'
                  control={singleForm.control}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={Boolean(fieldState.error)}>
                      <InputLabel id='role-select-label'>Assigned Roles</InputLabel>
                      <Select
                        labelId='role-select-label'
                        multiple
                        value={field.value || []}
                        onChange={(e) => {
                          const val = e.target.value
                          field.onChange(typeof val === 'string' ? val.split(',').map(Number) : val)
                        }}
                        input={<OutlinedInput label='Assigned Roles' />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((roleId: number) => {
                              const role = availableRoles.find((r) => r.id === roleId)
                              return (
                                <Chip
                                  key={roleId}
                                  label={role?.name || `Role #${roleId}`}
                                  size='small'
                                  color='primary'
                                  variant='outlined'
                                />
                              )
                            })}
                          </Box>
                        )}
                      >
                        {availableRoles.map((role) => (
                          <MenuItem key={role.id} value={role.id}>
                            <Stack
                              direction='row'
                              spacing={1}
                              alignItems='center'
                              justifyContent='space-between'
                              width='100%'
                            >
                              <Box>
                                <Typography variant='body2' fontWeight={600}>
                                  {role.name}
                                </Typography>
                                {role.description && (
                                  <Typography variant='caption' color='text.secondary'>
                                    {role.description}
                                  </Typography>
                                )}
                              </Box>
                              {selectedRoleIds?.includes(role.id) && (
                                <CheckCircleOutlineIcon fontSize='small' color='primary' />
                              )}
                            </Stack>
                          </MenuItem>
                        ))}
                      </Select>
                      {fieldState.error && (
                        <Typography variant='caption' color='error' sx={{ mt: 0.5 }}>
                          {fieldState.error.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Role Permissions Preview */}
              {selectedRoles.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.default, 0.6),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }}
                  >
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      fontWeight={600}
                      display='block'
                      mb={0.75}
                    >
                      Included Role Capabilities:
                    </Typography>
                    <Stack direction='row' flexWrap='wrap' gap={0.75}>
                      {selectedRoles.map((r) => (
                        <Chip
                          key={r.id}
                          icon={<SecurityIcon fontSize='small' />}
                          label={r.name}
                          size='small'
                          sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 0.5 }} />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name='sendInviteEmail'
                  control={singleForm.control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant='body2' fontWeight={600}>
                            Send invitation email with activation link
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            User will receive instructions to set up their password and activate
                            their profile.
                          </Typography>
                        </Box>
                      }
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        ) : (
          <form id='invite-bulk-form' onSubmit={bulkForm.handleSubmit(handleBulkSubmit)}>
            <Stack spacing={2.5}>
              <Alert severity='info' icon={<InfoOutlinedIcon fontSize='small' />}>
                Enter multiple email addresses separated by commas, semicolons, or new lines. Each
                invited user will be assigned the selected roles.
              </Alert>

              <Controller
                name='emails'
                control={bulkForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    label='Email Addresses'
                    placeholder='alex@company.com&#10;sarah@company.com&#10;david@company.com'
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    required
                  />
                )}
              />

              <Controller
                name='roleIds'
                control={bulkForm.control}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={Boolean(fieldState.error)}>
                    <InputLabel id='bulk-role-select-label'>Default Assigned Roles</InputLabel>
                    <Select
                      labelId='bulk-role-select-label'
                      multiple
                      value={field.value || []}
                      onChange={(e) => {
                        const val = e.target.value
                        field.onChange(typeof val === 'string' ? val.split(',').map(Number) : val)
                      }}
                      input={<OutlinedInput label='Default Assigned Roles' />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((roleId: number) => {
                            const role = availableRoles.find((r) => r.id === roleId)
                            return (
                              <Chip
                                key={roleId}
                                label={role?.name || `Role #${roleId}`}
                                size='small'
                                color='primary'
                                variant='outlined'
                              />
                            )
                          })}
                        </Box>
                      )}
                    >
                      {availableRoles.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                          <Stack
                            direction='row'
                            spacing={1}
                            alignItems='center'
                            justifyContent='space-between'
                            width='100%'
                          >
                            <Box>
                              <Typography variant='body2' fontWeight={600}>
                                {role.name}
                              </Typography>
                              {role.description && (
                                <Typography variant='caption' color='text.secondary'>
                                  {role.description}
                                </Typography>
                              )}
                            </Box>
                            {selectedRoleIds?.includes(role.id) && (
                              <CheckCircleOutlineIcon fontSize='small' color='primary' />
                            )}
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldState.error && (
                      <Typography variant='caption' color='error' sx={{ mt: 0.5 }}>
                        {fieldState.error.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />

              <Controller
                name='department'
                control={bulkForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Department (Optional)'
                    placeholder='e.g. Sales, Marketing'
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name='sendInviteEmail'
                control={bulkForm.control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label={
                      <Typography variant='body2' fontWeight={600}>
                        Send activation email to all invited users
                      </Typography>
                    }
                  />
                )}
              />
            </Stack>
          </form>
        )}
      </DialogContent>

      {/* Footer Actions */}
      <DialogActions
        sx={{
          p: 3,
          pt: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          justifyContent: 'space-between',
        }}
      >
        <Button
          onClick={onClose}
          color='inherit'
          disabled={isSubmitting}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Button
          type='submit'
          form={tabIndex === 0 ? 'invite-single-form' : 'invite-bulk-form'}
          variant='contained'
          disabled={isSubmitting}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            px: 3,
            minWidth: 120,
            borderRadius: 2,
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={20} color='inherit' />
          ) : tabIndex === 0 ? (
            'Send Invitation'
          ) : (
            'Invite Users'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
