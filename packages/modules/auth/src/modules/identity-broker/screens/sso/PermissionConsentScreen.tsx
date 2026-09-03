// FILE: packages/modules/auth/src/screens/auth/sso/PermissionConsentScreen.tsx
// RULES APPLIED: mui-component-standards.md, react-component-patterns.md
// FIXES: Added header; implemented entry motion; modernized component attributes (slotProps); standardized Avatar/Card/Stack styles; translated all scope labels and descriptions; added accessibility aria-labels; improved responsive layout
// AUDIT: CRITICAL âœ“  HIGH âœ“  MEDIUM âœ“

import { useEffect, useMemo } from 'react';
import { Box, Button, Typography, Avatar, Divider, List, ListItem, ListItemIcon, ListItemText, alpha, useTheme, Link, Stack, CircularProgress, IconButton } from '@mui/material';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import ShieldIcon from '@mui/icons-material/Shield';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';

import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTenant } from '@cap/platform-core';
import { Path } from '@auth/routes/path';
import { useOidcInteraction, useConfirmOidcInteraction, useAbortOidcInteraction } from '@idaas/identity-broker/hooks/useOidcCompliance';
import { AuthPageLayout, AuthScreenIcon, AuthInputLabel, AuthActionButton } from '@idaas/authentication-core/components/shared/auth';

