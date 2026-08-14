/// <reference types="vite-plugin-pwa/client" />
import { useState, useEffect } from 'react'
import { Snackbar, Button, Alert, AlertTitle, Box, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * PWA Update Prompt Component
 *
 * Shows a notification when a new version of the app is available
 * Allows users to update immediately or dismiss
 */
export function PWAUpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false)

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  useEffect(() => {
    if (offlineReady || needRefresh) {
      setShowPrompt(true)
    }
  }, [offlineReady, needRefresh])

  const handleClose = () => {
    setShowPrompt(false)
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  const handleUpdate = () => {
    updateServiceWorker(true)
  }

  if (!showPrompt) return null

  return (
    <Snackbar
      open={showPrompt}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{ bottom: { xs: 90, sm: 24 } }}
    >
      <Alert
        severity={needRefresh ? 'info' : 'success'}
        variant='filled'
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {needRefresh && (
              <Button
                color='inherit'
                size='small'
                onClick={handleUpdate}
                startIcon={<RefreshIcon />}
              >
                Update
              </Button>
            )}
            <IconButton size='small' aria-label='close' color='inherit' onClick={handleClose}>
              <CloseIcon fontSize='small' />
            </IconButton>
          </Box>
        }
      >
        <AlertTitle>
          {needRefresh ? 'New Version Available' : 'App Ready to Work Offline'}
        </AlertTitle>
        {needRefresh
          ? 'A new version is available. Click Update to refresh.'
          : 'The app is ready to work offline!'}
      </Alert>
    </Snackbar>
  )
}

export default PWAUpdatePrompt
