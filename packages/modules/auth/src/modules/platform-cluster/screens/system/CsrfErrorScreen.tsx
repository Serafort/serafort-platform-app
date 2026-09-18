import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography, Link as MuiLink, Stack, alpha, useTheme, Avatar } from '@mui/material'
import {
  AuthPageLayout,
  AuthActionButton,
} from '@idaas/authentication-core/components/shared/auth'
import SecurityUpdateWarning from '@mui/icons-material/SecurityUpdateWarning'
import HelpOutline from '@mui/icons-material/HelpOutline'
import Refresh from '@mui/icons-material/Refresh'
import Home from '@mui/icons-material/Home'

import { useTranslation } from 'react-i18next'
import { apiClient } from '@cap/platform-core'
import { ENDPOINTS } from '@cap/platform-core'

export default function CsrfErrorScreen() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()

  return (
    <AuthPageLayout maxWidth={480}>
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Avatar
            variant='rounded'
            sx={{
              width: 64,
              height: 64,
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: 'error.main',
              borderRadius: 'var(--sf-radius-lg, 16px)',
              border: '1px solid',
              borderColor: alpha(theme.palette.error.main, 0.2),
            }}
          >
            <SecurityUpdateWarning sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>

        <Typography variant='h4' sx={{ fontWeight: 800, mb: 1.5, letterSpacing: '-0.025em' }}>
          {t('system.csrfErrorHeading', 'Security Session Mismatch')}
        </Typography>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ fontWeight: 500, mb: 4, lineHeight: 1.6, maxWidth: 400, mx: 'auto' }}
        >
          {t(
            'system.csrfErrorDescription',
            "We couldn't verify your request. This usually happens when multiple tabs are open or your session has timed out.",
          )}
        </Typography>

        <Stack spacing={1.5}>
          <AuthActionButton
            startIcon={<Refresh />}
            onClick={async () => {
              try {
                await apiClient.get(ENDPOINTS.auth.csrfToken)
              } catch (e) {
                console.error(e)
              } finally {
                window.location.reload()
              }
            }}
            label={t('system.refreshButton', 'Refresh and Try Again')}
          />
          <Button
            variant='outlined'
            fullWidth
            onClick={() => navigate('/')}
            startIcon={<Home />}
            sx={{
              minHeight: 48,
              borderRadius: 'var(--sf-radius-md, 8px)',
              fontWeight: 600,
              color: 'text.secondary',
              borderColor: 'divider',
              textTransform: 'none',
              '&:hover': {
                borderColor: 'text.primary',
                color: 'text.primary',
                bgcolor: alpha(theme.palette.action.hover, 0.5),
              },
            }}
          >
            {t('system.backHome', 'Return to Home')}
          </Button>
        </Stack>

        <Box
          sx={{
            mt: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            p: 1.5,
            borderRadius: 'var(--sf-radius-md, 8px)',
            bgcolor: alpha(theme.palette.action.hover, 0.5),
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <HelpOutline sx={{ color: 'text.secondary', fontSize: 18 }} />
          <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {t('system.whyThisHappening', 'Why am I seeing this?')}{' '}
            <MuiLink
              href='#'
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {t('common.learnMore', 'Learn more')}
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </AuthPageLayout>
  )
}
