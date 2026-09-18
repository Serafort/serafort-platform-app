import { useState, useCallback } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Link as MuiLink,
} from '@mui/material'
import Warning from '@mui/icons-material/Warning'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useDeactivateAccount, useUserProfile } from '../../hooks/useUserQuery'
import logger from '@idaas/authentication-core/utils/logger'
import { Path } from '@cap/module-auth/routes/path'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'

export default function DeactivateAccount() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  // const _theme = useTheme()
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
    navigate(Path.account.settings)
  }, [navigate])

  return (
    <Box
      component='main'
      className='animate-scale-in'
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3, lg: 4 },
        width: '100%',
        overflowY: 'auto',
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={(theme: any) => ({
          width: '100%',
          maxWidth: 560,
          borderRadius: 3,
          border: '1px solid ' + theme.palette.divider,
          overflow: 'hidden',
          ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
        })}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pt: 5,
            pb: 1,
            px: { xs: 3, sm: 6 },
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'error.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <Warning sx={{ color: 'error.main', fontSize: 40 }} />
          </Box>

          <Typography
            variant='h4'
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.5rem', sm: '1.875rem' },
              letterSpacing: '-0.02em',
              pb: 1,
            }}
          >
            {t('auth.account.deactivate_title', 'Deactivate Account')}
          </Typography>

          <Typography
            variant='body1'
            sx={{
              color: 'text.secondary',
              fontSize: '1rem',
              lineHeight: 1.6,
            }}
          >
            {t(
              'auth.account.deactivate_description',
              'Deactivating your account will temporarily disable your profile and access. You can reactivate anytime by logging back in.',
            )}
          </Typography>
        </Box>

        {/* Form Content */}
        <Box sx={{ px: { xs: 3, sm: 6 }, py: 3 }}>
          {deactivateAccountMutation.isError && (
            <Alert severity='error' sx={{ mb: 3 }}>
              {(deactivateAccountMutation.error as any)?.message ||
                t('auth.common.errorOccurred', 'An error occurred during deactivation')}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Confirmation Input */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography
                component='label'
                htmlFor='confirm-deactivate'
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 48,
                    borderRadius: 2,
                  },
                }}
              />
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column-reverse', sm: 'row' },
                gap: 1.5,
                pt: 1,
              }}
            >
              <Button
                fullWidth
                variant='outlined'
                onClick={handleCancel}
                sx={{
                  height: 44,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                {t('auth.account.cancel', 'Cancel')}
              </Button>
              <Button
                fullWidth
                variant='contained'
                color='error'
                onClick={handleDeactivate}
                disabled={
                  (confirmText.toUpperCase() !== 'DEACTIVATE' &&
                    confirmText.toUpperCase() !== 'DELETE') ||
                  deactivateAccountMutation.isPending
                }
                sx={{
                  height: 44,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: 1,
                }}
              >
                {deactivateAccountMutation.isPending ? (
                  <CircularProgress size={24} color='inherit' />
                ) : (
                  t('auth.account.deactivate_submit_button', 'Deactivate Account')
                )}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            bgcolor: 'action.hover',
            px: 3,
            py: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            textAlign: 'center',
          }}
        >
          <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
            {t('auth.account.support_prefix')}{' '}
            <MuiLink
              href='#'
              onClick={(e) => {
                e.preventDefault()
                // Navigate to support
              }}
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {t('auth.account.customer_support')}
            </MuiLink>{' '}
            {t('auth.account.support_suffix')}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
