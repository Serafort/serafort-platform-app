import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography, Avatar, Stack, alpha, useTheme } from '@mui/material'
import Celebration from '@mui/icons-material/Celebration';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Path } from "@cap/module-auth/routes/path"

export default function EmailVerifiedSuccess() {
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
          sx={{ width: 56, height: 56, bgcolor: 'transparent', color: 'primary.main', borderRadius: '24px', border: '2px solid', borderColor: alpha(theme.palette.primary.main, 0.2) }}>
          <Celebration sx={{ fontSize: 32 }} />
        </Avatar>
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
        {t('verify.verifiedHeading', "You're Verified!")}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 5, lineHeight: 1.7 }}>
        {t('verify.verifiedDescription', 'Your email has been confirmed. You now have full access to all features.')}
      </Typography>

      <Stack spacing={2}>
        <Button fullWidth variant="contained" size="large" onClick={() => navigate('/dashboard')}
          endIcon={<ArrowForward />}
          sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: 'info.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`, '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)', boxShadow: (t) => `0 6px 20px ${alpha(t.palette.info.main, 0.23)}` } }}>
          {t('verify.getStarted', 'Explore Dashboard')}
        </Button>
        <Button fullWidth variant="text" size="large" onClick={() => navigate(Path.account.overview)}
          sx={{ py: 1.2, borderRadius: 3, fontWeight: 700, textTransform: 'none', color: 'text.secondary', '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) } }}>
          {t('verify.completeProfile', 'Complete Profile Setup')}
        </Button>
      </Stack>
    </Box>
  )
}
