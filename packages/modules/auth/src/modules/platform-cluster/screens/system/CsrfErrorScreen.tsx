import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography, Link as MuiLink, Stack, alpha, useTheme } from '@mui/material'
import {
  AuthPageLayout,
  AuthScreenIcon,
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
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <AuthScreenIcon icon={<SecurityUpdateWarning sx={{ fontSize: 32 }} />} color='error.main' />
      </Box>

      <Typography variant='h4' sx={{ fontWeight: 900, mb: 2, letterSpacing: '-0.027em' }}>
        {t('system.csrfErrorHeading', 'Security session mismatch')}
      </Typography>
      <Typography
        variant='body1'
        color='text.secondary'
        sx={{ fontWeight: 500, mb: 5, lineHeight: 1.6 }}
      >
        {t(
          'system.csrfErrorDescription',
          "We couldn't verify your request. This usually happens when multiple tabs are open or your session has timed out.",
        )}
      </Typography>

      <Stack spacing={2}>
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
          label={t('system.refreshButton', 'Refresh and try again')}
        />
        <Button
          variant='text'
          size='large'
          fullWidth
          onClick={() => navigate('/')}
          startIcon={<Home />}
          sx={{
            py: 1.2,
            borderRadius: 3,
            fontWeight: 600,
            color: 'text.secondary',
            textTransform: 'none',
            '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) },
          }}
        >
          {t('system.backHome', 'Return to Home')}
        </Button>
      </Stack>

      <Box
        sx={{
          mt: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          p: 2,
          borderRadius: 2,
          bgcolor: 'action.hover',
        }}
      >
        <HelpOutline sx={{ color: 'text.disabled', fontSize: 18 }} />
        <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {t('system.whyThisHappening', 'Why am I seeing this?')}{' '}
          <MuiLink
            href='#'
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {t('common.learnMore', 'Learn more')}
          </MuiLink>
        </Typography>
      </Box>
    </AuthPageLayout>
  )
}
