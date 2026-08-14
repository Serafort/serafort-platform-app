import { useState, useCallback } from 'react';

import { Box, Button, TextField, Typography, Alert, Divider, InputAdornment, IconButton, CircularProgress, Stack, Avatar, Checkbox, FormControlLabel, alpha, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import GitHub from '@mui/icons-material/GitHub';
import Google from '@mui/icons-material/Google';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowForward from '@mui/icons-material/ArrowForward';
import PersonAdd from '@mui/icons-material/PersonAdd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { RegisterRequest } from '../../types/api.types';
import { useRegister } from '@idaas/authentication-core/hooks/useAuthQuery';
import { API_CONFIG } from '@cap/platform-core';
import { ENDPOINTS } from '@cap/platform-core';

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

export default function SignUp() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const registerMutation = useRegister({
    onSuccess: () => {
      navigate('/auth/verify-email', { state: { email } })
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || err.message || t('login.loginFailed', 'Registration failed.'))
    },
  })

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)
      if (!fullName || !email || !password || !confirmPassword) {
        setError(t('register.errorIncomplete', 'Please fill in all fields.'))
        return
      }
      if (!EMAIL_PATTERN.test(email)) {
        setError(t('login.invalidEmail', 'Please enter a valid email address.'))
        return
      }
      if (password.length < 8) {
        setError(t('register.passwordMinLength', 'Password must be at least 8 characters.'))
        return
      }
      if (password !== confirmPassword) {
        setError(t('register.passwordsMustMatch', 'Passwords do not match.'))
        return
      }
      if (!acceptTerms) {
        setError(t('signup.errorTerms', 'You must accept the terms of service.'))
        return
      }
      const parts = fullName.trim().split(' ')
      const data: RegisterRequest = {
        email,
        password,
        confirmPassword,
        firstname: parts[0],
        lastname: parts.slice(1).join(' '),
        isTermsSign: acceptTerms,
      }
      registerMutation.mutate({ data })
    },
    [fullName, email, password, confirmPassword, acceptTerms, registerMutation, t],
  )

  const handleSocialRegister = (provider: string) => {
    window.location.assign(`${API_CONFIG.baseURL}${ENDPOINTS.auth.social.redirect(provider)}`)
  }

  return (
    <Box
      className="animate-scale-in"
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      sx={{
        width: '100%',
        maxWidth: 440,
        mx: 'auto',
        p: { xs: 3, md: 5 },
        position: 'relative',
      }}
    >
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Avatar
            variant="square"
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'transparent',
              color: 'primary.main',
              borderRadius: '24px',
              border: '2px solid',
              borderColor: alpha(theme.palette.primary.main, 0.2),
            }}
          >
            <PersonAdd sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
          {t('register.createAnAccount', 'Create an account')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          {t('register.subtitleForm', 'Join us today')}
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

      <Stack spacing={2} sx={{ mb: 3 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Google sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#DB4437' }} />}
          onClick={() => handleSocialRegister('google')}
          disabled={registerMutation.isPending}
          sx={{
            py: 1.2,
            borderRadius: 3,
            fontWeight: 700,
            textTransform: 'none',
            color: 'text.primary',
            borderColor: alpha(theme.palette.divider, 0.8),
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) },
          }}
        >
          {t('register.signupGoogle', 'Continue with Google')}
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<GitHub sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#333' }} />}
          onClick={() => handleSocialRegister('github')}
          disabled={registerMutation.isPending}
          sx={{
            py: 1.2,
            borderRadius: 3,
            fontWeight: 700,
            textTransform: 'none',
            color: 'text.primary',
            borderColor: alpha(theme.palette.divider, 0.8),
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) },
          }}
        >
          {t('register.signupGithub', 'Continue with GitHub')}
        </Button>
      </Stack>

      <Divider sx={{ my: 3, opacity: 0.5 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {t('register.orContinueEmail', 'OR REGISTER WITH EMAIL')}
        </Typography>
      </Divider>

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', ml: 1, mb: 1, display: 'block', color: 'text.secondary' }}>
              {t('register.fullNameLabel', 'Full Name')}
            </Typography>
            <TextField
              fullWidth
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={registerMutation.isPending}
              autoComplete="name"
              autoFocus
              slotProps={{
                input: {
                  sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) },
                },
              }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', ml: 1, mb: 1, display: 'block', color: 'text.secondary' }}>
              {t('register.emailLabel', 'Email Address')}
            </Typography>
            <TextField
              fullWidth
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={registerMutation.isPending}
              autoComplete="email"
              slotProps={{
                input: {
                  sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) },
                },
              }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', ml: 1, mb: 1, display: 'block', color: 'text.secondary' }}>
              {t('register.passwordLabel', 'Password')}
            </Typography>
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={registerMutation.isPending}
              autoComplete="new-password"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" aria-label="Toggle password visibility">
                        {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) },
                },
              }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', ml: 1, mb: 1, display: 'block', color: 'text.secondary' }}>
              {t('register.confirmPasswordLabel', 'Confirm Password')}
            </Typography>
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={registerMutation.isPending}
              autoComplete="new-password"
              slotProps={{
                input: {
                  sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) },
                },
              }}
            />
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                disabled={registerMutation.isPending}
                color="info"
              />
            }
            label={
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {t('signup.iAgreeTo', 'I agree to the')}{' '}
                <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: 'text.primary', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                  {t('signup.termsOfService', 'Terms of Service')}
                </Typography>{' '}
                {t('signup.and', 'and')}{' '}
                <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: 'text.primary', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                  {t('signup.privacyPolicy', 'Privacy Policy')}
                </Typography>
              </Typography>
            }
            sx={{ mx: 0 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={registerMutation.isPending}
            endIcon={
              registerMutation.isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <ArrowForward />
              )
            }
            sx={{
              py: 1.5,
              mt: 1,
              borderRadius: 3,
              fontWeight: 800,
              fontSize: '1rem',
              textTransform: 'none',
              bgcolor: 'info.main',
              boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.info.main, 0.4)}`,
              '&:hover': {
                bgcolor: 'info.dark',
                transform: 'translateY(-1px)',
                boxShadow: (theme) => `0 6px 20px ${alpha(theme.palette.info.main, 0.23)}`,
              },
            }}
          >
            {registerMutation.isPending
              ? t('register.creatingAccount', 'Creating Account...')
              : t('register.buttonSignup', 'Create Account')}
          </Button>
        </Stack>
      </form>

      <Box sx={{ mt: 5, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {t('register.alreadyHaveAccountPrompt', 'Already have an account?')}{' '}
          <Typography
            component="span"
            variant="body2"
            onClick={() => navigate('/auth/sign-in')}
            sx={{ fontWeight: 800, color: 'info.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          >
            {t('register.signInLink', 'Sign in')}
          </Typography>
        </Typography>
      </Box>
    </Box>
  )
}

