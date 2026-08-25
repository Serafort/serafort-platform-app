import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography, Avatar, Stack, Divider, alpha, useTheme, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import CheckCircle from '@mui/icons-material/CheckCircle';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Settings from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface RegistrationSuccessProps {
  userName?: string
  redirectPath?: string
}

export default function RegistrationSuccess({ userName, redirectPath = '/dashboard' }: RegistrationSuccessProps) {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()

  const handleGoToDashboard = useCallback(() => navigate(redirectPath), [navigate, redirectPath])
  const handleCompleteLater = useCallback(() => navigate('/profile/settings'), [navigate])

  return (
    <Box
      className="animate-scale-in"
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      sx={{ width: '100%', maxWidth: 460, mx: 'auto', p: { xs: 3, md: 5 }, textAlign: 'center' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Avatar
          variant="circular"
          sx={{
            width: 64,
            height: 64,
            bgcolor: alpha(theme.palette.success.main, 0.12),
            color: 'success.main',
            border: '2px solid',
            borderColor: alpha(theme.palette.success.main, 0.3),
            boxShadow: `0 0 24px ${alpha(theme.palette.success.main, 0.25)}`,
          }}
        >
          <CheckCircle sx={{ fontSize: 36 }} />
        </Avatar>
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
        {t('success.registrationHeading', 'Welcome aboard!')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 3, lineHeight: 1.6 }}>
        {userName
          ? t('success.welcomeMessage', { name: userName, defaultValue: `Welcome, ${userName}! Your account is ready.` })
          : t('success.genericSuccessMessage', 'Your workspace account has been created successfully.')}
      </Typography>

      {/* Onboarding Checklist — Peak-End Rule clarity */}
      <Box
        sx={{
          bgcolor: alpha(theme.palette.background.paper, 0.6),
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          p: 2,
          mb: 4,
          textAlign: 'left',
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
          Workspace Ready:
        </Typography>
        <List dense disablePadding>
          <ListItem disableGutters sx={{ py: 0.25 }}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CheckCircle color="success" sx={{ fontSize: 16 }} />
            </ListItemIcon>
            <ListItemText primary="Identity & session credentials verified" primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
          </ListItem>
          <ListItem disableGutters sx={{ py: 0.25 }}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CheckCircle color="success" sx={{ fontSize: 16 }} />
            </ListItemIcon>
            <ListItemText primary="Default tenant permissions configured" primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
          </ListItem>
          <ListItem disableGutters sx={{ py: 0.25 }}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <SecurityIcon color="primary" sx={{ fontSize: 16 }} />
            </ListItemIcon>
            <ListItemText primary="Zero-trust audit telemetry enabled" primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
          </ListItem>
        </List>
      </Box>

      <Stack spacing={2}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleGoToDashboard}
          endIcon={<ArrowForward />}
          sx={{
            py: 1.5,
            borderRadius: 3,
            fontWeight: 900,
            fontSize: '1rem',
            textTransform: 'none',
            boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.45)}`,
            },
          }}
        >
          {t('success.goToDashboard', 'Enter Workspace Console')}
        </Button>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleCompleteLater}
          startIcon={<Settings sx={{ fontSize: 18 }} />}
          sx={{
            py: 1.2,
            borderRadius: 3,
            fontWeight: 700,
            textTransform: 'none',
            color: 'text.primary',
            borderColor: 'divider',
            '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) },
          }}
        >
          {t('success.completeProfileLater', 'Account & Security Settings')}
        </Button>
      </Stack>

      <Typography variant="caption" sx={{ mt: 4, display: 'block', color: 'text.disabled', textAlign: 'center' }}>
        {t('success.footerNote', 'You can customize roles and tenant settings anytime.')}
      </Typography>
    </Box>
  )
}

