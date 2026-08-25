import { useCallback, useRef, useMemo } from 'react';
import { Box, Button, Typography, Chip, CardContent, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Grid, Container, Avatar, IconButton } from '@mui/material';
import Edit from '@mui/icons-material/Edit';
import LockReset from '@mui/icons-material/LockReset';
import Mail from '@mui/icons-material/Mail';
import Download from '@mui/icons-material/Download';
import Delete from '@mui/icons-material/Delete';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Verified from '@mui/icons-material/Verified';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Path } from '@cap/module-auth/routes/path';
import { useUserProfile, useUpdatePhoto } from '../../hooks/useUserQuery';
import { useAuth, useNotifications } from '@cap/platform-core';

const zIndexScale = {
  local: {
    above: 10,
    overlay: 20,
  },
}

const avatarPlaceHolder =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC4W5RRAYigwLIDhLEuhu9VmA04sosIuLA2wEgoKMlE4Yzh3xR7T6bg4g1AEiMxukr5jzTFqXnC6zJ9Hc4f_sChyHqrKLIy18UHddF2WVE-tQoBbXHG6Yq35VVQhhsEZkhVZTblhOu-QWVUtFN-3UGZTKMK6dDf_-tYtrTOLnKjb3uvm83b47AjPiRqopfR9onkbIlHxoJ1aiuY6d29bBbRyDSN73MAk3Hc7e56GwIVW485omnHQCYbfQk4vYHsbpd9iBNuFGaCXMA'

