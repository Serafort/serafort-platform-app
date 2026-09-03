import { Box, Typography, Button, Avatar, Stack, alpha, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LockOutlined from '@mui/icons-material/LockOutlined';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion'
import { Path } from "@cap/module-auth/routes/path"

const Page403Forbidden = () => {
  const navigate = useNavigate()
  const { t } = useTranslation('auth')
  const theme = useTheme()

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
          sx={{ width: 56, height: 56, bgcolor: 'transparent', color: 'error.main', borderRadius: '24px', border: '2px solid', borderColor: alpha(theme.palette.error.main, 0.2) }}>
          <LockOutlined sx={{ fontSize: 32 }} />
        </Avatar>
      </Box>

      <Typography variant="overline" sx={{ fontWeight: 800, color: 'error.main', letterSpacing: '0.1em', display: 'block', mb: 1 }}>
        403 {t('errors.forbidden', 'Forbidden')}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, letterSpacing: '-0.027em' }}>
        {t('errors.forbiddenTitle', 'Access Forbidden')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 5, lineHeight: 1.6 }}>
        {t('errors.forbiddenDesc', "You don't have permission to access this resource. Please contact your administrator if you believe this is an error.")}
      </Typography>

      <Stack direction="row" spacing={2} justifyContent="center">
        <Button variant="outlined" onClick={() => navigate(-1)} startIcon={<ArrowBack />}
          sx={{ py: 1.5, px: 4, borderRadius: 3, fontWeight: 700, textTransform: 'none', borderColor: alpha(theme.palette.divider, 0.8), color: 'text.primary', '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) } }}>
          {t('common.goBack', 'Go Back')}
        </Button>
        <Button variant="contained" onClick={() => navigate(Path.auth.signin)} endIcon={<ArrowForward />}
          sx={{ py: 1.5, px: 4, borderRadius: 3, fontWeight: 800, textTransform: 'none', bgcolor: 'info.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`, '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)' } }}>
          {t('signin.title', 'Sign In')}
        </Button>
      </Stack>
    </Box>
  )
}

export default Page403Forbidden
