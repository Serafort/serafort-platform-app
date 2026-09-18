import React, { useState, useCallback } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Link as MuiLink,
  Container,
  useTheme,
  alpha,
  Card,
  CardContent,
  Stack,
} from '@mui/material'
import Warning from '@mui/icons-material/Warning'
import ArrowBack from '@mui/icons-material/ArrowBack'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDeactivateAccount, useUserProfile } from '../../hooks/useUserQuery'
import logger from '@idaas/authentication-core/utils/logger'
import { Path } from '../../../../routes/path'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'

export default function DeactivateAccount() {
  const { t } = useTranslation('common')
  const theme = useTheme()
  const navigate = useNavigate()
  const effects = getTenantThemeEffects(theme)
  const surfaceEffect = buildLayoutSurfaceEffect(effects, theme)

  const [confirmText, setConfirmText] = useState('')
  const deactivateAccountMutation = useDeactivateAccount()
  const { data: userProfile } = useUserProfile()
  const user = userProfile?.data as any

  const handleDeactivate = useCallback(async () => {
    if (confirmText.toUpperCase() !== 'DEACTIVATE' && confirmText.toUpperCase() !== 'DELETE') {
      return
    }

    if (!user?.id) return

    try {
      await deactivateAccountMutation.mutateAsync(user.id)
      navigate(Path.auth.signin)
    } catch (err: unknown) {
      logger.error('Deactivation error', { error: err })
    }
  }, [confirmText, deactivateAccountMutation, navigate, user])

  const handleCancel = useCallback(() => {
    navigate(Path.account.view || '/profile')
  }, [navigate])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Container maxWidth='sm' sx={{ py: { xs: 3, md: 5 } }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleCancel}
          sx={{
            mb: 2.5,
            textTransform: 'none',
            fontWeight: 600,
            color: 'text.secondary',
            minHeight: 44,
            px: 2,
            borderRadius: 'var(--sf-radius-md, 8px)',
            bgcolor: alpha(theme.palette.action.active, 0.04),
            '&:hover': {
              bgcolor: alpha(theme.palette.action.active, 0.08),
              color: 'text.primary',
            },
          }}
        >
          {t('common.backToProfile', 'Back to Profile')}
        </Button>

        <Card
          sx={{
            borderRadius: 'var(--sf-radius-lg, 16px)',
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            ...surfaceEffect,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pt: 5,
              pb: 2,
              px: { xs: 3, sm: 5 },
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 'var(--sf-radius-lg, 16px)',
                bgcolor: alpha(theme.palette.warning.main, 0.12),
                color: theme.palette.warning.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2.5,
              }}
            >
              <Warning sx={{ fontSize: 36 }} />
            </Box>

            <Typography
              variant='h5'
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.02em',
                pb: 1,
              }}
            >
              {t('auth.account.deactivate_title', 'Deactivate Account')}
            </Typography>

            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                lineHeight: 1.6,
                maxWidth: 440,
              }}
            >
              {t(
                'auth.account.deactivate_description',
                'Deactivating your account will temporarily disable your profile and access. You can reactivate anytime by logging back in.',
              )}
            </Typography>
          </Box>

          {/* Form Content */}
          <CardContent sx={{ px: { xs: 3, sm: 5 }, py: 3 }}>
            {deactivateAccountMutation.isError && (
              <Alert
                severity='error'
                sx={{
                  mb: 3,
                  borderRadius: 'var(--sf-radius-md, 8px)',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.error.main, 0.2),
                }}
              >
                {(deactivateAccountMutation.error as any)?.message ||
                  t('auth.common.errorOccurred', 'An error occurred during deactivation')}
              </Alert>
            )}

            <Stack spacing={3}>
              <Box>
                <Typography
                  component='label'
                  htmlFor='confirm-deactivate'
                  sx={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  {t(
                    'auth.account.deactivate_confirm_instruction',
                    'To confirm, please type DEACTIVATE below:',
                  )}
                </Typography>
                <TextField
                  id='confirm-deactivate'
                  fullWidth
                  placeholder='DEACTIVATE'
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  slotProps={{
                    input: {
                      sx: {
                        minHeight: 48,
                        borderRadius: 'var(--sf-radius-md, 8px)',
                      },
                    },
                  }}
                />
              </Box>

              {/* Action Buttons */}
              <Stack
                direction={{ xs: 'column-reverse', sm: 'row' }}
                spacing={1.5}
                sx={{ pt: 1 }}
              >
                <Button
                  fullWidth
                  variant='outlined'
                  onClick={handleCancel}
                  sx={{
                    minHeight: 48,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    borderRadius: 'var(--sf-radius-md, 8px)',
                    textTransform: 'none',
                  }}
                >
                  {t('auth.account.cancel', 'Cancel')}
                </Button>
                <Button
                  fullWidth
                  variant='contained'
                  color='warning'
                  onClick={handleDeactivate}
                  disabled={
                    (confirmText.toUpperCase() !== 'DEACTIVATE' &&
                      confirmText.toUpperCase() !== 'DELETE') ||
                    deactivateAccountMutation.isPending
                  }
                  sx={{
                    minHeight: 48,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    borderRadius: 'var(--sf-radius-md, 8px)',
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: 1,
                    },
                  }}
                >
                  {deactivateAccountMutation.isPending ? (
                    <CircularProgress size={24} color='inherit' />
                  ) : (
                    t('auth.account.deactivate_submit_button', 'Deactivate Account')
                  )}
                </Button>
              </Stack>
            </Stack>
          </CardContent>

          {/* Footer */}
          <Box
            sx={{
              bgcolor: alpha(theme.palette.action.hover, 0.4),
              px: 3,
              py: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
              {t('auth.account.support_prefix', 'Need help?')}{' '}
              <MuiLink
                href='#'
                onClick={(e) => {
                  e.preventDefault()
                }}
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {t('auth.account.customer_support', 'Contact Support')}
              </MuiLink>{' '}
              {t('auth.account.support_suffix', 'if you have questions.')}
            </Typography>
          </Box>
        </Card>
      </Container>
    </motion.div>
  )
}
