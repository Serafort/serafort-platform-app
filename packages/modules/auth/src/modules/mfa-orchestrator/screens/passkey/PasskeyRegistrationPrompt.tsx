import React from 'react'
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Stack,
  CircularProgress,
} from '@mui/material'
import Fingerprint from '@mui/icons-material/Fingerprint'
import Bolt from '@mui/icons-material/Bolt'
import VerifiedUser from '@mui/icons-material/VerifiedUser'
import Devices from '@mui/icons-material/Devices'
import CheckCircle from '@mui/icons-material/CheckCircle'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  AuthPageLayout,
  AuthCard,
  AuthCardHeader,
} from '../../../authentication-core/components/shared/auth'
import { usePasskey } from '../../hooks'

export default function PasskeyRegistrationPrompt() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const { registerPasskey, isLoading, error } = usePasskey()

  const handleCreatePasskey = async () => {
    try {
      await registerPasskey()
      navigate('/dashboard')
    } catch {
      // Error handled via usePasskey state
    }
  }

  const benefits = [
    {
      icon: <Bolt />,
      title: t('passkey.benefitInstantTitle', 'Instant sign-in'),
      description: t('passkey.benefitInstantDesc', 'No passwords to remember or type.'),
    },
    {
      icon: <VerifiedUser />,
      title: t('passkey.benefitSafetyTitle', 'Phishing-resistant'),
      description: t('passkey.benefitSafetyDesc', 'Tied to your device, not a password.'),
    },
    {
      icon: <Devices />,
      title: t('passkey.benefitSyncTitle', 'Syncs across devices'),
      description: t('passkey.benefitSyncDesc', 'Works on all your trusted devices.'),
    },
  ]

  return (
    <AuthPageLayout maxWidth={480}>
      <AuthCard padding='comfortable'>
        <AuthCardHeader
          icon={<Fingerprint sx={{ fontSize: 32 }} />}
          iconSize={64}
          title={t('passkey.registrationTitle', 'Add a passkey')}
          subtitle={t(
            'passkey.registrationDesc',
            'Passkeys replace passwords with your device biometrics for a faster, safer sign-in.',
          )}
        />

        <List disablePadding sx={{ mb: 3 }}>
          {benefits.map((benefit, index) => (
            <ListItem
              key={index}
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: 'var(--sf-radius-md, 8px)',
                mb: 1,
                bgcolor: 'action.hover',
              }}
            >
              <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                {benefit.icon}
              </ListItemIcon>
              <ListItemText
                primary={benefit.title}
                secondary={benefit.description}
                primaryTypographyProps={{ fontWeight: 700, fontSize: 14 }}
                secondaryTypographyProps={{ fontSize: 13 }}
              />
            </ListItem>
          ))}
        </List>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            mb: 3,
            textAlign: 'center',
          }}
        >
          <CheckCircle color='primary' sx={{ fontSize: 16 }} />
          <Typography variant='caption' color='text.secondary' fontWeight={500}>
            {t(
              'passkey.supportedOn',
              'Supported on Touch ID, Face ID, Windows Hello, and hardware keys',
            )}
          </Typography>
        </Box>

        {error && (
          <Alert
            severity='error'
            role='alert'
            aria-live='polite'
            sx={{
              mb: 3,
              borderRadius: 'var(--sf-radius-md, 8px)',
              '& .MuiAlert-message': { fontWeight: 600 },
            }}
          >
            {error}
          </Alert>
        )}

        <Stack spacing={1.5}>
          <Button
            fullWidth
            variant='contained'
            size='large'
            onClick={handleCreatePasskey}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color='inherit' /> : null}
            endIcon={!isLoading ? <ArrowForward /> : null}
            sx={{
              minHeight: 48,
              borderRadius: 'var(--sf-radius-lg, 12px)',
              fontWeight: 800,
              fontSize: '1rem',
              textTransform: 'none',
              bgcolor: 'info.main',
              color: 'info.contrastText',
              boxShadow: 'var(--sf-shadow-glow, none)',
              '&:hover': {
                bgcolor: 'info.dark',
              },
            }}
          >
            {isLoading
              ? t('passkey.creatingPasskey', 'Creating Passkey...')
              : t('passkey.createPasskey', 'Create a passkey')}
          </Button>

          <Button
            fullWidth
            variant='text'
            onClick={() => navigate('/dashboard')}
            disabled={isLoading}
            sx={{
              minHeight: 44,
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { color: 'text.primary' },
            }}
          >
            {t('passkey.maybeLater', 'Maybe later')}
          </Button>
        </Stack>
      </AuthCard>
    </AuthPageLayout>
  )
}