export default function ProfileView() {
  const navigate = useNavigate()
  const { t } = useTranslation('common')
  const { user } = useAuth()
  const { data: profileResponse } = useUserProfile()
  const { addNotification } = useNotifications()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updatePhotoMutation = useUpdatePhoto({
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: t('auth.account.success', 'Success'),
        message: t('auth.account.avatar_updated', 'Avatar updated successfully.'),
      })
    },
    onError: (err: any) => {
      addNotification({
        type: 'error',
        title: t('auth.account.error', 'Error'),
        message: err.message || t('auth.account.avatar_update_error', 'Failed to update avatar.'),
      })
    },
  })

  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      updatePhotoMutation.mutate({ photo: file })
    }
  }, [updatePhotoMutation])

  const quickActions = useMemo(
    () => [
      {
        id: 'edit-profile',
        label: t('auth.account.edit_profile'),
        description: t('auth.account.edit_profile_desc'),
        icon: <Edit />,
        primary: true,
        onClick: () => navigate(Path.account.edit),
      },
      {
        id: 'change-password',
        label: t('auth.account.change_password'),
        description: t('auth.account.change_password_desc'),
        icon: <LockReset />,
        onClick: () => navigate(Path.account.settings),
      },
      {
        id: 'change-email',
        label: t('auth.account.change_email'),
        description: t('auth.account.change_email_desc'),
        icon: <Mail />,
        onClick: () => navigate(Path.account.changeEmail),
      },
      {
        id: 'linked-accounts',
        label: t('auth.account.linked_accounts', 'Linked Accounts'),
        description: t('auth.account.linked_accounts_desc', 'Manage Google, GitHub, and SAML connections'),
        icon: <Verified />,
        onClick: () => navigate(Path.account.linkedAccounts),
      },
      {
        id: 'export-data',
        label: t('auth.account.export_data'),
        description: t('auth.account.export_data_desc'),
        icon: <Download />,
        onClick: () => console.log('Export data'),
      },
      {
        id: 'delete-account',
        label: t('auth.account.delete_account'),
        description: t('auth.account.delete_account_desc'),
        icon: <Delete />,
        danger: true,
        onClick: () => navigate(Path.account.delete),
      },
    ],
    [t, navigate],
  )

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Main Content */}

      <Box component='main' sx={{ flex: 1, py: { xs: 3, md: 6 } }}>
        <Container maxWidth='lg'>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant='h3'
              fontWeight={900}
              sx={{
                fontSize: { xs: '1.875rem', md: '2.25rem' },
                letterSpacing: '-0.033em',
                mb: 1,
              }}
            >
              {t('auth.account.profile_settings')}
            </Typography>

            <Typography variant='body1' color='text.secondary'>
              {t('auth.account.profile_settings_subtitle')}
            </Typography>
          </Box>

          {/* Dashboard Grid */}

          <Grid container spacing={3}>
            {/* Left Column - Identity & Details */}

            <Grid size={{ xs: 12, lg: 8 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Identity Card */}

                <Box
                  sx={{
                    p: { xs: 3, md: 4 },
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'center', sm: 'flex-start' },
                    gap: 3,
                  }}
                >
                  {/* Avatar with Edit Overlay */}

                  <Box sx={{ position: 'relative', flexShrink: 0 }}>
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='image/*'
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />

                    <Box
                      sx={{
                        position: 'relative',
                        cursor: 'pointer',
                        '&:hover .avatar-overlay': {
                          opacity: 1,
                        },
                      }}
                      onClick={handleAvatarClick}
                    >
                      <Avatar
                        alt={user?.firstName || ''}
                        src={user?.avatar || avatarPlaceHolder}
                        sx={{
                          width: 128,
                          height: 128,
                          border: 4,
                          borderColor: 'background.paper',
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
                          bgcolor: 'rgba(0, 0, 0, 0.4)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          zIndex: zIndexScale.local.above,
                        }}
                      >
                        <PhotoCamera sx={{ color: 'white', fontSize: 32 }} />
                      </Box>

                      <IconButton
                        size='small'
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          bgcolor: 'primary.main',
                          color: 'white',
                          border: 2,
                          borderColor: 'background.paper',
                          zIndex: zIndexScale.local.overlay,
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          },
                        }}
                      >
                        <Edit fontSize='small' />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* User Info */}

                  <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' }, width: '100%' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'center', sm: 'flex-start' },
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      {user?.firstName} {user?.lastName}
                      <Button
                        onClick={() => navigate(Path.account.edit)}
                        size='small'
                        sx={{
                          display: { xs: 'none', sm: 'block' },
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        {t('auth.account.edit_info')}
                      </Button>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: { xs: 'center', sm: 'flex-start' },
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Typography color='text.secondary'>{user?.email || ''}</Typography>

                      <Chip
                        icon={<Verified sx={{ fontSize: 14 }} />}
                        label={
                          user?.emailVerified
                            ? t('auth.account.verified')
                            : t('auth.account.unverified')
                        }
                        size='small'
                        color={user?.emailVerified ? 'success' : 'error'}
                        variant='outlined'
                        sx={{
                          height: 24,
                          fontSize: '0.75rem',
                          '& .MuiChip-icon': {
                            ml: 0.5,
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

                    {/* Quick Stats Grid */}

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            textAlign: { xs: 'center', sm: 'left' },
                          }}
                        >
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            fontWeight={600}
                            sx={{
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              display: 'block',
                              mb: 0.5,
                            }}
                          >
                            {t('auth.account.status')}
                          </Typography>

                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              justifyContent: { xs: 'center', sm: 'flex-start' },
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: user?.status === 'active' ? 'success.main' : 'error.main',
                              }}
                            />

                            <Typography variant='body2' fontWeight={500}>
                              {user?.status === 'active'
                                ? t('auth.account.active')
                                : t('auth.account.inactive')}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            textAlign: { xs: 'center', sm: 'left' },
                          }}
                        >
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            fontWeight={600}
                            sx={{
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              display: 'block',
                              mb: 0.5,
                            }}
                          >
                            {t('auth.account.last_activity')}
                          </Typography>

                          <Typography variant='body2' fontWeight={500}>
                            {user?.updatedAt || 'N/A'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            textAlign: { xs: 'center', sm: 'left' },
                          }}
                        >
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            fontWeight={600}
                            sx={{
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              display: 'block',
                              mb: 0.5,
                            }}
                          >
                            {t('auth.account.created_at')}
                          </Typography>
                          <Typography variant='body2' fontWeight={500}>
                            {user?.createdAt || 'N/A'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>

                {/* Personal Information Card */}

                <Box
                  sx={{
                    px: 3,
                    py: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant='h6' fontWeight={700}>
                    {t('auth.account.personal_details')}
                  </Typography>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    {(user?.firstName || user?.lastName) && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box>
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            fontWeight={500}
                            sx={{ display: 'block', mb: 0.5 }}
                          >
                            {t('auth.account.full_name')}
                          </Typography>

                          <Typography
                            variant='h4'
                            fontWeight={800}
                            sx={{
                              mb: 0.5,
                              letterSpacing: '-0.02em',
                              textTransform: 'capitalize',
                            }}
                          >
                            {user?.firstName && user?.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user?.email.split('@')[0]}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {user?.email && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box>
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            fontWeight={500}
                            sx={{ display: 'block', mb: 0.5 }}
                          >
                            {t('auth.account.email')}
                          </Typography>

                          <Box
                            sx={{
                              px: 1.5,
                              py: 1,
                              borderRadius: 1,
                            }}
                          >
                            <Typography variant='body1'>{user?.email}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}

                    {user?.phone && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box>
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            fontWeight={500}
                            sx={{ display: 'block', mb: 0.5 }}
                          >
                            {t('auth.account.phone')}
                          </Typography>

                          <Box
                            sx={{
                              bgcolor: 'grey.50',
                              px: 1.5,
                              py: 1,
                              borderRadius: 1,
                            }}
                          >
                            <Typography variant='body1'>{user?.phone}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Box>
            </Grid>

            {/* Right Column - Quick Actions */}

            <Grid size={{ xs: 12, lg: 4 }}>
              <Box sx={{ p: 3, pb: 1 }}>
                <Typography variant='h5' fontWeight={700} gutterBottom>
                  {t('auth.account.quick_actions')}
                </Typography>

                <Typography variant='body2' color='text.secondary'>
                  {t('auth.account.quick_actions_desc')}
                </Typography>
              </Box>

              <List sx={{ p: 2 }}>
                {quickActions.map((action, index) => (
                  <Box key={action.id}>
                    <ListItem
                      disablePadding
                      sx={{
                        mb: index === quickActions.length - 1 ? 0 : 1.5,
                      }}
                    >
                      <ListItemButton
                        onClick={action.onClick}
                        sx={{
                          borderRadius: 1.5,
                          bgcolor: action.primary
                            ? 'primary.lighter'
                            : action.danger
                              ? 'error.lighter'
                              : 'transparent',
                          border: 1,
                          borderColor: action.danger ? 'error.light' : 'transparent',
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 56,

                            color: action.danger
                              ? 'error.main'
                              : action.primary
                                ? 'primary.main'
                                : 'text.secondary',
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: 1,
                            }}
                          >
                            {action.icon}
                          </Box>
                        </ListItemIcon>

                        <ListItemText
                          primary={action.label}
                          secondary={action.description}
                          primaryTypographyProps={{
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            color: action.danger ? 'error.main' : 'text.primary',
                          }}
                          secondaryTypographyProps={{
                            fontSize: '0.75rem',
                            color: action.danger ? 'error.dark' : 'text.secondary',
                          }}
                        />

                        {!action.danger && (
                          <ChevronRight sx={{ color: 'text.disabled', fontSize: 20 }} />
                        )}
                      </ListItemButton>
                    </ListItem>

                    {action.id === 'export-data' && (
                      <Box sx={{ height: 1, bgcolor: 'divider', my: 2, mx: 2 }} />
                    )}
                  </Box>
                ))}
              </List>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  )
}

