import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography, Avatar, Stack, alpha, useTheme } from '@mui/material'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import Logout from '@mui/icons-material/Logout';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Path } from "@cap/module-auth/routes/path"

export default function EmailChangeSuccess() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()

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
        <Avatar variant="square"
          sx={{ width: 56, height: 56, bgcolor: 'transparent', color: 'success.main', borderRadius: '24px', border: '2px solid', borderColor: alpha(theme.palette.success.main, 0.2) }}>
          <CheckCircleOutline sx={{ fontSize: 32 }} />
        </Avatar>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
        {t('email.successHeading', 'All set!')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 5, lineHeight: 1.6 }}>
        {t('email.successDescription', 'Your email address has been successfully updated. Use your new email on your next login.')}
      </Typography>
      <Stack spacing={2}>
        <Button fullWidth variant="contained" size="large" onClick={() => navigate(Path.account.overview)} endIcon={<ArrowForward />}
          sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: 'success.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.success.main, 0.4)}`, '&:hover': { bgcolor: 'success.dark', transform: 'translateY(-1px)' } }}>
          {t('common.backToDashboard', 'Back to Dashboard')}
        </Button>
        <Button fullWidth variant="outlined" size="large" startIcon={<Logout />} onClick={() => navigate(Path.auth.signin)}
          sx={{ py: 1.2, borderRadius: 3, fontWeight: 700, textTransform: 'none', color: 'text.primary', borderColor: alpha(theme.palette.divider, 0.8), '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) } }}>
          {t('common.logoutRelogin', 'Sign out and Re-login')}
        </Button>
      </Stack>
    </Box>
  )
}

