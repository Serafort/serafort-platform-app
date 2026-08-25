import React, { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  alpha,
  useTheme,
  InputAdornment,
  CircularProgress,
  Stack,
  Alert,
  Avatar,
  Card,
  CardContent,
  Chip,
} from '@mui/material'
import Email from '@mui/icons-material/Email'
import ArrowForward from '@mui/icons-material/ArrowForward'
import AutoAwesome from '@mui/icons-material/AutoAwesome'
import LockOutlined from '@mui/icons-material/LockOutlined'
import ShieldOutlined from '@mui/icons-material/ShieldOutlined'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePasswordlessSend } from '../hooks'
import Path from './path'
import { Path as AuthPath } from '@cap/module-auth/routes/path'

export default function PasswordlessInitiation() {
  const { t } = useTranslation('common')
  const theme = useTheme()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [error, setError] = useState<string | null>(null)

  const sendMutation = usePasswordlessSend({
    onSuccess: () => {
      navigate(`${Path.verification}?email=${encodeURIComponent(identifier)}`)
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          t('auth.passwordless.send_failed', 'Failed to send the magic link. Please check your email and try again.'),
      )
    },
  })

  const isLoading = sendMutation.isPending

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const emailValue = identifier.trim()
    if (!emailValue) {
      setError(t('auth.passwordless.error_incomplete', 'Please enter your email address.'))
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailValue)) {
      setError(t('auth.passwordless.error_invalid_email', 'Please enter a valid email address.'))
      return
    }
    sendMutation.mutate(emailValue)
  }

  return (
    <Box
      className="animate-scale-in"
      component={motion.div}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      sx={{
        width: '100%',
        maxWidth: 460,
        mx: 'auto',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.6),
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(20px)',
          boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.06)}`,
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ mb: 3.5, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  borderRadius: 3.5,
                  border: '2px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                }}
              >
                <AutoAwesome sx={{ fontSize: 32 }} />
              </Avatar>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em' }}>
              {t('auth.passwordless.heading', 'Sign in with Magic Link')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
              {t(
                'auth.passwordless.subheading',
                'Enter your email address and we will send you a secure sign-in link—no password needed.',
              )}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5, '& .MuiAlert-message': { fontWeight: 600 } }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleInitiate}>
            <Stack spacing={2.5}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    ml: 0.5,
                    mb: 0.8,
                    display: 'block',
                    color: 'text.secondary',
                  }}
                >
                  {t('auth.passwordless.email_address', 'Email Address')}
                </Typography>
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
                      sx: {
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                      },
                    },
                  }}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading || !identifier.trim()}
                endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                sx={{
                  py: 1.5,
                  mt: 1,
                  borderRadius: 3,
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  bgcolor: 'primary.main',
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'translateY(-1px)',
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.45)}`,
                  },
                }}
              >
                {isLoading
                  ? t('auth.passwordless.sending', 'Sending Magic Link...')
                  : t('auth.passwordless.send_magic_link', 'Send Magic Link')}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3.5, opacity: 0.6 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, px: 1 }}>
              {t('common.or', 'OR')}
            </Typography>
          </Divider>

          <Stack spacing={1.5} sx={{ textAlign: 'center' }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate(AuthPath.auth.signin)}
              startIcon={<LockOutlined />}
              sx={{
                py: 1.2,
                borderRadius: 3,
                fontWeight: 700,
                textTransform: 'none',
                borderColor: alpha(theme.palette.divider, 0.8),
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              {t('auth.passwordless.use_password_instead', 'Sign in with Password')}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 3 }}>
        <ShieldOutlined sx={{ fontSize: 16, color: 'text.disabled' }} />
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          {t('auth.passwordless.encrypted_notice', 'Encrypted & Single-Use Authentication')}
        </Typography>
      </Box>
    </Box>
  )
}

