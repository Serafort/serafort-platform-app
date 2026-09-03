import { Box, Typography, Grid, Link, Avatar, alpha, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import WarningAmber from '@mui/icons-material/WarningAmber'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline'
import { motion } from 'framer-motion'

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
    <Box
      className='animate-scale-in'
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      sx={{ width: '100%', maxWidth: 560, mx: 'auto', p: { xs: 3, md: 5 }, textAlign: 'center' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Avatar
          variant='square'
          sx={{
            width: 56,
            height: 56,
            bgcolor: 'transparent',
            color: 'warning.main',
            borderRadius: '24px',
            border: '2px solid',
            borderColor: alpha(theme.palette.warning.main, 0.2),
          }}
        >
          <WarningAmber sx={{ fontSize: 32 }} />
        </Avatar>
      </Box>

      <Typography variant='h4' sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
        {t('browser.notSupportedTitle', 'Update Required')}
      </Typography>
      <Typography
        variant='body1'
        color='text.secondary'
        sx={{ fontWeight: 500, mb: 5, maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}
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
                display: 'block',
                p: 2,
                borderRadius: 3,
                bgcolor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
                textDecoration: 'none',
                color: 'text.primary',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'action.selected',
                  borderColor: 'primary.main',
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CheckCircleOutline
                sx={{ fontSize: 20, mb: 1, color: 'primary.main', display: 'block', mx: 'auto' }}
              />
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                {browser.name}
              </Typography>
            </Link>
          </Grid>
        ))}
      </Grid>

      <Typography variant='caption' color='text.disabled'>
        {t(
          'browser.securityNotice',
          'Security is our priority. Older browsers may lack critical protection.',
        )}
      </Typography>
    </Box>
  )
}

export default BrowserNotSupported
