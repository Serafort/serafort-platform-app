import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Switch,
  FormGroup,
  FormControlLabel,
  Chip,
  alpha,
} from '@mui/material'
import ArrowBack from '@mui/icons-material/ArrowBack'
import Edit from '@mui/icons-material/Edit'
import Devices from '@mui/icons-material/Devices'
import Schedule from '@mui/icons-material/Schedule'
import CheckCircle from '@mui/icons-material/CheckCircle'
import { useTranslation } from 'react-i18next'

export default function PasskeyNamingConfig() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [passkeyName, setPasskeyName] = useState('MacBook Pro - Chrome')
  const [autoUse, setAutoUse] = useState(true)
  const [isSyncEnabled, setIsSyncEnabled] = useState(true)
  const [requireBiometric, setRequireBiometric] = useState(true)

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
      <Box sx={{ mb: 4 }}>
        <Typography variant='h5' fontWeight={700} letterSpacing='-0.02em' sx={{ mb: 0.5 }}>
          {t('auth.passkey.naming_title', 'Name & Configure Passkey')}
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          {t(
            'auth.passkey.naming_subtitle',
            'Give your passkey a recognizable name and configure its behavior.',
          )}
        </Typography>
      </Box>

      {/* Success Badge */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          border: 1,
          borderColor: 'success.main',
          bgcolor: (theme) => alpha(theme.palette.success.main, 0.05),
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            py: 2,
            '&:last-child': { pb: 2 },
          }}
        >
          <CheckCircle sx={{ color: 'success.main', fontSize: 28 }} />
          <Box>
            <Typography variant='subtitle2' fontWeight={600} color='success.dark'>
              {t('auth.passkey.created_success', 'Passkey Created Successfully')}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {t(
                'auth.passkey.created_message',
                'Your passkey is ready. Give it a name to identify it easily.',
              )}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Passkey Name */}
      <Card sx={{ borderRadius: 3, border: 1, borderColor: 'divider', mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Edit sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography variant='subtitle1' fontWeight={600}>
              {t('auth.passkey.passkey_name', 'Passkey Name')}
            </Typography>
          </Box>
          <TextField
            fullWidth
            value={passkeyName}
            onChange={(e) => setPasskeyName(e.target.value)}
            placeholder='e.g., Work Laptop'
            helperText='Choose a name to easily identify this passkey across your devices.'
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </CardContent>
      </Card>

      {/* Device Info */}
      <Card sx={{ borderRadius: 3, border: 1, borderColor: 'divider', mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Devices sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography variant='subtitle1' fontWeight={600}>
              {t('auth.passkey.device_info', 'Device Information')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip label='macOS 14.2' variant='outlined' size='small' sx={{ borderRadius: 1 }} />
            <Chip label='Chrome 120' variant='outlined' size='small' sx={{ borderRadius: 1 }} />
            <Chip label='Touch ID' variant='outlined' size='small' sx={{ borderRadius: 1 }} />
            <Chip label='WebAuthn L2' variant='outlined' size='small' sx={{ borderRadius: 1 }} />
          </Box>
          <Typography
            variant='caption'
            color='text.disabled'
            sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 1.5 }}
          >
            <Schedule sx={{ fontSize: 12 }} />
            Created just now
          </Typography>
        </CardContent>
      </Card>

      {/* Configuration Toggles */}
      <Card sx={{ borderRadius: 3, border: 1, borderColor: 'divider', mb: 3 }}>
        <CardContent>
          <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 2 }}>
            {t('auth.passkey.settings', 'Passkey Settings')}
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={<Switch checked={autoUse} onChange={(e) => setAutoUse(e.target.checked)} />}
              label={
                <Box>
                  <Typography variant='subtitle2' fontWeight={600}>
                    {t('auth.passkey.auto_use', 'Auto-use on this device')}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Automatically suggest this passkey when signing in from this device.
                  </Typography>
                </Box>
              }
              sx={{ mb: 2, alignItems: 'flex-start', '& .MuiSwitch-root': { mt: 0.5 } }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={isSyncEnabled}
                  onChange={(e) => setIsSyncEnabled(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant='subtitle2' fontWeight={600}>
                    {t('auth.passkey.cloud_sync', 'Cloud sync')}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Sync this passkey to your iCloud / Google Keychain for cross-device access.
                  </Typography>
                </Box>
              }
              sx={{ mb: 2, alignItems: 'flex-start', '& .MuiSwitch-root': { mt: 0.5 } }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={requireBiometric}
                  onChange={(e) => setRequireBiometric(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant='subtitle2' fontWeight={600}>
                    {t('auth.passkey.require_biometric', 'Require biometric')}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Always require fingerprint or face scan when using this passkey.
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', '& .MuiSwitch-root': { mt: 0.5 } }}
            />
          </FormGroup>
        </CardContent>
      </Card>

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={() => navigate(-1)} sx={{ textTransform: 'none', fontWeight: 600 }}>
          {t('common.skip', 'Skip')}
        </Button>
        <Button
          variant='contained'
          disabled={!passkeyName.trim()}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 4 }}
        >
          {t('auth.passkey.save_config', 'Save & Finish')}
        </Button>
      </Box>
    </Container>
  )
}
