import { Box, Typography, Grid, Link, Avatar, alpha, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import WarningAmber from '@mui/icons-material/WarningAmber'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline'
import { AuthPageLayout } from '@idaas/authentication-core/components/shared/auth'

const browsers = [
  { name: 'Google Chrome', url: 'https://www.google.com/chrome/' },
  { name: 'Mozilla Firefox', url: 'https://www.mozilla.org/firefox/' },
  { name: 'Microsoft Edge', url: 'https://www.microsoft.com/edge' },
  { name: 'Apple Safari', url: 'https://www.apple.com/safari/' },
]

const BrowserNotSupported = () => {
  const { t } = useTranslation('auth')
  const theme = useTheme()

  return (
    <AuthPageLayout maxWidth={560}>
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Avatar
            variant='rounded'
            sx={{
              width: 64,
              height: 64,
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              color: 'warning.main',
              borderRadius: 'var(--sf-radius-lg, 16px)',
              border: '1px solid',
              borderColor: alpha(theme.palette.warning.main, 0.2),
            }}
          >
            <WarningAmber sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>

        <Typography variant='h4' sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.025em' }}>
          {t('browser.notSupportedTitle', 'Update Required')}
        </Typography>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ fontWeight: 500, mb: 4, maxWidth: 480, mx: 'auto', lineHeight: 1.6 }}
        >
          {t(
            'browser.notSupportedDesc',
            'Your current browser version is not supported. For optimal security and performance, please use a modern browser.',
          )}
        </Typography>

        <Grid container spacing={2} justifyContent='center' sx={{ mb: 4 }}>
          {browsers.map((browser) => (
            <Grid key={browser.name} size={{ xs: 6, sm: 3 }}>
              <Link
                href={browser.url}
                target='_blank'
                rel='noopener noreferrer'
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 88,
                  p: 2,
                  borderRadius: 'var(--sf-radius-md, 8px)',
                  bgcolor: alpha(theme.palette.action.hover, 0.5),
                  border: '1px solid',
                  borderColor: 'divider',
                  textDecoration: 'none',
                  color: 'text.primary',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.action.selected, 0.8),
                    borderColor: 'primary.main',
                  },
                }}
              >
                <CheckCircleOutline
                  sx={{ fontSize: 24, mb: 1, color: 'primary.main' }}
                />
                <Typography variant='body2' sx={{ fontWeight: 600 }}>
                  {browser.name}
                </Typography>
              </Link>
            </Grid>
          ))}
        </Grid>

        <Typography variant='caption' color='text.disabled' sx={{ fontWeight: 500 }}>
          {t(
            'browser.securityNotice',
            'Security is our priority. Older browsers may lack critical protection.',
          )}
        </Typography>
      </Box>
    </AuthPageLayout>
  )
}

export default BrowserNotSupported