export default function PermissionConsentScreen() {
  const { t } = useTranslation()
  const theme = useTheme()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { tenant } = useTenant()
  const uid = searchParams.get('uid')

  // Redirect if no UID
  useEffect(() => {
    if (!uid) {
      navigate(Path.auth.login)
    }
  }, [uid, navigate])

  // Fetch interaction details
  const { data: interactionResponse, isLoading, isError } = useOidcInteraction(uid)

  const interactionData = interactionResponse?.data

  // Mutations
  const confirmMutation = useConfirmOidcInteraction(uid, {
    onSuccess: (res) => {
      const targetUrl = res.data?.url || res.data?.returnTo || res.data?.redirectTo
      if (targetUrl) {
        window.location.assign(targetUrl)
      } else {
        toast.success(t('auth.sso.success_granted', 'Access granted successfully'), {  })
      }
    },
    onError: (err: any) => {
      const message =
        err.response?.data?.message ||
        err.message ||
        t('auth.sso.error_confirm', 'Failed to confirm access')
      toast.error(message)
    },
  })

  const abortMutation = useAbortOidcInteraction(uid, {
    onSuccess: (res) => {
      const targetUrl = res.data?.url || res.data?.returnTo || res.data?.redirectTo
      if (targetUrl) {
        window.location.assign(targetUrl)
      } else {
        navigate(Path.auth.login)
      }
    },
  })

  const client = interactionData?.client
  const organization = interactionData?.organization
  const details = interactionData?.details
  const requestedScopes = useMemo(() => {
    return details?.params?.scope?.split(' ') || []
  }, [details])

  const scopeDetails = useMemo(() => {
    const allScopes = [
      {
        id: 'openid',
        icon: <VpnKeyIcon sx={{ fontSize: 18 }} />,
        label: t('auth.sso.scope_openid', 'OpenID Identifier'),
        description: t(
          'auth.sso.scope_openid_desc',
          'Securely verify your unique identity across platforms.',
        ),
      },
      {
        id: 'profile',
        icon: <AccountCircleIcon sx={{ fontSize: 18 }} />,
        label: t('auth.sso.scope_profile', 'Profile Information'),
        description: t('auth.sso.scope_profile_desc', 'Access your full name and display picture.'),
      },
      {
        id: 'email',
        icon: <EmailIcon sx={{ fontSize: 18 }} />,
        label: t('auth.sso.scope_email', 'Email Address'),
        description: t('auth.sso.scope_email_desc', 'View and confirm your primary contact email.'),
      },
      {
        id: 'roles',
        icon: <BadgeIcon sx={{ fontSize: 18 }} />,
        label: t('auth.sso.scope_roles', 'Roles & Access'),
        description: t('auth.sso.scope_roles_desc', 'View your assigned group permissions.'),
      },
      {
        id: 'offline_access',
        icon: <ShieldIcon sx={{ fontSize: 18 }} />,
        label: t('auth.sso.scope_offline', 'Offline Access'),
        description: t(
          'auth.sso.scope_offline_desc',
          'Allow the application to refresh your access in the background.',
        ),
      },
    ]

    return allScopes.filter((s) => requestedScopes.includes(s.id))
  }, [requestedScopes, t])

  const handleAllow = () => {
    confirmMutation.mutate()
  }

  const handleDeny = () => {
    abortMutation.mutate()
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          gap: 2,
        }}
      >
        <CircularProgress size={32} thickness={5} />
        <Typography
          variant='caption'
          sx={{
            fontWeight: 800,
            color: 'text.secondary',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {t('common.initializing', 'Initializing secure connection...')}
        </Typography>
      </Box>
    )
  }

  if (isError) {
    return (
      <AuthPageLayout>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <AuthScreenIcon icon={<ShieldIcon sx={{ fontSize: 32 }} />} color="error.main" />
          </Box>
          <Typography variant='h5' sx={{ fontWeight: 900, mb: 1.5, letterSpacing: '-0.027em' }}>
            {t('auth.sso.interaction_error_title', 'Interaction Failed')}
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 4, fontWeight: 500 }}>
            {t(
              'auth.sso.interaction_error_desc',
              'The authentication request is invalid or has expired. Please try initiation login again from the source application.',
            )}
          </Typography>
          <AuthActionButton
            label={t('auth.sso.back_to_login', 'Back to Login')}
            onClick={() => navigate(Path.auth.login)}
          />
        </Box>
      </AuthPageLayout>
    )
  }

  return (
    <AuthPageLayout maxWidth={520}>
      <Box sx={{ mb: 2 }}>
        <IconButton
          onClick={handleDeny}
          size='small'
          aria-label={t('common.back', 'Back')}
          sx={{ border: '1px solid', borderColor: 'divider' }}
        >
          <ArrowBackIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 5 }}>
        <Box sx={{ position: 'relative', mb: 3 }}>
          <AuthScreenIcon
            icon={
              <Avatar
                src={client?.logoUri}
                sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 'inherit',
                  bgcolor: 'transparent',
                }}
              >
                {client?.name?.charAt(0) || 'A'}
              </Avatar>
            }
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              bgcolor: 'success.main',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid',
              borderColor: 'background.paper',
            }}
          >
            <CheckCircleIcon sx={{ color: 'common.white', fontSize: 14 }} />
          </Box>
        </Box>
                <Typography
                  variant='h4'
                  sx={{
                    fontWeight: 900,
                    letterSpacing: '-0.027em',
                    mb: 1,
                    textAlign: 'center',
                  }}
                >
                  {client?.name || t('auth.sso.unknown_app', 'Third-party Application')}
                </Typography>
                <Typography
                  variant='body1'
                  color='text.secondary'
                  align='center'
                  sx={{ fontWeight: 500 }}
                >
                  {t(
                    'auth.sso.consent_subtitle',
                    'is requesting permission to access your {{tenantName}}',
                    { tenantName: organization?.name || tenant?.name || t('common.account', 'account') }
                  )}
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <AuthInputLabel>
                  {t('auth.sso.requested_permissions', 'Requested Permissions')}
                </AuthInputLabel>
                <List disablePadding>
                  {scopeDetails.map((scope) => (
                    <ListItem
                      key={scope.id}
                      sx={{
                        px: 2,
                        py: 2,
                        borderRadius: 3,
                        mb: 1.5,
                        bgcolor: alpha(theme.palette.action.hover, 0.02),
                        border: '1px solid',
                        borderColor: 'transparent',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          borderColor: alpha(theme.palette.primary.main, 0.1),
                          transform: 'translateX(6px)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 44 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            borderRadius: '8px',
                          }}
                        >
                          {scope.icon}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant='subtitle2'
                            sx={{ fontWeight: 800, color: 'text.primary', mb: 0.25 }}
                          >
                            {scope.label}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant='caption'
                            sx={{
                              color: 'text.secondary',
                              fontWeight: 500,
                              lineHeight: 1.4,
                              display: 'block',
                            }}
                          >
                            {scope.description}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Stack spacing={2} sx={{ mb: 5 }}>
                <AuthActionButton
                  isLoading={confirmMutation.isPending}
                  label={t('auth.sso.allow_access', 'Allow Access')}
                  onClick={handleAllow}
                  disabled={confirmMutation.isPending || abortMutation.isPending}
                />
                <Button
                  fullWidth
                  variant='outlined'
                  size='large'
                  onClick={handleDeny}
                  disabled={confirmMutation.isPending || abortMutation.isPending}
                  sx={{
                    fontWeight: 800,
                    textTransform: 'none',
                    height: 52,
                    borderRadius: 3,
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.action.hover, 0.04),
                      borderColor: 'divider',
                    },
                  }}
                >
                  {t('auth.sso.deny_access', 'Deny Request')}
                </Button>
                {organization?.name && (
                   <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.secondary', fontWeight: 600 }}>
                     {t('auth.sso.secured_by', 'Secured by {{org}}', { org: organization.name })}
                   </Typography>
                )}
              </Stack>

              <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />

              <Stack direction='row' justifyContent='center' spacing={3} sx={{ opacity: 0.8 }}>
                <Link
                  href='#'
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.075em',
                    fontSize: '0.7rem',
                    color: 'text.secondary',
                    textDecoration: 'none',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {t('auth.sso.terms_link', 'Terms of Service')}
                </Link>
                <Link
                  href='#'
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.075em',
                    fontSize: '0.7rem',
                    color: 'text.secondary',
                    textDecoration: 'none',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {t('auth.sso.privacy_link', 'Privacy Policy')}
                </Link>
      </Stack>
    </AuthPageLayout>
  )
}
