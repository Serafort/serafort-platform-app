import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Box, Button, TextField, Typography, Switch, Select, MenuItem, FormControl, InputLabel, Container, Card, CardContent, Tabs, Tab, Divider, CircularProgress, Avatar } from '@mui/material';
import Person from '@mui/icons-material/Person';
import Settings from '@mui/icons-material/Settings';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Shield from '@mui/icons-material/Shield';
import Edit from '@mui/icons-material/Edit';
import CloudUpload from '@mui/icons-material/CloudUpload';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useUserProfile, useUpdateMe, useExportMutation, useErasureMutation } from '../../hooks/useUserQuery';
import { useAuth, useNotifications } from '@cap/platform-core';
import { Path } from '@cap/module-auth/routes/path';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Alert, InputAdornment } from '@mui/material';
import CloudDownload from '@mui/icons-material/CloudDownload';
import Delete from '@mui/icons-material/Delete';
import Lock from '@mui/icons-material/Lock';

interface EditProfileProps {
  onSave?: () => void
  onCancel?: () => void
}

// Form data combining User and Profile fields for the edit form
interface ProfileFormData {
  // User fields
  firstName: string
  lastName: string
  phone: string
  email: string
  // Profile fields
  biography: string
  location: string
  website: string
  company: string
  // Preferences
  language: string
  timezone: string
  dateFormat: string
  // Notification preferences (from Profile)
  emailOnComment: boolean
  emailOnCommentReply: boolean
  emailOnAchievement: boolean
  emailOnNewDeviceLogin: boolean
  emailOnWatchlist: boolean
  emailOnMention: boolean
}

const LANGUAGES = [
  { label: 'auth.account.languages.en-us', value: 'en-us' },
  { label: 'auth.account.languages.es', value: 'es' },
  { label: 'auth.account.languages.fr', value: 'fr' },
  { label: 'auth.account.languages.de', value: 'de' },
]

const TIMEZONES = [
  { label: 'auth.account.timezones.pst', value: 'pst' },
  { label: 'auth.account.timezones.est', value: 'est' },
  { label: 'auth.account.timezones.utc', value: 'utc' },
  { label: 'auth.account.timezones.cet', value: 'cet' },
]

const DATE_FORMATS = [
  { label: 'auth.account.date_formats.mm-dd-yyyy', value: 'mm-dd-yyyy' },
  { label: 'auth.account.date_formats.dd-mm-yyyy', value: 'dd-mm-yyyy' },
  { label: 'auth.account.date_formats.yyyy-mm-dd', value: 'yyyy-mm-dd' },
]

