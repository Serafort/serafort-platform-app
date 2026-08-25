// FILE: packages/modules/auth/src/modules/authentication-core/screens/signup/components/RegistrationScreen.tsx
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Divider, alpha, useTheme, InputAdornment, IconButton, Stack, Alert, Checkbox, FormControlLabel } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Email from '@mui/icons-material/Email';
import Lock from '@mui/icons-material/Lock';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Person from '@mui/icons-material/Person';
import Google from '@mui/icons-material/Google';
import Microsoft from '@mui/icons-material/Microsoft';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AuthPageLayout, AuthScreenIcon, AuthInputLabel, AuthActionButton } from '../../../components/shared/auth';
import { useRegister } from '../../../hooks/useAuthQuery';
import { API_CONFIG, ENDPOINTS } from '@cap/platform-core';
import { Path } from '@cap/module-auth/routes/path';

export default function RegistrationScreen() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const registerMutation = useRegister({
    onSuccess: () => {
      navigate(`${Path.auth.checkEmail}?email=${encodeURIComponent(email)}`)
    },
    onError: (error: any) => {
      setError(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        t('signUp.errorGeneric', 'An error occurred during registration.'),
      )
    },
  })

  const isLoading = registerMutation.isPending

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !password || !firstName || !lastName) {
      setError(t('signUp.errorIncomplete', 'Please fill in all fields.'))
      return
    }
    if (!acceptTerms) {
      setError(t('signUp.errorTerms', 'You must accept the terms of service.'))
      return
    }
    registerMutation.mutate({
      data: {
        email,
        password,
        confirmPassword: password,
        firstname: firstName,
        lastname: lastName,
        isTermsSign: acceptTerms,
      },
    })
  }

  const handleSocialRegister = (provider: string) => {
    window.location.assign(`${API_CONFIG.baseURL}${ENDPOINTS.auth.social.redirect(provider)}`)
  }

  return (
    <AuthPageLayout>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <AuthScreenIcon icon={<PersonAdd sx={{ fontSize: 32 }} />} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
          {t('signUp.title', 'Create an account')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          {t('signUp.subtitle', 'Join Antigravity OS today')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleRegister}>
        <Stack spacing={3}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <AuthInputLabel>{t('signUp.firstNameLabel', 'FIRST NAME')}</AuthInputLabel>
              <TextField
                fullWidth placeholder="Jane" value={firstName}
                onChange={(e) => setFirstName(e.target.value)} disabled={isLoading} autoComplete="given-name"
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Person sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>, sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) } } }}
              />
            </Box>
            <Box>
              <AuthInputLabel>{t('signUp.lastNameLabel', 'LAST NAME')}</AuthInputLabel>
              <TextField
                fullWidth placeholder="Doe" value={lastName}
                onChange={(e) => setLastName(e.target.value)} disabled={isLoading} autoComplete="family-name"
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Person sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>, sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) } } }}
              />
            </Box>
          </Box>

          <Box>
            <AuthInputLabel>{t('signUp.emailLabel', 'EMAIL ADDRESS')}</AuthInputLabel>
            <TextField
              fullWidth placeholder="name@company.com" value={email}
              onChange={(e) => setEmail(e.target.value)} disabled={isLoading} autoComplete="email"
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Email sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>, sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) } } }}
            />
          </Box>

          <Box>
            <AuthInputLabel>{t('signUp.passwordLabel', 'PASSWORD')}</AuthInputLabel>
            <TextField
              fullWidth type={showPassword ? 'text' : 'password'} placeholder="••••••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} autoComplete="new-password"
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" aria-label="Toggle password visibility">{showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}</IconButton></InputAdornment>, sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) } } }}
            />
          </Box>

          <FormControlLabel
            control={<Checkbox checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} disabled={isLoading} color="info" />}
            label={
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {t('signUp.iAgreeTo', 'I agree to the')}{' '}
                <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: 'text.primary', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>{t('signUp.termsOfService', 'Terms of Service')}</Typography>
                {' '}{t('signUp.and', 'and')}{' '}
                <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: 'text.primary', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>{t('signUp.privacyPolicy', 'Privacy Policy')}</Typography>
              </Typography>
            }
            sx={{ mx: 0 }}
          />

          <AuthActionButton
            type="submit"
            isLoading={isLoading}
            label={isLoading ? t('signUp.submitting', 'Creating Account...') : t('signUp.submit', 'Create Account')}
            disabled={isLoading || !email || !password || !firstName || !lastName || !acceptTerms}
            sx={{ mt: 1 }}
          />
        </Stack>
      </form>

      <Divider sx={{ my: 4, opacity: 0.5 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {t('signUp.orSignUpWith', 'OR SIGN UP WITH')}
        </Typography>
      </Divider>

      <Stack spacing={2}>
        {[
          { label: 'Google', provider: 'google', color: theme.palette.mode === 'dark' ? '#fff' : '#DB4437' },
          { label: 'Microsoft', provider: 'microsoft', color: theme.palette.mode === 'dark' ? '#fff' : '#00A4EF' },
        ].map(({ label, provider, color }) => (
          <Button key={provider} fullWidth variant="outlined"
            startIcon={label === 'Google' ? <Google sx={{ color }} /> : <Microsoft sx={{ color }} />}
            onClick={() => handleSocialRegister(provider)} disabled={isLoading}
            sx={{ py: 1.2, borderRadius: 3, fontWeight: 700, textTransform: 'none', color: 'text.primary', borderColor: alpha(theme.palette.divider, 0.8), bgcolor: 'background.paper', '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) } }}
          >
            {label}
          </Button>
        ))}
      </Stack>

      <Box sx={{ mt: 5, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {t('signUp.alreadyHaveAccount', 'Already have an account?')}{' '}
          <Typography component="span" variant="body2" onClick={() => navigate(Path.auth.signin)}
            sx={{ fontWeight: 800, color: 'info.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
            {t('signUp.signInHere', 'Sign in here')}
          </Typography>
        </Typography>
      </Box>
    </AuthPageLayout>
  )
}
