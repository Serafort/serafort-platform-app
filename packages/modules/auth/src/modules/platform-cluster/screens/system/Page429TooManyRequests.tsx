import { Box, Typography, LinearProgress, Button, Avatar, Stack, alpha, useTheme } from '@mui/material'
import Speed from '@mui/icons-material/Speed';
import Refresh from '@mui/icons-material/Refresh';
import SupportAgent from '@mui/icons-material/SupportAgent';
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

export default function Page429TooManyRequests() {
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
      sx={{ width: '100%', maxWidth: 480, mx: 'auto', p: { xs: 3, md: 5 }, textAlign: 'center' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Avatar variant="square"
          sx={{ width: 56, height: 56, bgcolor: 'transparent', color: 'warning.main', borderRadius: '24px', border: '2px solid', borderColor: alpha(theme.palette.warning.main, 0.2) }}>
          <Speed sx={{ fontSize: 32 }} />
        </Avatar>
      </Box>

      <Typography variant="overline" sx={{ fontWeight: 800, color: 'warning.main', letterSpacing: '0.1em', display: 'block', mb: 1 }}>
        429 {t('system.limitReached', 'Rate Limit Reached')}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, letterSpacing: '-0.027em' }}>
        {t('system.rateLimitHeading', 'Please slow down')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 5, lineHeight: 1.6 }}>
        {t('system.rateLimitDescription', "We've detected a high number of requests from your connection. Please wait a few moments before trying again.")}
      </Typography>

      <LinearProgress variant="indeterminate"
        sx={{ height: 6, borderRadius: 3, mb: 5, bgcolor: (t) => alpha(t.palette.warning.main, 0.1), '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: 'warning.main' } }} />

      <Stack direction="row" spacing={2}>
        <Button variant="outlined" size="large" fullWidth onClick={() => window.location.reload()} startIcon={<Refresh />}
          sx={{ py: 1.5, borderRadius: 3, fontWeight: 700, textTransform: 'none', borderColor: alpha(theme.palette.divider, 0.8), color: 'text.primary', '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) } }}>
          {t('system.retryNow', 'Try again')}
        </Button>
        <Button variant="contained" size="large" fullWidth onClick={() => navigate('/contact')} startIcon={<SupportAgent />}
          sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, textTransform: 'none', bgcolor: 'info.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`, '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)' } }}>
          {t('common.contactSupport', 'Get Help')}
        </Button>
      </Stack>

      <Typography variant="caption" sx={{ mt: 4, display: 'block', color: 'text.disabled', fontWeight: 500 }}>
        {t('system.yourIp', 'Your IP address')}:{' '}
        <Box component="span" sx={{ fontFamily: 'monospace' }}>192.168.1.1</Box>
      </Typography>
    </Box>
  )
}