export default function EditProfile({ onSave, onCancel }: EditProfileProps) {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user: authUser } = useAuth()
  const user = authUser?.user || authUser

  // Fetch user profile data
  const { data: profileData, isLoading } = useUserProfile()

  const controlForm = useForm<ProfileFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      biography: '',
      location: '',
      website: '',
      company: '',
      language: 'en-us',
      timezone: 'pst',
      dateFormat: 'mm-dd-yyyy',
      emailOnComment: true,
      emailOnCommentReply: true,
      emailOnAchievement: true,
      emailOnNewDeviceLogin: true,
      emailOnWatchlist: true,
      emailOnMention: true,
    },
  })

  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatar ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBwtlQvZfVHAbw57jyi9JMrm62k_80NJKpLqZ-74WIrj_8DkIUOI-STICkHrCtXn_E4tu77iuFWzG7x1-hPViQYAAOUPueWVDbPVZjHxXZ5_4B6jyk5z96oq_kwbPnJ2OSRCQhk8GhXZ0G-IgwaicY7_8xOJ9hd6fwTGyLM2oy-KiJK3ij9vYsZZQckddLlhELob7Damt743F22F9ZFuxdMxflfRFDj-aVj0SQqr9dM1Hlkw1Ql4epqFOxxQ1pGmQ_e7GgMrGDkaac',
  )

  // Sync avatar when user data changes
  useEffect(() => {
    if (user?.avatar) {
      setAvatarUrl(user.avatar)
    }
  }, [user?.avatar])
  const [activeAvatarTab, setActiveAvatarTab] = useState('upload')

  // GDPR State
  const [erasureDialogOpen, setErasureDialogOpen] = useState(false)
  const [erasurePassword, setErasurePassword] = useState('')

  const { mutate: exportData, isPending: isExporting } = useExportMutation({
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: t('auth.account.export_requested_title'),
        message: t('auth.account.export_requested_message'),
      })
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: t('auth.account.export_error'),
        message: error.message || t('auth.account.export_failed'),
      })
    },
  })

  const { mutate: eraseAccount, isPending: isDeleting } = useErasureMutation({
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: t('auth.account.erasure_started_title'),
        message: t('auth.account.erasure_started_message'),
      })
      setErasureDialogOpen(false)
      // Logout and redirect
      navigate(Path.auth.login)
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: t('auth.account.erasure_error'),
        message: error.message || t('auth.account.erasure_failed'),
      })
    },
  })

  const handleExportData = useCallback(() => {
    exportData()
  }, [exportData])

  const handleErasureAccount = useCallback(() => {
    if (!erasurePassword) return
    eraseAccount({ password: erasurePassword })
  }, [eraseAccount, erasurePassword])

  const avatarTabs = useMemo(
    () => [
      { id: 'upload', label: t('auth.account.avatar_customization.upload') },
      { id: 'camera', label: t('auth.account.avatar_customization.camera') },
      { id: 'generate', label: t('auth.account.avatar_customization.generate') },
    ],
    [t],
  )

  // Populate form when profile data loads
  useEffect(() => {
    // Only reset if we have data AND a profile object (to avoid resetting to defaults on partial loads)
    if (profileData?.data && (profileData.data as any).profile) {
      const data = profileData.data as any
      const profile = data.profile
      controlForm.reset({
        firstName: data.firstName || data.firstname || '',
        lastName: data.lastName || data.lastname || '',
        phone: data.phone || data.phoneNumber || '',
        email: data.email || '',
        biography: profile.biography || '',
        location: profile.location || '',
        website: profile.website || '',
        company: profile.company || '',
        language: profile.language || 'en-us',
        timezone: profile.timezone || 'pst',
        dateFormat: profile.dateFormat || 'mm-dd-yyyy',
        emailOnComment: profile.emailOnComment ?? true,
        emailOnCommentReply: profile.emailOnCommentReply ?? true,
        emailOnAchievement: profile.emailOnAchievement ?? true,
        emailOnNewDeviceLogin: profile.emailOnNewDeviceLogin ?? true,
        emailOnWatchlist: profile.emailOnWatchlist ?? true,
        emailOnMention: profile.emailOnMention ?? true,
      })
    }
  }, [profileData, controlForm])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { addNotification } = useNotifications()

  const { mutate: updateMe, isPending } = useUpdateMe({
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: t('auth.account.success'),
        message: t('auth.account.update_success'),
      })
      if (onSave) {
        onSave()
      } else {
        navigate(Path.account.edit)
      }
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: t('auth.account.error'),
        message: error.message || t('auth.account.update_error'),
      })
    },
  })

  const onSubmit = async (values: ProfileFormData) => {
    updateMe({
      firstname: values.firstName,
      lastname: values.lastName,
      phone: values.phone,
      biography: values.biography,
      location: values.location,
      website: values.website,
      company: values.company,
      language: values.language,
      timezone: values.timezone,
      dateFormat: values.dateFormat,
      emailOnComment: values.emailOnComment,
      emailOnCommentReply: values.emailOnCommentReply,
      emailOnAchievement: values.emailOnAchievement,
      emailOnNewDeviceLogin: values.emailOnNewDeviceLogin,
      emailOnWatchlist: values.emailOnWatchlist,
      emailOnMention: values.emailOnMention,
    })
  }

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel()
    } else {
      navigate(-1)
    }
  }, [onCancel, navigate])

  if (isLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        component='form'
        onSubmit={controlForm.handleSubmit(onSubmit)}
        noValidate
        sx={{ flex: 1, py: { xs: 3, md: 4 }, px: { xs: 2, md: 4, lg: 20 } }}
      >
        <Container maxWidth='lg' disableGutters>
          {/* Page Header */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: 2,
              mb: 4,
            }}
          >
            <Box>
              <Typography
                variant='h3'
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.875rem', md: '2.25rem' },
                  letterSpacing: '-0.033em',
                  mb: 0.5,
                }}
              >
                {t('auth.account.update_profile_title')}
              </Typography>
              <Typography variant='body1' color='text.secondary' sx={{ fontSize: '1rem' }}>
                {t('auth.account.update_profile_subtitle')}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant='outlined'
                onClick={handleCancel}
                sx={{
                  height: 40,
                  px: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  borderColor: 'divider',
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: 'grey.50',
                    borderColor: 'divider',
                  },
                }}
              >
                {t('auth.account.cancel')}
              </Button>
              <Button
                type='submit'
                variant='contained'
                disabled={isPending}
                sx={{
                  height: 40,
                  px: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  boxShadow: '0 1px 2px rgba(19, 127, 236, 0.3)',
                  '&:hover': {
                    boxShadow: '0 2px 4px rgba(19, 127, 236, 0.4)',
                  },
                }}
              >
                {isPending
                  ? t('auth.account.updating')
                  : t('auth.account.save_changes')}
              </Button>
            </Box>
          </Box>

          {/* Content Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(280px, 1fr) 2fr' },
              gap: 3,
            }}
          >
            {/* Left Column: Avatar Customization */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Avatar Card */}
              <Card
                sx={{
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  border: 1,
                  borderColor: 'transparent',
                  borderRadius: 1,
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Typography
                    variant='h6'
                    sx={{
                      fontWeight: 700,
                      fontSize: '1.125rem',
                      px: 3,
                      pt: 3,
                      pb: 1,
                    }}
                  >
                    {t('auth.account.avatar_customization.title')}
                  </Typography>

                  {/* Tabs */}
                  <Box sx={{ px: 1 }}>
                    <Tabs
                      value={activeAvatarTab}
                      onChange={(_, value) => setActiveAvatarTab(value)}
                      sx={{
                        minHeight: 48,
                        '& .MuiTabs-indicator': {
                          height: 3,
                        },
                        borderBottom: 1,
                        borderColor: 'divider',
                        px: 2,
                      }}
                    >
                      {avatarTabs.map((tab) => (
                        <Tab
                          key={tab.id}
                          value={tab.id}
                          label={tab.label}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            minHeight: 48,
                            px: 1,
                          }}
                        />
                      ))}
                    </Tabs>
                  </Box>

                  {/* Upload Area */}
                  <Box sx={{ p: 3 }}>
                    <Box
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        borderRadius: 2,
                        border: 2,
                        borderStyle: 'dashed',
                        borderColor: 'divider',
                        px: 2,
                        py: 4,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative',
                        '&:hover': {
                          borderColor: 'primary.light',
                          '& .avatar-overlay': {
                            opacity: 1,
                          },
                        },
                      }}
                    >
                      <input
                        ref={fileInputRef}
                        type='file'
                        accept='image/*'
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />

                      <Box sx={{ position: 'relative', mb: 1 }}>
                        <Avatar
                          src={avatarUrl}
                          sx={{
                            width: 96,
                            height: 96,
                            boxShadow: 2,
                          }}
                        />
                        <Box
                          className='avatar-overlay'
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            borderRadius: '50%',
                            bgcolor: 'rgba(0, 0, 0, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                          }}
                        >
                          <Edit sx={{ color: 'white' }} />
                        </Box>
                      </Box>

                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant='body1' fontWeight={700}>
                          {t('auth.account.avatar_customization.change_photo')}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {t('auth.account.avatar_customization.drop_image')}
                        </Typography>
                      </Box>

                      <Button
                        size='small'
                        variant='outlined'
                        startIcon={<CloudUpload />}
                        sx={{
                          mt: 1,
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {t('auth.account.avatar_customization.select_file')}
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* 2FA Promo Card */}
              <Card
                sx={{
                  borderRadius: 1,
                  boxShadow: 1,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Shield sx={{ fontSize: 28 }} />
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant='h6'
                        fontWeight={700}
                        sx={{ mb: 0.5, color: 'text.primary' }}
                      >
                        {t('auth.mfa.title')}
                      </Typography>
                      <Typography variant='body2' sx={{ mb: 2 }}>
                        {t('auth.account.security.enable_2fa_message')}
                      </Typography>
                      <Button
                        variant='contained'
                        size='small'
                        onClick={() => navigate(Path.mfa.setup)}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.8125rem',
                        }}
                      >
                        {t('auth.account.setup_now')}
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Right Column: Form Sections */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Personal Details */}
              <Card
                sx={{
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  border: 1,
                  borderColor: 'transparent',
                  borderRadius: 1,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Person sx={{ color: 'text.secondary' }} />
                    <Typography variant='h6' fontWeight={700} sx={{ fontSize: '1.125rem' }}>
                      {t('auth.account.personal_details')}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 2.5,
                    }}
                  >
                    <Box>
                      <Controller
                        name='firstName'
                        control={controlForm.control}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label={t('auth.account.first_name')}
                            placeholder={t('auth.account.first_name')}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                bgcolor: 'background.paper',
                              },
                            }}
                          />
                        )}
                      />
                    </Box>
                    <Box>
                      <Controller
                        name='lastName'
                        control={controlForm.control}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label={t('auth.account.last_name')}
                            placeholder={t('auth.account.last_name')}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                bgcolor: 'background.paper',
                              },
                            }}
                          />
                        )}
                      />
                    </Box>
                    <Box>
                      <Controller
                        name='email'
                        control={controlForm.control}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label={t('auth.account.email')}
                            placeholder={t('auth.account.email')}
                            type='email'
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                bgcolor: 'background.paper',
                              },
                            }}
                          />
                        )}
                      />
                    </Box>
                    <Box>
                      <Controller
                        name='phone'
                        control={controlForm.control}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label={t('auth.account.phone')}
                            placeholder={t('auth.account.phone')}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                bgcolor: 'background.paper',
                              },
                            }}
                          />
                        )}
                      />
                    </Box>
                    <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
                      <Controller
                        name='biography'
                        control={controlForm.control}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            fullWidth
                            multiline
                            rows={4}
                            label={t('auth.account.biography')}
                            placeholder={t('auth.account.biography_placeholder')}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                bgcolor: 'background.paper',
                              },
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Regional & Preferences */}
              <Card
                sx={{
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  border: 1,
                  borderColor: 'transparent',
                  borderRadius: 1,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Settings sx={{ color: 'text.secondary' }} />
                    <Typography variant='h6' fontWeight={700} sx={{ fontSize: '1.25rem' }}>
                      {t('auth.account.regional_preferences')}
                    </Typography>
                  </Box>

                  {/* Regional Settings */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 2.5,
                    }}
                  >
                    <Box>
                      <Controller
                        name='language'
                        control={controlForm.control}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>{t('auth.account.language')}</InputLabel>
                            <Select
                              {...field}
                              label={t('auth.account.language')}
                              IconComponent={ExpandMore}
                            >
                              {LANGUAGES.map((lang) => (
                                <MenuItem key={lang.value} value={lang.value}>
                                  {t(lang.label)}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Box>

                    <Box>
                      <Controller
                        name='timezone'
                        control={controlForm.control}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>{t('auth.account.timezone')}</InputLabel>
                            <Select
                              {...field}
                              label={t('auth.account.timezone')}
                              IconComponent={ExpandMore}
                            >
                              {TIMEZONES.map((tz) => (
                                <MenuItem key={tz.value} value={tz.value}>
                                  {t(tz.label)}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Box>

                    <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
                      <Controller
                        name='dateFormat'
                        control={controlForm.control}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>{t('auth.account.date_format')}</InputLabel>
                            <Select
                              {...field}
                              label={t('auth.account.date_format')}
                              IconComponent={ExpandMore}
                            >
                              {DATE_FORMATS.map((format) => (
                                <MenuItem key={format.value} value={format.value}>
                                  {t(format.label)}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Typography
                    variant='subtitle2'
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      color: 'text.primary',
                      mb: 2,
                    }}
                  >
                    {t('auth.account.notifications_privacy')}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Controller
                      name='emailOnComment'
                      control={controlForm.control}
                      render={({ field }) => (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                            py: 0.5,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant='body2' fontWeight={500} sx={{ mb: 0.25 }}>
                              {t('auth.account.email_notifications')}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {t('auth.account.email_notifications_desc')}
                            </Typography>
                          </Box>
                          <Switch
                            checked={Boolean(field.value ?? true)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        </Box>
                      )}
                    />

                    <Controller
                      name='emailOnCommentReply'
                      control={controlForm.control}
                      render={({ field }) => (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant='body2' fontWeight={500} sx={{ mb: 0.25 }}>
                              {t('auth.account.reply_notifications')}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {t('auth.account.reply_notifications_desc')}
                            </Typography>
                          </Box>
                          <Switch
                            checked={Boolean(field.value ?? true)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        </Box>
                      )}
                    />

                    <Controller
                      name='emailOnAchievement'
                      control={controlForm.control}
                      render={({ field }) => (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant='body2' fontWeight={500} sx={{ mb: 0.25 }}>
                              {t('auth.account.achievement_notifications')}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {t('auth.account.achievement_notifications_desc')}
                            </Typography>
                          </Box>
                          <Switch
                            checked={Boolean(field.value ?? true)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        </Box>
                      )}
                    />

                    <Controller
                      name='emailOnNewDeviceLogin'
                      control={controlForm.control}
                      render={({ field }) => (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant='body2' fontWeight={500} sx={{ mb: 0.25 }}>
                              {t('auth.account.new_device_alerts')}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {t('auth.account.new_device_alerts_desc')}
                            </Typography>
                          </Box>
                          <Switch
                            checked={Boolean(field.value ?? true)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        </Box>
                      )}
                    />

                    <Controller
                      name='emailOnWatchlist'
                      control={controlForm.control}
                      render={({ field }) => (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant='body2' fontWeight={500} sx={{ mb: 0.25 }}>
                              {t('auth.account.watchlist_notifications')}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {t('auth.account.watchlist_notifications_desc')}
                            </Typography>
                          </Box>
                          <Switch
                            checked={Boolean(field.value ?? true)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        </Box>
                      )}
                    />

                    <Controller
                      name='emailOnMention'
                      control={controlForm.control}
                      render={({ field }) => (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant='body2' fontWeight={500} sx={{ mb: 0.25 }}>
                              {t('auth.account.mention_notifications')}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {t('auth.account.mention_notifications_desc')}
                            </Typography>
                          </Box>
                          <Switch
                            checked={Boolean(field.value ?? true)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        </Box>
                      )}
                    />
                  </Box>
                </CardContent>
              </Card>

              {/* GDPR & Data Management */}
              <Card
                sx={{
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  border: 1,
                  borderColor: 'transparent',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Shield sx={{ color: 'text.secondary' }} />
                    <Typography variant='h6' fontWeight={700} sx={{ fontSize: '1.25rem' }}>
                      {t('auth.account.gdpr_data_management')}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {/* Data Export */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: 'primary.50',
                          color: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <CloudDownload />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant='subtitle1' fontWeight={700} sx={{ mb: 0.5 }}>
                          {t('auth.account.export_data_title')}
                        </Typography>
                        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                          {t('auth.account.export_data_desc_detailed')}
                        </Typography>
                        <Button
                          variant='outlined'
                          size='small'
                          onClick={handleExportData}
                          disabled={isExporting}
                          startIcon={
                            isExporting ? <CircularProgress size={16} /> : <CloudDownload />
                          }
                          sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          {isExporting
                            ? t('auth.account.exporting')
                            : t('auth.account.request_data_download')}
                        </Button>
                      </Box>
                    </Box>

                    <Divider />

                    {/* Account Erasure */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: 'error.50',
                          color: 'error.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Delete />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant='subtitle1' fontWeight={700} sx={{ mb: 0.5 }}>
                          {t('auth.account.delete_account_title')}
                        </Typography>
                        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                          {t('auth.account.delete_account_desc_detailed')}
                        </Typography>
                        <Button
                          variant='outlined'
                          color='error'
                          size='small'
                          onClick={() => setErasureDialogOpen(true)}
                          startIcon={<Delete />}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: 'error.light',
                            '&:hover': {
                              bgcolor: 'error.50',
                              borderColor: 'error.main',
                            },
                          }}
                        >
                          {t('auth.account.delete_my_account')}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Erasure Confirmation Dialog */}
      <Dialog
        open={erasureDialogOpen}
        onClose={() => !isDeleting && setErasureDialogOpen(false)}
        maxWidth='xs'
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, p: 1 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          {t('auth.account.delete_account_confirm_title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            {t('auth.account.delete_account_confirm_desc')}
          </DialogContentText>
          <Alert severity='warning' sx={{ mb: 3, '& .MuiAlert-message': { fontWeight: 500 } }}>
            {t('auth.account.delete_account_warning')}
          </Alert>
          <TextField
            fullWidth
            type='password'
            label={t('auth.account.confirm_password')}
            placeholder={t('auth.account.enter_password_to_delete')}
            value={erasurePassword}
            onChange={(e) => setErasurePassword(e.target.value)}
            disabled={isDeleting}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setErasureDialogOpen(false)}
            disabled={isDeleting}
            sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
          >
            {t('auth.account.cancel')}
          </Button>
          <Button
            onClick={handleErasureAccount}
            variant='contained'
            color='error'
            disabled={!erasurePassword || isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} color='inherit' /> : <Delete />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            {isDeleting ? t('auth.account.deleting') : t('auth.account.confirm_delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

