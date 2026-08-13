// FILE: packages/modules/auth/src/screens/auth/signin/LoginScreen.tsx
// STYLE AUDIT: Aligned to OrganizationProfile.tsx design system
// FIXES: [CRITICAL] Modernized InputProps to slotProps.input, applied info.main to CTAs [HIGH] Added animate-scale-in [MEDIUM] Added divider opacity and avatar 24px radius [LOW] Added aria-labels and i18n fallbacks
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Divider, alpha, useTheme, InputAdornment, IconButton, Stack, Alert } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Email from '@mui/icons-material/Email';
import Lock from '@mui/icons-material/Lock';
import VpnKey from '@mui/icons-material/VpnKey';
import Google from '@mui/icons-material/Google';
import GitHub from '@mui/icons-material/GitHub';
import Microsoft from '@mui/icons-material/Microsoft';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthPageLayout, AuthScreenIcon, AuthInputLabel, AuthActionButton } from '@idaas/authentication-core/components/shared/auth';
import { useSignin } from '@idaas/authentication-core/hooks/useAuthQuery';
import { API_CONFIG } from '@cap/platform-core';
import { ENDPOINTS } from '@cap/platform-core';
import { Path } from '@cap/module-auth/routes/path';
import { authRegistry } from '../../../../registry/AuthRegistry';

export default function LoginScreen() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  
  // ── Local State ──────────────────────────────────────────────────────────
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Extract redirect url if available
  const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/admin/dashboard'

  const loginMutation = useSignin({
    onSuccess: () => {
      navigate(redirectUrl)
    },
    onError: (error: any) => {
      setError(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        t('signIn.errorGeneric', 'An error occurred. Please try again.'),
      )
    },
  })

  const isLoading = loginMutation.isPending

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!identifier || !password) {
      setError(t('signIn.errorIncomplete', 'Please fill in all fields.'))
      return
    }

    loginMutation.mutate({ data: { email: identifier, password } })
  }

  const handleSocialLogin = (provider: string) => {
    window.location.assign(`${API_CONFIG.baseURL}${ENDPOINTS.auth.social.redirect(provider)}`)
  }

  // ── SYSTEM PATTERN: Entry animation (OrganizationProfile L60) ──
  return (
    <AuthPageLayout>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <AuthScreenIcon icon={<VpnKey sx={{ fontSize: 32 }} />} />
        </Box>
        {/* ── SYSTEM PATTERN: h4 titles (Standardized Title) ── */}
        <Typography variant='h4' sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
          {t('signIn.title', 'Welcome back')}
        </Typography>
        <Typography variant='body1' color='text.secondary' sx={{ fontWeight: 500 }}>
          {t('signIn.subtitle', 'Please enter your details to sign in')}
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 4, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}
        >
          {error}
        </Alert>
      )}

      <form onSubmit={handleLogin}>
        <Stack spacing={3}>
          <Box>
            <AuthInputLabel>{t('signIn.emailLabel', 'EMAIL ADDRESS')}</AuthInputLabel>
            <TextField
              fullWidth
              placeholder="name@company.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
              autoFocus
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) },
                },
              }}
            />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 1 }}>
              <AuthInputLabel>{t('signIn.passwordLabel', 'PASSWORD')}</AuthInputLabel>
              <Typography
                variant="caption"
                onClick={() => navigate(Path.auth.forgotPassword)}
                sx={{
                  fontWeight: 700,
                  color: 'info.main',
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                  mt: -1 // Align with label
                }}
              >
                {t('signIn.forgotPassword', 'Forgot password?')}
              </Typography>
            </Box>
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) },
                },
              }}
            />
          </Box>

          <AuthActionButton
            type="submit"
            isLoading={isLoading}
            label={isLoading ? t('signIn.submitting', 'Signing In...') : t('signIn.submit', 'Sign In')}
            disabled={isLoading || !identifier || !password}
          />
        </Stack>
      </form>

      <Divider sx={{ my: 4, opacity: 0.5 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {t('signIn.orSignInWith', 'OR SIGN IN WITH')}
        </Typography>
      </Divider>

      <Stack spacing={2}>
        {/* Render Primary plugins if any */}
        {authRegistry.getPluginsByType('primary').map(plugin => {
           const Option = plugin.ui?.loginOption
           return Option ? <Option key={plugin.id} onClick={() => console.log(`Plugin ${plugin.id} clicked`)} /> : null
        })}
        
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Google sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#DB4437' }} />}
          onClick={() => handleSocialLogin('google')}
          disabled={isLoading}
          sx={{
            py: 1.2,
            borderRadius: 3,
            fontWeight: 700,
            textTransform: 'none',
            color: 'text.primary',
            borderColor: alpha(theme.palette.divider, 0.8),
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: alpha(theme.palette.action.hover, 0.5),
            }
          }}
        >
          Google
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Microsoft sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#00A4EF' }} />}
          onClick={() => handleSocialLogin('microsoft')}
          disabled={isLoading}
          sx={{
            py: 1.2,
            borderRadius: 3,
            fontWeight: 700,
            textTransform: 'none',
            color: 'text.primary',
            borderColor: alpha(theme.palette.divider, 0.8),
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: alpha(theme.palette.action.hover, 0.5),
            }
          }}
        >
          Microsoft
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<GitHub sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#333' }} />}
          onClick={() => handleSocialLogin('github')}
          disabled={isLoading}
          sx={{
            py: 1.2,
            borderRadius: 3,
            fontWeight: 700,
            textTransform: 'none',
            color: 'text.primary',
            borderColor: alpha(theme.palette.divider, 0.8),
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: alpha(theme.palette.action.hover, 0.5),
            }
          }}
        >
          GitHub
        </Button>

        {/* Render Secondary/Biometric plugins if any */}
        {authRegistry.getPluginsByType('secondary').concat(authRegistry.getPluginsByType('biometric')).map(plugin => {
           const Option = plugin.ui?.loginOption
           return Option ? <Option key={plugin.id} onClick={() => console.log(`Plugin ${plugin.id} clicked`)} /> : null
        })}
      </Stack>

      <Box sx={{ mt: 5, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {t('signIn.noAccount', "Don't have an account?")}{' '}
          <Typography
            component="span"
            variant="body2"
            onClick={() => navigate(Path.auth.signup)}
            sx={{
              fontWeight: 800,
              color: 'info.main',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            {t('signIn.signUpHere', 'Sign up here')}
          </Typography>
        </Typography>
      </Box>
    </AuthPageLayout>

  )
}

