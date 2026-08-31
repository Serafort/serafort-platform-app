import { useState } from 'react'
import { Box, Button, Typography, Container, Alert } from '@mui/material'
import Fingerprint from '@mui/icons-material/Fingerprint'
import { useTranslation } from 'react-i18next'
import PasskeySetupAuto from './PasskeySetupAuto'

/**
 * Example usage of PasskeySetup component
 * This demonstrates how to integrate the PasskeySetup dialog into your flows
 */
export default function PasskeySetupExample() {
  const { t } = useTranslation()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleOpenDialog = () => {
    setDialogOpen(true)
    setSuccessMessage(null)
    setErrorMessage(null)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  const handleSuccess = () => {
    setDialogOpen(false)
    setSuccessMessage(t('auth.passkey.success_created'))
    // Optionally navigate to another page
    // navigate('/dashboard')
  }

  const handleError = (error: string) => {
    setDialogOpen(false)
    setErrorMessage(error)
  }

  return (
    <Container maxWidth='sm' sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant='h4' fontWeight={700} gutterBottom>
          {t('auth.passkey.demo_title')}
        </Typography>
        <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
          {t('auth.passkey.demo_desc')}
        </Typography>

        {successMessage && (
          <Alert severity='success' sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        <Button
          variant='contained'
          size='large'
          startIcon={<Fingerprint />}
          onClick={handleOpenDialog}
          sx={{ px: 4, py: 1.5 }}
        >
          {t('auth.passkey.setup_button')}
        </Button>
      </Box>

      {/* Passkey Setup Dialog */}
      <PasskeySetupAuto
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </Container>
  )
}
