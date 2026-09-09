import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Container, Typography, Card, CardContent, Chip, alpha } from '@mui/material'
import ArrowBack from '@mui/icons-material/ArrowBack'
import Fingerprint from '@mui/icons-material/Fingerprint'
import UsbOutlined from '@mui/icons-material/UsbOutlined'
import PhoneIphone from '@mui/icons-material/PhoneIphone'
import ArrowForward from '@mui/icons-material/ArrowForward'
import CheckCircle from '@mui/icons-material/CheckCircle'
import Hub from '@mui/icons-material/Hub'
import { useTranslation } from 'react-i18next'
import Path from '../path'

interface CreationOption {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
  recommended?: boolean
}

export default function PasskeyCreationOptions() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const CREATION_OPTIONS: CreationOption[] = [
    {
      id: 'platform',
      icon: <Fingerprint />,
      title: t('auth.passkey.opt_this_device', 'This Device'),
      description: t(
        'auth.passkey.opt_this_device_desc',
        "Create a passkey using this device's built-in authenticator (Touch ID, Face ID, Windows Hello).",
      ),
      features: [
        t('auth.passkey.feat_fastest_setup', 'Fastest setup'),
        t('auth.passkey.feat_biometric', 'Biometric verification'),
        t('auth.passkey.feat_no_hardware', 'No additional hardware needed'),
      ],
      recommended: true,
    },
    {
      id: 'security_key',
      icon: <UsbOutlined />,
      title: t('auth.passkey.opt_security_key', 'Security Key'),
      description: t(
        'auth.passkey.opt_security_key_desc',
        'Use a hardware security key like YubiKey to create a portable, phishing-resistant passkey.',
      ),
      features: [
        t('auth.passkey.feat_highest_security', 'Highest security'),
        t('auth.passkey.feat_portable', 'Cross-device portable'),
        t('auth.passkey.feat_phishing_resistant', 'Phishing resistant'),
      ],
    },
    {
      id: 'phone',
      icon: <PhoneIphone />,
      title: t('auth.passkey.opt_another_device', 'Another Device'),
      description: t(
        'auth.passkey.opt_another_device_desc',
        'Scan a QR code with your phone or tablet to create a passkey on a different device.',
      ),
      features: [
        t('auth.passkey.feat_cross_device', 'Cross-device setup'),
        t('auth.passkey.feat_flexible', 'Flexible placement'),
        t('auth.passkey.feat_scan_link', 'Scan to link'),
      ],
    },
    {
      id: 'cross_platform',
      icon: <Hub />,
      title: t('auth.passkey.opt_cross_platform', 'Cross-Platform Passkey'),
      description: t(
        'auth.passkey.opt_cross_platform_desc',
        'Create a synced passkey stored in your cloud keychain, accessible from multiple devices.',
      ),
      features: [
        t('auth.passkey.feat_cloud_sync', 'iCloud / Google sync'),
        t('auth.passkey.feat_works_everywhere', 'Works everywhere'),
        t('auth.passkey.feat_auto_backup', 'Auto-backup'),
      ],
    },
  ]

  return (
    <Container maxWidth='sm' sx={{ py: 4 }}>
      {/* Breadcrumb */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 500 }}
        >
          {t('common.back', 'Back')}
        </Button>
        <Typography variant='body2' color='text.secondary'>
          /
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {t('auth.passkey.passkeys', 'Passkeys')}
        </Typography>
      </Box>

      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <Fingerprint sx={{ fontSize: 28, color: 'primary.main' }} />
        </Box>
        <Typography variant='h5' fontWeight={700} letterSpacing='-0.02em' sx={{ mb: 0.5 }}>
          {t('auth.passkey.creation_title', 'Create a Passkey')}
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          {t(
            'auth.passkey.creation_subtitle',
            "Choose how you'd like to create your passkey. Each option provides different benefits.",
          )}
        </Typography>
      </Box>

      {/* Options List */}
      {CREATION_OPTIONS.map((option) => (
        <Card
          key={option.id}
          onClick={() => setSelectedOption(option.id)}
          sx={{
            mb: 2,
            borderRadius: 3,
            border: 2,
            borderColor: selectedOption === option.id ? 'primary.main' : 'divider',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: selectedOption === option.id ? 'primary.main' : 'primary.light',
              transform: 'translateY(-1px)',
              boxShadow: 2,
            },
          }}
        >
          <CardContent sx={{ py: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  bgcolor: (theme) =>
                    selectedOption === option.id
                      ? alpha(theme.palette.primary.main, 0.1)
                      : 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  '& .MuiSvgIcon-root': {
                    fontSize: 22,
                    color: selectedOption === option.id ? 'primary.main' : 'text.secondary',
                  },
                }}
              >
                {option.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant='subtitle1' fontWeight={600}>
                    {option.title}
                  </Typography>
                  {option.recommended && (
                    <Chip
                      label={t('auth.passkey.recommended', 'Recommended')}
                      size='small'
                      color='primary'
                      sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                    />
                  )}
                  {selectedOption === option.id && (
                    <CheckCircle sx={{ fontSize: 18, color: 'primary.main', ml: 'auto' }} />
                  )}
                </Box>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  {option.description}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {option.features.map((feature) => (
                    <Chip
                      key={feature}
                      label={feature}
                      size='small'
                      variant='outlined'
                      sx={{ height: 22, fontSize: '0.65rem', borderRadius: 1 }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}

      {/* Action */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button onClick={() => navigate(-1)} sx={{ textTransform: 'none', fontWeight: 600 }}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button
          variant='contained'
          disabled={!selectedOption}
          onClick={() => navigate(Path.passkey.prompt)}
          endIcon={<ArrowForward />}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 4 }}
        >
          {t('common.continue', 'Continue')}
        </Button>
      </Box>
    </Container>
  )
}
