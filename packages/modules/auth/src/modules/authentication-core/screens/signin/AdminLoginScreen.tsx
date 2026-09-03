import React, { useState } from 'react';
import { Box, Typography, TextField, Button, InputAdornment, IconButton, Stack, Alert, alpha, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AdminPanelSettings from '@mui/icons-material/AdminPanelSettings';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Security from '@mui/icons-material/Security';
import { useNavigate } from 'react-router-dom';
import { Path } from '@cap/module-auth/routes/path';
import { normalizeRole } from '@cap/platform-core';
import { useSignin } from '@idaas/authentication-core/hooks/useAuthQuery';
import { resolveRedirectPathForUser } from '@idaas/authentication-core/utils/resolveRedirect';
import { AuthPageLayout, AuthScreenIcon, AuthInputLabel, AuthActionButton } from '@idaas/authentication-core/components/shared/auth';

const AdminLoginScreen = () => {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loginMutation = useSignin({
    onSuccess: (response) => {
      const userData = response?.data?.user || response?.data
      const userRole = normalizeRole(userData?.role)
      navigate(resolveRedirectPathForUser(userRole as any))
    },
    onError: (error: any) => {
      setError(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        t('admin.errorGeneric', 'An error occurred. Please try again.'),
      )
    },
  })

  const isLoading = loginMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !password) {
      setError(t('admin.errorIncomplete', 'Please enter both email and password.'))
      return
    }
    loginMutation.mutate({ data: { email, password } })
  }

  return (
    <AuthPageLayout>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <AuthScreenIcon icon={<AdminPanelSettings sx={{ fontSize: 32 }} />} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
          {t('admin.loginTitle', 'Admin Console')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          {t('admin.loginDesc', 'Authorized personnel access only')}
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
            <AuthInputLabel>{t('common.email', 'Email Address')}</AuthInputLabel>
            <TextField
              fullWidth
              type="email"
              placeholder="admin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
              autoFocus
              slotProps={{
                input: {
                  sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) },
                },
              }}
            />
          </Box>

          <Box>
            <AuthInputLabel>{t('common.password', 'Master Password')}</AuthInputLabel>
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
            label={isLoading ? t('admin.signingIn', 'Signing In...') : t('admin.signin', 'Elevate Access')}
            disabled={isLoading || !email || !password}
            sx={{ mt: 2 }}
          />

          <Button
            fullWidth
            variant="text"
            onClick={() => navigate(Path.auth.signin)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: 'text.secondary',
              '&:hover': { color: 'info.main', bgcolor: 'transparent' },
            }}
          >
            {t('admin.backToUser', 'Standard User Login?')}
          </Button>
        </Stack>
      </form>

      <Box sx={{ mt: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, opacity: 0.6 }}>
        <Security sx={{ fontSize: 14, color: 'info.main' }} />
        <Typography variant="caption" sx={{ fontWeight: 500 }}>
          {t('admin.secureSession', 'Identity encrypted session active')}
        </Typography>
      </Box>
    </AuthPageLayout>
  )
}

export default AdminLoginScreen
