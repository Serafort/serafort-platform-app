import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Alert, Divider, IconButton, InputAdornment, Stack, Link as MuiLink, alpha, useTheme } from '@mui/material';
import LockPerson from '@mui/icons-material/LockPerson';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Google from '@mui/icons-material/Google';
import { useTranslation } from 'react-i18next';
import type { RegisterRequest } from '../../types/api.types';
import { useRegister } from '@idaas/authentication-core/hooks/useAuthQuery';
import { AuthPageLayout, AuthScreenIcon, AuthInputLabel, AuthActionButton } from '@idaas/authentication-core/components/shared/auth';

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

export default function SignUpV2() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()

  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const registerMutation = useRegister({
    onSuccess: () => {
      navigate('/auth/sign-in')
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || t('signUp.errorGeneric', 'An error occurred during registration.'))
    },
  })

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)
      if (!firstname || !lastname || !email || !password || !confirmPassword) {
        setError(t('signUp.errorIncomplete', 'Please fill in all fields.'))
        return
      }
      if (!EMAIL_PATTERN.test(email)) {
        setError(t('register.invalidEmail', 'Please enter a valid email address.'))
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
      const data: RegisterRequest = { email, password, confirmPassword, firstname, lastname, isTermsSign: true }
      registerMutation.mutate({ data })
    },
    [firstname, lastname, email, password, confirmPassword, registerMutation, t],
  )

  return (
    <AuthPageLayout>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <AuthScreenIcon icon={<LockPerson sx={{ fontSize: 32 }} />} />
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

      <Button fullWidth variant="outlined"
        startIcon={<Google sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#DB4437' }} />}
        sx={{ py: 1.2, borderRadius: 3, fontWeight: 700, textTransform: 'none', color: 'text.primary', borderColor: alpha(theme.palette.divider, 0.8), bgcolor: 'background.paper', mb: 3, '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) } }}
      >
        {t('register.signUpGoogle', 'Continue with Google')}
      </Button>

      <Divider sx={{ my: 3, opacity: 0.5 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {t('signUp.orSignUpWith', 'OR WITH EMAIL')}
        </Typography>
      </Divider>

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <AuthInputLabel>{t('signUp.firstNameLabel', 'FIRST NAME')}</AuthInputLabel>
              <TextField fullWidth placeholder={t('register.firstnamePlaceholder', 'Jane')} value={firstname} onChange={(e) => setFirstname(e.target.value)} disabled={registerMutation.isPending} autoComplete="given-name"
                slotProps={{ input: { sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) } } }} />
            </Box>
            <Box>
              <AuthInputLabel>{t('signUp.lastNameLabel', 'LAST NAME')}</AuthInputLabel>
              <TextField fullWidth placeholder={t('register.lastnamePlaceholder', 'Doe')} value={lastname} onChange={(e) => setLastname(e.target.value)} disabled={registerMutation.isPending} autoComplete="family-name"
                slotProps={{ input: { sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) } } }} />
            </Box>
          </Box>

          <Box>
            <AuthInputLabel>{t('signUp.emailLabel', 'EMAIL ADDRESS')}</AuthInputLabel>
            <TextField fullWidth type="email" placeholder={t('register.emailPlaceholder', 'name@example.com')} value={email} onChange={(e) => setEmail(e.target.value)} disabled={registerMutation.isPending} autoComplete="email"
              slotProps={{ input: { sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) } } }} />
          </Box>

          <Box>
            <AuthInputLabel>{t('signUp.passwordLabel', 'PASSWORD')}</AuthInputLabel>
            <TextField fullWidth type={showPassword ? 'text' : 'password'} placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={registerMutation.isPending} autoComplete="new-password"
              slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">{showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}</IconButton></InputAdornment>, sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) } } }} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1, display: 'block' }}>
              {t('register.passwordHint', 'Must be at least 8 characters.')}
            </Typography>
          </Box>

          <Box>
            <AuthInputLabel>{t('signUp.confirmPasswordLabel', 'CONFIRM PASSWORD')}</AuthInputLabel>
            <TextField fullWidth type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={registerMutation.isPending} autoComplete="new-password"
              slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">{showConfirmPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}</IconButton></InputAdornment>, sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) } } }} />
          </Box>

          <AuthActionButton
            type="submit"
            isLoading={registerMutation.isPending}
            label={registerMutation.isPending ? t('signUp.submitting', 'Creating Account...') : t('signUp.submit', 'Create Account')}
            disabled={registerMutation.isPending}
          />

          <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.secondary', display: 'block' }}>
            {t('signUp.iAgreeTo', 'By creating an account you agree to our')} <MuiLink href="#">{t('signUp.termsOfService', 'Terms of Service')}</MuiLink> {t('signUp.and', 'and')} <MuiLink href="#">{t('signUp.privacyPolicy', 'Privacy Policy')}</MuiLink>.
          </Typography>
        </Stack>
      </form>

      <Box sx={{ mt: 5, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {t('signUp.alreadyHaveAccount', 'Already have an account?')}{' '}
          <MuiLink component={Link} to="/auth/sign-in"
            sx={{ fontWeight: 800, color: 'info.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
            {t('signUp.signInHere', 'Sign in here')}
          </MuiLink>
        </Typography>
      </Box>
    </AuthPageLayout>
  )
}

