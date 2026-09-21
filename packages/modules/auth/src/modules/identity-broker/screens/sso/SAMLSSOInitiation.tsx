// FILE: packages/modules/auth/src/screens/auth/sso/SAMLSSOInitiation.tsx
// STYLE AUDIT: Aligned to OrganizationProfile.tsx design system and premium aesthetics
// WIRED: Full SSO discovery flow based on backend sso_discovery_controller → sso_discovery_service

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Box,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  Divider,
  Stack,
  FormControl,
  alpha,
  useTheme,
  Avatar,
  CircularProgress,
  InputAdornment,
  Chip,
  Collapse,
} from '@mui/material'
import BusinessIcon from '@mui/icons-material/Business'
import RouterIcon from '@mui/icons-material/Router'
import DomainIcon from '@mui/icons-material/Domain'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import SecurityIcon from '@mui/icons-material/Security'
import KeyIcon from '@mui/icons-material/Key'
import LoginIcon from '@mui/icons-material/Login'
import { useTranslation } from 'react-i18next'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Path, useSsoDiscovery } from '@auth'
import { toast } from 'react-toastify'
import {
  SsoIdentifierSchema,
  type SsoIdentifierSchemaType,
} from '@auth/modules/authentication-core/utils/schema'

// ── Debounce utility ──
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

// ── Provider display config ──
// Third-party identity providers (google/github/microsoft) keep their real
// brand colors — that's an intentional, industry-standard exception to the
// theme-token rule, not a hardcoded UI color. SAML/OIDC/password are protocol
// types, not brands, so those three resolve from the active theme instead.
function useProviderConfig(): Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> {
  const theme = useTheme()
  return {
    saml: {
      label: 'SAML SSO',
      color: theme.palette.success.main,
      icon: <SecurityIcon sx={{ fontSize: 16 }} />,
    },
    oidc: {
      label: 'OpenID Connect',
      color: theme.palette.info.main,
      icon: <KeyIcon sx={{ fontSize: 16 }} />,
    },
    // Brand hues for the provider chip. This screen always renders on its own
    // dark gradient, so GitHub's near-black mark is lightened to its dark-UI
    // grey to stay visible; Google and Microsoft are already bright enough.
    google: { label: 'Google', color: '#EA4335', icon: <LoginIcon sx={{ fontSize: 16 }} /> },
    github: { label: 'GitHub', color: '#8b949e', icon: <LoginIcon sx={{ fontSize: 16 }} /> },
    microsoft: { label: 'Microsoft', color: '#00A4EF', icon: <LoginIcon sx={{ fontSize: 16 }} /> },
    password: {
      label: 'Standard Login',
      color: theme.palette.warning.main,
      icon: <LoginIcon sx={{ fontSize: 16 }} />,
    },
  }
}

