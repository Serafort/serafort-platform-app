import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Avatar, alpha, useTheme, Stack } from '@mui/material';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Home from '@mui/icons-material/Home';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Path } from '@cap/module-auth/routes/path';

export default function Page401Unauthorized() {
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
          sx={{ width: 56, height: 56, bgcolor: 'transparent', color: 'text.secondary', borderRadius: '24px', border: '2px solid', borderColor: alpha(theme.palette.text.secondary, 0.2) }}>
          <LockOutlined sx={{ fontSize: 32 }} />
        </Avatar>
      </Box>

      <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: '0.1em', display: 'block', mb: 1 }}>
        401 {t('system.error', 'Error')}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, letterSpacing: '-0.027em' }}>
        {t('system.unauthorizedHeading', 'Access denied')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 5, lineHeight: 1.6 }}>
        {t('system.unauthorizedDescription', "You don't have permission to access this page. Please make sure you're signed in with the correct account.")}
      </Typography>

      <Stack direction="row" spacing={2}>
        <Button variant="outlined" size="large" fullWidth onClick={() => navigate('/')} startIcon={<Home />}
          sx={{ py: 1.5, borderRadius: 3, fontWeight: 700, textTransform: 'none', borderColor: alpha(theme.palette.divider, 0.8), color: 'text.primary', '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) } }}>
          {t('system.backHome', 'Back Home')}
        </Button>
        <Button variant="contained" size="large" fullWidth onClick={() => navigate(Path.auth.signin)} endIcon={<ArrowForward />}
          sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, textTransform: 'none', bgcolor: 'info.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`, '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)' } }}>
          {t('common.loginButton', 'Log In')}
        </Button>
      </Stack>

      <Typography variant="caption" sx={{ mt: 4, display: 'block', color: 'text.disabled', fontWeight: 500 }}>
        {t('system.incidentId', 'Incident ID')}:{' '}
        <Box component="span" sx={{ fontFamily: 'monospace' }}>
          UNAUTH-{new Date().getFullYear()}-REF-4829
        </Box>
      </Typography>
    </Box>
  )
}
