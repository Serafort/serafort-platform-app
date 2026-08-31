// Apply standard: useTranslation('auth'), scale anim, remove Container wrapper, namespace keys
// All complex SSO/OIDC interaction logic preserved intact.
import React, { useMemo } from 'react'
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Avatar,
  Divider,
  alpha,
  useTheme,
  Grid,
  Paper,
  CircularProgress,
  Backdrop,
  Skeleton,
  Stack,
} from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'
import GitHubIcon from '@mui/icons-material/GitHub'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CloudDoneIcon from '@mui/icons-material/CloudDone'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { themeConfig, useAppStore, API_CONFIG } from '@cap/platform-core'
import {
  useOidcInteraction,
  useConfirmOidcInteraction,
} from '@auth/identity-broker/hooks/useOidcCompliance'
import { Path } from '@auth/routes/path'
import { ENDPOINTS } from '@cap/platform-core'

interface OIDCLoginPromptProps {
  user?: { name: string; email: string; avatar?: string }
  isPending?: boolean
}

const ALL_PROVIDERS = [
  { id: 'google', name: 'Google', icon: <GoogleIcon />, color: '#EA4335' },
  { id: 'github', name: 'GitHub', icon: <GitHubIcon />, color: '#333333' },
]

export default function OIDCLoginPrompt({
  user: initialUser,
  isPending: initialPending = false,
}: OIDCLoginPromptProps) {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const uid = searchParams.get('uid') || searchParams.get('interaction')
  const authUser = useAppStore((state) => state.user)
  const { data: interactionData, isLoading: isFetching } = useOidcInteraction(uid)
  const details = interactionData?.data

  const { mutate: confirm, isPending: isConfirming } = useConfirmOidcInteraction(uid, {
    onSuccess: (res: any) => {
      if (res.data?.url) window.location.assign(res.data.url)
      else navigate(Path.auth.login)
    },
    onError: () => toast.error(t('sso.errorConfirm', 'Failed to confirm account')),
  })

  const user = useMemo(() => {
    const rawUser =
      initialUser ||
      authUser ||
      (details?.session?.accountId
        ? { name: 'User ' + details?.session?.accountId, email: 'user@example.com' }
        : undefined)
    if (!rawUser) return undefined
    const name =
      (rawUser as any).name ||
      (rawUser as any).fullName ||
      ((rawUser as any).firstName
        ? `${(rawUser as any).firstName} ${(rawUser as any).lastName || ''}`.trim()
        : '')
    return {
      ...rawUser,
      displayName: name || t('common.guest', 'Guest User'),
      displayEmail: (rawUser as any).email || t('common.notSignedIn', 'Not signed in'),
      avatar: (rawUser as any).avatar ?? undefined,
    }
  }, [initialUser, authUser, details, t])

  const isPending = initialPending || isFetching || isConfirming
  const displayName = user?.displayName || t('common.guest', 'Guest User')
  const displayEmail = user?.displayEmail || t('common.notSignedIn', 'Not signed in')
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
  const activeProviders = useMemo(() => {
    const allowed = (details as any)?.organization?.securityPolicies?.allowedSsoProviders
    if (!allowed || !Array.isArray(allowed)) return ALL_PROVIDERS
    return ALL_PROVIDERS.filter((p) => allowed.includes(p.id))
  }, [details])

  const handleUserClick = () => {
    if (isPending || !uid) return
    confirm()
  }
  const handleProviderClick = (providerId: string) => {
    const interactionParam = uid && uid !== 'null' ? `?interaction=${uid}` : ''
    window.location.assign(
      `${API_CONFIG.baseURL}${ENDPOINTS.auth.social.redirect(providerId)}${interactionParam}`,
    )
  }
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleUserClick()
    }
  }

  return (
    <Box
      className='animate-scale-in'
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      sx={{ width: '100%', maxWidth: 520, mx: 'auto', p: { xs: 2, md: 4 } }}
    >
      <Card
        sx={{
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
          overflow: 'hidden',
          bgcolor: 'background.paper',
          position: 'relative',
        }}
      >
        <Backdrop
          open={isConfirming}
          sx={{
            position: 'absolute',
            zIndex: theme.zIndex.drawer + 1,
            color: 'primary.main',
            bgcolor: alpha(theme.palette.background.paper, 0.7),
          }}
        >
          <CircularProgress color='inherit' />
        </Backdrop>

        <Box sx={{ position: 'relative' }}>
          <Box
            aria-hidden='true'
            sx={{
              height: 140,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                opacity: 0.1,
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />
            <Avatar
              src={user?.avatar}
              aria-label={displayName}
              sx={{
                width: 80,
                height: 80,
                border: '4px solid',
                borderColor: 'background.paper',
                backgroundColor: 'background.paper',
                boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.12)}`,
                position: 'absolute',
                bottom: -40,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 2,
              }}
            >
              {initials}
            </Avatar>
          </Box>

          <CardContent sx={{ p: 3 }}>
            <Box sx={{ mt: { xs: 5, md: 7 }, mb: 4, textAlign: 'center' }}>
              <Typography variant='h4' sx={{ fontWeight: 900, letterSpacing: '-0.027em', mb: 1 }}>
                {t('sso.loginTitle', 'Sign in to {{appName}}', {
                  appName: themeConfig.templateName,
                })}
              </Typography>
              <Typography variant='body1' color='text.secondary' sx={{ fontWeight: 500 }}>
                {t('sso.loginSubtitle', 'Choose your preferred way to continue')}
              </Typography>
            </Box>

            {isFetching ? (
              <Skeleton
                variant='rectangular'
                height={72}
                sx={{ borderRadius: 3, mb: 4, transform: 'none' }}
              />
            ) : (
              <Paper
                elevation={0}
                role='button'
                tabIndex={0}
                onClick={handleUserClick}
                onKeyDown={handleKeyDown}
                sx={{
                  p: 2,
                  mb: 4,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                  },
                  '&:focus-visible': {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: '2px',
                  },
                }}
              >
                <Avatar
                  src={user?.avatar}
                  aria-label={displayName}
                  sx={{
                    width: 48,
                    height: 48,
                    backgroundColor: theme.palette.primary.main,
                    color: 'primary.contrastText',
                    fontWeight: 800,
                  }}
                >
                  {initials}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant='subtitle1' sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    {displayName}
                  </Typography>
                  <Typography
                    variant='caption'
                    sx={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.075em',
                      color: 'text.secondary',
                    }}
                  >
                    {displayEmail}
                  </Typography>
                </Box>
                <ArrowForwardIcon fontSize='small' color='primary' />
              </Paper>
            )}

            <Divider sx={{ mb: 4, opacity: 0.5 }}>
              <Typography
                variant='caption'
                sx={{
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'text.secondary',
                }}
              >
                {t('sso.orSignInWith', 'Or sign in with')}
              </Typography>
            </Divider>

            <Grid container spacing={2}>
              {isFetching ? (
                [1, 2].map((i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6 }}>
                    <Skeleton
                      variant='rectangular'
                      height={80}
                      sx={{ borderRadius: 3, transform: 'none' }}
                    />
                  </Grid>
                ))
              ) : activeProviders.length > 0 ? (
                activeProviders.map((provider) => (
                  <Grid key={provider.id} size={{ xs: 12, sm: 6 }}>
                    <Button
                      fullWidth
                      variant='outlined'
                      size='large'
                      disabled={isPending}
                      onClick={() => handleProviderClick(provider.id)}
                      sx={{
                        height: { xs: 52, sm: 80 },
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 700,
                        color: 'text.primary',
                        borderColor: 'divider',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: provider.color,
                          bgcolor: alpha(provider.color, 0.04),
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Stack
                        spacing={0.5}
                        alignItems='center'
                        justifyContent='center'
                        sx={{ flexDirection: { xs: 'row', sm: 'column' }, width: '100%' }}
                      >
                        <Box
                          sx={{
                            color: provider.color,
                            display: 'flex',
                            alignItems: 'center',
                            mr: { xs: 1, sm: 0 },
                          }}
                        >
                          {provider.icon}
                        </Box>
                        <Typography variant='inherit' sx={{ fontWeight: 700 }}>
                          {t(
                            `sso.continueWith${provider.id.charAt(0).toUpperCase() + provider.id.slice(1)}`,
                            provider.name,
                          )}
                        </Typography>
                      </Stack>
                    </Button>
                  </Grid>
                ))
              ) : (
                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2' color='text.secondary' textAlign='center'>
                    {t('sso.noProviders', 'No SSO providers configured.')}
                  </Typography>
                </Grid>
              )}
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2.5,
                  py: 1.25,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.info.main, 0.15),
                }}
                role='img'
                aria-label={t('sso.secureBadge', 'Trusted Authentication Protocol')}
              >
                <CloudDoneIcon sx={{ fontSize: 18, color: 'info.main' }} aria-hidden='true' />
                <Typography
                  variant='caption'
                  sx={{
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.075em',
                    color: 'info.main',
                  }}
                >
                  {t('sso.trustedAuth', 'Bank-Grade Security Protocol')}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Box>
      </Card>
    </Box>
  )
}