const SAMLSSOInitiation = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const navigate = useNavigate()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const submitAttemptedRef = useRef(false)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SsoIdentifierSchemaType>({
    resolver: zodResolver(SsoIdentifierSchema),
    defaultValues: {
      sso_identifier: '',
    },
  })

  // Debounce the identifier to avoid hammering the API on every keystroke
  const rawIdentifier = useWatch({ control, name: 'sso_identifier' })
  const debouncedIdentifier = useDebounce(rawIdentifier.trim(), 500)

  // SSO Discovery query — fires when debounced identifier is ≥ 2 chars
  const {
    data: discoveryResponse,
    isLoading: isDiscovering,
    error: discoveryError,
    isFetched,
  } = useSsoDiscovery(debouncedIdentifier)

  const discoveryData = discoveryResponse?.data
  const providerType = discoveryData?.provider
  const providerConfig = useProviderConfig()
  const providerInfo = providerType ? providerConfig[providerType] : null

  /**
   * Handle form submission — route user based on discovered provider.
   *
   * Backend returns:
   *   { provider: 'saml', organizationId: number, loginUrl?: string }
   *   { provider: 'oidc', clientId: string, loginUrl?: string }
   *   { provider: 'google' | 'github' | 'microsoft' }
   *   { provider: 'password' }
   */
  const onSubmit = useCallback(async () => {
    submitAttemptedRef.current = true

    if (!discoveryData || !providerType) {
      toast.warning(
        t('auth.sso.no_provider_found', 'No SSO configuration found for this identifier.'),
      )
      return
    }

    try {
      setIsRedirecting(true)

      switch (providerType) {
        case 'saml': {
          // If the backend provided a direct login URL, use it
          if (discoveryData.loginUrl || discoveryData.url) {
            window.location.assign(discoveryData.loginUrl || discoveryData.url!)
          } else {
            // Navigate to the SAML wait screen with the org identifier
            navigate(
              `${Path.identity.samlWait}?org=${discoveryData.organizationId ?? debouncedIdentifier}`,
            )
          }
          break
        }

        case 'oidc': {
          if (discoveryData.loginUrl || discoveryData.url) {
            window.location.assign(discoveryData.loginUrl || discoveryData.url!)
          } else {
            // Navigate to OIDC wait with clientId
            navigate(
              `${Path.identity.oidcWait}?client_id=${discoveryData.clientId ?? ''}&domain=${debouncedIdentifier}`,
            )
          }
          break
        }

        case 'google':
        case 'github':
        case 'microsoft': {
          // Social providers → redirect to provider selection or directly to social auth
          toast.info(
            t('auth.sso.social_redirect', 'Redirecting to {{provider}} login...', {
              provider: providerType,
            }),
          )
          navigate(`${Path.identity.providerSelection}?provider=${providerType}`)
          break
        }

        case 'password':
        default: {
          // No enterprise SSO found — fall back to standard login
          toast.info(
            t(
              'auth.sso.no_enterprise_sso',
              'No enterprise SSO found for this domain. Redirecting to standard login.',
            ),
          )
          navigate(Path.auth.signin)
          break
        }
      }
    } catch (err: unknown) {
      // Error already surfaced via snackbar below
      setIsRedirecting(false)
      toast.error(t('auth.sso.initiation_error', 'Failed to initiate SSO. Please try again.'))
    }
  }, [discoveryData, providerType, debouncedIdentifier, navigate, t])

  // Show discovery errors
  useEffect(() => {
    if (discoveryError && debouncedIdentifier.length >= 2) {
      // Discovery error is non-critical — input may still be typing
    }
  }, [discoveryError, debouncedIdentifier])

  return (
    <Box
      className='animate-scale-in'
      sx={{
        // Tenant brand gradient: primary colour fading into ink, so this
        // screen re-brands correctly for every tenant preset instead of
        // being hardcoded to one brand's blue.
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.95)} 0%, ${alpha(theme.palette.common.black, 0.98)} 100%)`,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, md: 4 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background dot pattern */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
          backgroundImage: `radial-gradient(${theme.palette.common.white} 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }}
      />

      <Container maxWidth='sm' sx={{ position: 'relative' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
            <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 'var(--sf-radius-lg, 24px)',
              background: alpha(theme.palette.common.white, 0.1),
              backdropFilter: 'blur(40px)',
              border: '1px solid',
              borderColor: alpha(theme.palette.common.white, 0.2),
              textAlign: 'center',
              color: 'common.white',
              boxShadow: `0 32px 64px ${alpha(theme.palette.common.black, 0.3)}`,
            }}
          >
            <Stack spacing={4} alignItems='center'>
              {/* Avatar */}
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 90,
                  height: 90,
                }}
              >
                <Avatar
                  sx={{
                    width: 72,
                    height: 72,
                    bgcolor: alpha(theme.palette.common.white, 0.2),
                    color: 'common.white',
                    zIndex: 1,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
                    borderRadius: 'var(--sf-radius-lg, 24px)',
                  }}
                >
                  <BusinessIcon sx={{ fontSize: 36 }} />
                </Avatar>
              </Box>

              {/* Title */}
              <Box>
                <Typography
                  variant='h4'
                  component='h1'
                  sx={{ fontWeight: 800, letterSpacing: '-0.027em', mb: 1, color: 'common.white' }}
                >
                  {t('auth.sso.title', 'Enterprise Login')}
                </Typography>
                <Typography
                  variant='body1'
                  sx={{ color: alpha(theme.palette.common.white, 0.8), fontWeight: 500 }}
                >
                  {t('auth.sso.desc', 'Enter your email or corporate domain to continue.')}
                </Typography>
              </Box>

              {/* Form */}
              <Box
                component='form'
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                sx={{ width: '100%' }}
              >
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    placeholder={t('auth.sso.placeholder', 'e.g. acme-corp or user@acme.com')}
                    variant='outlined'
                    autoComplete='email'
                    autoFocus
                    {...register('sso_identifier', {
                      required: t(
                        'auth.sso.domain_required',
                        'Organization identifier is required',
                      ),
                      minLength: {
                        value: 2,
                        message: t('auth.sso.min_length', 'Enter at least 2 characters'),
                      },
                    })}
                    error={!!errors.sso_identifier}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position='start'>
                            <DomainIcon
                              sx={{ color: alpha(theme.palette.common.white, 0.7), fontSize: 20 }}
                            />
                          </InputAdornment>
                        ),
                        endAdornment: isDiscovering ? (
                          <InputAdornment position='end'>
                            <CircularProgress size={18} sx={{ color: 'common.white' }} />
                          </InputAdornment>
                        ) : undefined,
                        sx: {
                          color: 'common.white',
                          height: 56,
                          background: alpha(theme.palette.common.white, 0.08),
                          borderRadius: 'var(--sf-radius-md, 8px)',
                          fontWeight: 500,
                          '& fieldset': {
                            borderColor: alpha(theme.palette.common.white, 0.2),
                          },
                          '&:hover fieldset': {
                            borderColor: alpha(theme.palette.common.white, 0.4),
                          },
                          '&.Mui-focused fieldset': { borderColor: 'common.white' },
                        },
                      },
                      inputLabel: {
                        sx: {
                          color: alpha(theme.palette.common.white, 0.5),
                          '&.Mui-focused': { color: 'common.white' },
                        },
                      },
                    }}
                    helperText={
                      errors.sso_identifier?.message ||
                      t('auth.sso.domain_help', 'Enter your corporate email or domain')
                    }
                    sx={{
                      '& .MuiFormHelperText-root': {
                        color: errors.sso_identifier
                          ? 'error.light'
                          : alpha(theme.palette.common.white, 0.5),
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        mt: 1,
                        ml: 1,
                      },
                    }}
                  />
                </FormControl>

                {/* ── Discovery result feedback ── */}
                <Collapse in={!!providerInfo && isFetched && !isDiscovering}>
                  <Box sx={{ mb: 2, textAlign: 'start' }}>
                    <AnimatePresence mode='wait'>
                      {providerInfo && (
                        <motion.div
                          key={providerType}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.25 }}
                        >
                          <Chip
                            icon={
                              providerType !== 'password' ? (
                                <CheckCircleOutlineIcon
                                  sx={{ fontSize: 16, color: `${providerInfo.color} !important` }}
                                />
                              ) : undefined
                            }
                            label={
                              providerType !== 'password'
                                ? t('auth.sso.provider_found', '{{provider}} detected', {
                                    provider: providerInfo.label,
                                  })
                                : t('auth.sso.no_enterprise', 'No enterprise SSO — standard login')
                            }
                            size='small'
                            sx={{
                              bgcolor: alpha(providerInfo.color, 0.2),
                              color: 'common.white',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              border: `1px solid ${alpha(providerInfo.color, 0.4)}`,
                              borderRadius: 'var(--sf-radius-sm, 6px)',
                              '& .MuiChip-icon': { ml: 0.5 },
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Box>
                </Collapse>

                {/* CTA Button */}
                <Button
                  type='submit'
                  fullWidth
                  variant='contained'
                  size='large'
                  disabled={isDiscovering || isRedirecting || !rawIdentifier.trim()}
                  sx={{
                    minHeight: 56,
                    borderRadius: 'var(--sf-radius-md, 8px)',
                    bgcolor: 'common.white',
                    color: theme.palette.primary.dark,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.15)}`,
                    fontWeight: 800,
                    fontSize: '1rem',
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.common.white, 0.9),
                      transform: 'translateY(-1px)',
                      boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.2)}`,
                    },
                    '&:disabled': {
                      bgcolor: alpha(theme.palette.common.white, 0.4),
                      color: alpha(theme.palette.primary.dark, 0.5),
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {isDiscovering || isRedirecting ? (
                    <CircularProgress size={24} color='inherit' />
                  ) : providerType && providerType !== 'password' ? (
                    t('auth.sso.continue_with', 'Continue with {{provider}}', {
                      provider: providerInfo?.label ?? 'SSO',
                    })
                  ) : (
                    t('auth.common.continue_to_sso', 'Continue')
                  )}
                </Button>
              </Box>

              {/* Divider */}
              <Divider
                sx={{
                  width: '100%',
                  opacity: 0.3,
                  '&::before, &::after': {
                    borderColor: alpha(theme.palette.common.white, 0.5),
                  },
                }}
              >
                <Typography
                  variant='caption'
                  sx={{
                    px: 2,
                    color: alpha(theme.palette.common.white, 0.5),
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  {t('auth.common.or', 'OR')}
                </Typography>
              </Divider>

              {/* Back to standard login */}
              <Button
                fullWidth
                variant='text'
                onClick={() => navigate(Path.auth.signin)}
                sx={{
                  minHeight: 48,
                  color: alpha(theme.palette.common.white, 0.9),
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 'var(--sf-radius-md, 8px)',
                  '&:hover': {
                    color: 'common.white',
                    background: alpha(theme.palette.common.white, 0.1),
                  },
                }}
              >
                {t('auth.sso.back_to_standard_login', 'Standard Administrative Login')}
              </Button>
            </Stack>
          </Paper>
        </motion.div>

        {/* Footer badge */}
        <Stack
          direction='row'
          spacing={1}
          justifyContent='center'
          alignItems='center'
          sx={{ mt: 5, opacity: 0.6, color: 'common.white' }}
        >
          <RouterIcon sx={{ fontSize: 16 }} />
          <Typography
            variant='caption'
            sx={{
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.6rem',
            }}
          >
            {t('auth.sso.secure_encryption_tag', 'Verified & protected by Serafort')}
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}

export default SAMLSSOInitiation
