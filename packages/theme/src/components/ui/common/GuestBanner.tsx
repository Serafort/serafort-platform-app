/**
 * Guest Banner Component
 *
 * Displays a persistent banner to inform guest users about their session status
 * and encourage them to sign up for full features.
 */

import React from 'react'
import {
  Alert,
  AlertTitle,
  Button,
  Box,
  Collapse,
  IconButton,
  Typography,
  Chip,
  Stack,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import LockOpenIcon from '@mui/icons-material/LockOpen'


interface GuestBannerProps {
  isGuest: boolean
  onSignIn: () => void
  onSignUp: () => void
  variant?: 'minimal' | 'detailed'
  showCloseButton?: boolean
  message?: string
}

/**
 * Guest Banner Component
 *
 * Shows a banner to guest users encouraging them to sign up.
 * Can be dismissed but will reappear on page reload.
 */
export const GuestBanner: React.FC<GuestBannerProps> = ({
  isGuest,
  onSignIn,
  onSignUp,
  variant = 'detailed',
  showCloseButton = true,
  message,
}) => {
  const [open, setOpen] = React.useState(true)

  // Don't show if not a guest
  if (!isGuest || !open) {
    return null
  }

  const handleSignUp = () => {
    onSignUp()
  }

  const handleSignIn = () => {
    onSignIn()
  }

  const handleClose = () => {
    setOpen(false)
  }

  if (variant === 'minimal') {
    return (
      <Collapse in={open}>
        <Alert
          severity='info'
          icon={<PersonOffIcon />}
          action={
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button size='small' variant='text' onClick={handleSignIn}>
                Sign In
              </Button>
              <Button size='small' variant='contained' onClick={handleSignUp}>
                Sign Up
              </Button>
              {showCloseButton && (
                <IconButton size='small' onClick={handleClose}>
                  <CloseIcon fontSize='small' />
                </IconButton>
              )}
            </Box>
          }
          sx={{
            mb: 2,
            '& .MuiAlert-action': {
              alignItems: 'center',
              pt: 0,
            },
          }}
        >
          <Typography variant='body2'>
            {message || "You're browsing as a guest. Sign up to save your progress!"}
          </Typography>
        </Alert>
      </Collapse>
    )
  }

  return (
    <Collapse in={open}>
      <Alert
        severity='warning'
        icon={<PersonOffIcon />}
        action={
          showCloseButton ? (
            <IconButton size='small' onClick={handleClose}>
              <CloseIcon fontSize='small' />
            </IconButton>
          ) : undefined
        }
        sx={{
          mb: 3,
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        <AlertTitle sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip label='Guest Mode' size='small' color='warning' />
          <Typography variant='subtitle1' component='span'>
            Limited Access Active
          </Typography>
        </AlertTitle>

        <Stack spacing={2}>
          <Typography variant='body2'>
            {message ||
              "You're browsing as a guest. Your progress and data are temporary and will be lost when you close your browser."}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant='body2' color='text.secondary'>
              ✓ Current session only
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              • Limited features
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              • No data persistence
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              variant='contained'
              color='primary'
              size='small'
              startIcon={<LockOpenIcon />}
              onClick={handleSignUp}
            >
              Sign Up to Unlock Full Features
            </Button>
            <Button variant='outlined' color='primary' size='small' onClick={handleSignIn}>
              Sign In
            </Button>
          </Box>
        </Stack>
      </Alert>
    </Collapse>
  )
}

export default GuestBanner
