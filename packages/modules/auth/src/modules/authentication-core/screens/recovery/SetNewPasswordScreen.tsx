import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Box, Button, TextField, Typography, Alert, InputAdornment, IconButton, CircularProgress, alpha, useTheme, Avatar, Stack, Link as MuiLink } from '@mui/material';
import LockReset from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FetchResponse, IUserResponseEmailResetPassword } from '@cap/platform-core';
import type { ResetPasswordRequest } from '../../types/api.types';
import { useResetPassword } from '@cap/module-auth/modules/authentication-core/hooks/useAuthQuery';
import authService from '@cap/module-auth/modules/authentication-core/services/auth.service';
import { Path } from '@cap/module-auth/routes/path';

const SUPPORT_EMAIL = 'support@example.com'

export default function SetNewPasswordScreen() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()
  const { email } = useParams()
  const [searchParams] = useSearchParams()
  const signature = searchParams.get('signature')

  const [loading, setLoading] = useState(true)
  const [signatureValid, setSignatureValid] = useState<boolean | null>(null)
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function verifySignature() {
      try {
        setLoading(true)
        const response: FetchResponse<IUserResponseEmailResetPassword> =
          await authService.verifyResetPassword(email || '', signature ?? '')
        if (response.status === 202 && response.data.isSignatureValid) {
          setSignatureValid(true)
          setToken(response.data.token || '')
        } else {
          setSignatureValid(false)
        }
      } catch {
        setSignatureValid(false)
      } finally {
        setLoading(false)
      }
    }
    verifySignature()
  }, [email, signature])

  const resetPasswordMutation = useResetPassword({
    onSuccess: () => {
      navigate('/auth/password-reset-success')
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.detail ||
          t('resetPassword.errorMsg', 'Error resetting password.'),
      )
    },
  })

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)
      if (!newPassword || !confirmPassword) {
        setError(t('resetPassword.fillAll', 'Please fill in all fields.'))
        return
      }
      if (newPassword.length < 8) {
        setError(t('register.passwordMinLength', 'Password must be at least 8 characters.'))
        return
      }
      if (newPassword !== confirmPassword) {
        setError(t('register.passwordsMustMatch', 'Passwords do not match.'))
        return
      }
      const data: ResetPasswordRequest = {
        token,
        email: email || '',
        password: newPassword,
        confirmPassword,
      }
      resetPasswordMutation.mutate({ data })
    },
    [token, email, newPassword, confirmPassword, resetPasswordMutation, t],
  )

  if (loading) {
    return (
      <Box sx={{ height: '100dvh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (signatureValid === false) {
    return (
      <Box
        className="animate-scale-in"
        component={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        sx={{ width: '100%', maxWidth: 440, mx: 'auto', p: { xs: 3, md: 5 }, textAlign: 'center' }}
      >
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
            <LockReset sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
          {t('resetPassword.invalidLinkTitle', 'Invalid or Expired Link')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 4 }}>
          {t('resetPassword.invalidLinkDesc', 'This password reset link is invalid or has expired. Please request a new one.')}
        </Typography>
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2, textAlign: 'left', '& .MuiAlert-message': { fontWeight: 600 } }}>
          {t('resetPassword.invalidLinkDesc2', `If you need help, contact us at ${SUPPORT_EMAIL}`)}
        </Alert>
        <Button
          component={Link}
          to={Path.auth.forgotPassword}
          fullWidth
          variant="contained"
          sx={{
            py: 1.5,
            borderRadius: 3,
            fontWeight: 800,
            fontSize: '1rem',
            textTransform: 'none',
            bgcolor: 'info.main',
            boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.info.main, 0.4)}`,
            '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)' },
          }}
        >
          {t('resetPassword.requestNewLink', 'Request New Link')}
        </Button>
        <Box sx={{ mt: 3 }}>
          <MuiLink
            component={Link}
            to={Path.signin}
            sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', '&:hover': { color: 'info.main' } }}
          >
            {t('common.backToLogin', 'Back to log in')}
          </MuiLink>
        </Box>
      </Box>
    )
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
            <LockReset sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
          {t('resetPassword.title', 'Set new password')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          {t('resetPassword.subtitle', "Choose a strong password you haven't used before.")}
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

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', ml: 1, mb: 1, display: 'block', color: 'text.secondary' }}>
              {t('resetPassword.emailLabel', 'Email Address')}
            </Typography>
            <TextField
              fullWidth
              value={email || ''}
              disabled
              slotProps={{
                input: {
                  sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) },
                },
              }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', ml: 1, mb: 1, display: 'block', color: 'text.secondary' }}>
              {t('resetPassword.newPasswordLabel', 'New Password')}
            </Typography>
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={resetPasswordMutation.isPending}
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
              {t('resetPassword.confirmPasswordLabel', 'Confirm Password')}
            </Typography>
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={resetPasswordMutation.isPending}
              slotProps={{
                input: {
                  sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) },
                },
              }}
            />
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={resetPasswordMutation.isPending || !newPassword || !confirmPassword}
            endIcon={
              resetPasswordMutation.isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <ArrowForward />
              )
            }
            sx={{
              py: 1.5,
              mt: 2,
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
            {resetPasswordMutation.isPending
              ? t('resetPassword.buttonResetting', 'Resetting...')
              : t('resetPassword.buttonReset', 'Reset Password')}
          </Button>
        </Stack>
      </form>

      <Box sx={{ mt: 5, textAlign: 'center' }}>
        <MuiLink
          component={Link}
          to={Path.signin}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'text.secondary',
            textDecoration: 'none',
            '&:hover': { color: 'info.main' },
            '& .MuiSvgIcon-root': { fontSize: 18, transition: 'transform 0.2s' },
            '&:hover .MuiSvgIcon-root': { transform: 'translateX(-4px)' },
          }}
        >
          <ArrowBack />
          {t('common.backToLogin', 'Back to log in')}
        </MuiLink>
      </Box>
    </Box>
  )
}
