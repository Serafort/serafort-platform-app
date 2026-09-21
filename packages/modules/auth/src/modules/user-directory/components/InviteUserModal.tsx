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
  Tooltip,
  Divider,
  alpha,
  useTheme,
} from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import SecurityIcon from '@mui/icons-material/Security'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import DialogCloseButton from './DialogCloseButton'
import { useTranslation } from 'react-i18next'

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
  // Tenant roles only -- never a client-side placeholder list (see AssignRolesModal).
  const availableRoles = useMemo(() => rolesResponse?.data ?? [], [rolesResponse])

  // Single User Form
  const singleForm = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema) as unknown as Resolver<InviteUserFormData>,
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
    resolver: zodResolver(bulkInviteUserSchema) as unknown as Resolver<BulkInviteUserFormData>,
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
    onError: (err) => {
      const fieldErrors = (err as { response?: { data?: { errors?: unknown } } })?.response?.data
        ?.errors
      if (fieldErrors && typeof fieldErrors === 'object') {
        Object.entries(fieldErrors).forEach(([field, msg]) => {
          singleForm.setError(field as keyof InviteUserFormData, { message: Array.isArray(msg) ? msg[0] : String(msg) })
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
          borderRadius: 'var(--sf-radius-lg, 12px)',
          boxShadow: `0 24px 48px -12px ${alpha(theme.palette.common.black, 0.25)}`,
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
              borderRadius: 'var(--sf-radius-md, 8px)',
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
              {tabIndex === 0
                ? t('auth.userDirectory.invite.titleSingle', 'Invite single user')
                : t('auth.userDirectory.invite.titleBulk', 'Bulk user invitation')}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {t('auth.userDirectory.invite.provisionAccessAndRoles', 'Provision access and roles for new directory members')}
            </Typography>
          </Box>
        </Stack>
        <DialogCloseButton onClick={onClose} disabled={isSubmitting} />
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
          <Tab icon={<PersonAddIcon fontSize='small' />} iconPosition='start' label={t('auth.userDirectory.invite.singleUser', 'Single User')} />
          <Tab icon={<GroupAddIcon fontSize='small' />} iconPosition='start' label={t('auth.userDirectory.invite.bulkImport', 'Bulk Import')} />
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
                      label={t('auth.userDirectory.invite.firstName', 'First Name')}
                      placeholder={t('auth.userDirectory.invite.placeholderFirstName', 'e.g. John')}
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
                      label={t('auth.userDirectory.invite.lastName', 'Last Name')}
                      placeholder={t('auth.userDirectory.invite.placeholderLastName', 'e.g. Doe')}
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
                      label={t('auth.userDirectory.invite.emailAddress', 'Email Address')}
                      placeholder={t('auth.userDirectory.invite.placeholderEmail', 'e.g. john.doe@company.com')}
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
                      label={t('auth.userDirectory.invite.department', 'Department')}
                      placeholder={t('auth.userDirectory.invite.placeholderDepartment', 'e.g. Engineering')}
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
                      label={t('auth.userDirectory.invite.jobTitle', 'Job Title')}
                      placeholder={t('auth.userDirectory.invite.placeholderJobTitle', 'e.g. Senior Software Engineer')}
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
                      <InputLabel id='role-select-label'>{t('auth.userDirectory.invite.assignedRoles', 'Assigned Roles')}</InputLabel>
                      <Select
                        labelId='role-select-label'
                        multiple
                        value={field.value || []}
                        onChange={(e) => {
                          const val = e.target.value
                          field.onChange(typeof val === 'string' ? val.split(',').map(Number) : val)
                        }}
                        input={<OutlinedInput label={t('auth.userDirectory.invite.assignedRoles', 'Assigned Roles')} />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((roleId: number) => {
                              const role = availableRoles.find((r) => r.id === roleId)
                              return (
                                <Chip
                                  key={roleId}
                                  label={role?.name || t('auth.userDirectory.editUser.roleFallback', 'Role #{{id}}', { id: roleId })}
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
                      borderRadius: 'var(--sf-radius-md, 8px)',
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
                      {t('auth.userDirectory.invite.includedRoleCapabilities', 'Included Role Capabilities:')}
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
                            {t('auth.userDirectory.invite.sendActivationEmail', 'Send invitation email with activation link')}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {t(
                              'auth.userDirectory.invite.activationHint',
                              'User will receive instructions to set up their password and activate their profile.',
                            )}
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
                {t(
                  'auth.userDirectory.invite.bulkInfo',
                  'Enter multiple email addresses separated by commas, semicolons, or new lines. Each invited user will be assigned the selected roles.',
                )}
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
                    label={t('auth.userDirectory.invite.emailAddresses', 'Email Addresses')}
                    placeholder={'alex@company.com\nsarah@company.com\ndavid@company.com'}
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
                    <InputLabel id='bulk-role-select-label'>{t('auth.userDirectory.invite.defaultAssignedRoles', 'Default Assigned Roles')}</InputLabel>
                    <Select
                      labelId='bulk-role-select-label'
                      multiple
                      value={field.value || []}
                      onChange={(e) => {
                        const val = e.target.value
                        field.onChange(typeof val === 'string' ? val.split(',').map(Number) : val)
                      }}
                      input={<OutlinedInput label={t('auth.userDirectory.invite.defaultAssignedRoles', 'Default Assigned Roles')} />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((roleId: number) => {
                            const role = availableRoles.find((r) => r.id === roleId)
                            return (
                              <Chip
                                key={roleId}
                                label={role?.name || t('auth.userDirectory.editUser.roleFallback', 'Role #{{id}}', { id: roleId })}
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
                    label={t('auth.userDirectory.invite.departmentOptional', 'Department (Optional)')}
                    placeholder={t('auth.userDirectory.invite.placeholderBulkDepartment', 'e.g. Sales, Marketing')}
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
                        {t('auth.userDirectory.invite.sendActivationEmailTo', 'Send activation email to all invited users')}
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
          {t('auth.userDirectory.invite.cancel', 'Cancel')}
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
            borderRadius: 'var(--sf-radius-md, 8px)',
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={20} color='inherit' />
          ) : tabIndex === 0 ? (
            t('auth.userDirectory.invite.send', 'Send invitation')
          ) : (
            t('auth.userDirectory.invite.sendBulk', 'Invite users')
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
