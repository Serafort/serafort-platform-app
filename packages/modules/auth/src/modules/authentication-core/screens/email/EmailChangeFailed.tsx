import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography, Avatar, Stack, alpha, useTheme } from '@mui/material'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import History from '@mui/icons-material/History'
import ContactSupport from '@mui/icons-material/ContactSupport'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Path } from '@cap/module-auth/routes/path'

export default function EmailChangeFailed() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()

  return (
    <Box
      className='animate-scale-in'
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      sx={{ width: '100%', maxWidth: 440, mx: 'auto', p: { xs: 3, md: 5 }, textAlign: 'center' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Avatar
          variant='square'
          sx={{
            width: 56,
            height: 56,
            bgcolor: 'transparent',
            color: 'error.main',
            borderRadius: '24px',
            border: '2px solid',
            borderColor: alpha(theme.palette.error.main, 0.2),
          }}
        >
          <ErrorOutline sx={{ fontSize: 32 }} />
        </Avatar>
      </Box>
      <Typography variant='h4' sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
        {t('email.expiredHeading', 'Link Expired')}
      </Typography>
      <Typography
        variant='body1'
        color='text.secondary'
        sx={{ fontWeight: 500, mb: 5, lineHeight: 1.6 }}
      >
        {t(
          'email.expiredDescription',
          'The email change verification link has expired or is invalid. For your security, these links are only active for a short period.',
        )}
      </Typography>
      <Stack spacing={2}>
        <Button
          variant='contained'
          size='large'
          fullWidth
          onClick={() => navigate(Path.auth.requestEmailChange)}
          startIcon={<History />}
          endIcon={<ArrowForward />}
          sx={{
            py: 1.5,
            borderRadius: 3,
            fontWeight: 800,
            fontSize: '1rem',
            textTransform: 'none',
            bgcolor: 'info.main',
            boxShadow: (t) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`,
            '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)' },
          }}
        >
          {t('email.requestNewLink', 'Request New Link')}
        </Button>
        <Button
          variant='outlined'
          size='large'
          fullWidth
          startIcon={<ContactSupport />}
          sx={{
            py: 1.2,
            borderRadius: 3,
            fontWeight: 700,
            textTransform: 'none',
            color: 'text.primary',
            borderColor: alpha(theme.palette.divider, 0.8),
            '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) },
          }}
        >
          {t('common.contactSupport', 'Contact Support')}
        </Button>
        <Button
          onClick={() => navigate(Path.account.profile)}
          sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
        >
          {t('common.backToDashboard', 'Back to Dashboard')}
        </Button>
      </Stack>
    </Box>
  )
}
