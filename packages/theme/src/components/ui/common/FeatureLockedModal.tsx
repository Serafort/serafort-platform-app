/**
 * Feature Locked Modal Component
 *
 * Modal that appears when a guest user tries to access a feature
 * that requires authentication. Encourages sign up with feature benefits.
 */

import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Stack,
  Chip,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import LockIcon from '@mui/icons-material/Lock'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'


export interface FeatureLockedModalProps {
  open: boolean
  onClose: () => void
  onSignIn: () => void
  onSignUp: () => void
  featureName: string
  featureDescription?: string
  benefits?: string[]
}

/**
 * Feature Locked Modal
 *
 * Shows when a guest tries to access a restricted feature.
 * Displays the benefits of signing up and provides direct links to auth pages.
 */
export const FeatureLockedModal: React.FC<FeatureLockedModalProps> = ({
  open,
  onClose,
  onSignIn,
  onSignUp,
  featureName,
  featureDescription,
  benefits,
}) => {

  const defaultBenefits = [
    'Save your progress and resume',
    'Get personalized job recommendations',
    'Track your applications',
    'Access advanced analytics',
    'Automate job applications',
    'Export your data anytime',
  ]

  const displayBenefits = benefits || defaultBenefits

  const handleSignUp = () => {
    onClose()
    onSignUp()
  }

  const handleSignIn = () => {
    onClose()
    onSignIn()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockIcon color='warning' />
            <Typography variant='h6'>Feature Locked</Typography>
          </Box>
          <IconButton size='small' onClick={onClose} aria-label='close'>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Feature Info */}
          <Box>
            <Chip label={featureName} color='primary' sx={{ mb: 2 }} />
            <Typography variant='body1' color='text.secondary'>
              {featureDescription ||
                `The ${featureName} feature requires an account. Sign up for free to unlock this and many other features!`}
            </Typography>
          </Box>

          <Divider />

          {/* Benefits List */}
          <Box>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              What You'll Get:
            </Typography>
            <List dense>
              {displayBenefits.map((benefit, index) => (
                <ListItem key={index} disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon color='success' fontSize='small' />
                  </ListItemIcon>
                  <ListItemText
                    primary={benefit}
                    primaryTypographyProps={{
                      variant: 'body2',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Call to Action */}
          <Box
            sx={{
              bgcolor: 'primary.50',
              p: 2,
              borderRadius: 1,
              textAlign: 'center',
            }}
          >
            <Typography variant='subtitle2' color='primary.main' gutterBottom>
              🎉 Sign up is free and takes less than 30 seconds!
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} variant='text' color='inherit'>
          Maybe Later
        </Button>
        <Button onClick={handleSignIn} variant='outlined' color='primary'>
          Sign In
        </Button>
        <Button onClick={handleSignUp} variant='contained' color='primary'>
          Sign Up Free
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default FeatureLockedModal
