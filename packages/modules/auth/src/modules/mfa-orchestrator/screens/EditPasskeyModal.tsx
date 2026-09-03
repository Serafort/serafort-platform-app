import { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormGroup,
  FormControlLabel,
  Divider,
  Chip,
  alpha,
} from '@mui/material'
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import Devices from '@mui/icons-material/Devices';
import Schedule from '@mui/icons-material/Schedule';
import { useTranslation } from 'react-i18next'

interface EditPasskeyModalProps {
  open: boolean
  onClose: () => void
  passkey?: {
    id: string
    name: string
    device: string
    browser: string
    createdAt: string
    lastUsed: string
  }
}

export default function EditPasskeyModal({
  open,
  onClose,
  passkey = {
    id: '1',
    name: 'MacBook Pro - Chrome',
    device: 'macOS 14.2',
    browser: 'Chrome 120',
    createdAt: 'Dec 15, 2023',
    lastUsed: '2 hours ago',
  },
}: EditPasskeyModalProps) {
  const { t } = useTranslation()
  const [name, setName] = useState(passkey.name)
  const [autoUse, setAutoUse] = useState(true)
  const [requireBiometric, setRequireBiometric] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth='sm'
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            fontWeight: 700,
            pb: 1,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Edit sx={{ fontSize: 18, color: 'primary.main' }} />
          </Box>
          {t('auth.passkey.edit_passkey', 'Edit Passkey')}
        </DialogTitle>
        <DialogContent>
          {/* Name */}
          <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 1, mt: 1 }}>
            {t('auth.passkey.passkey_name', 'Passkey Name')}
          </Typography>
          <TextField
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g., Work Laptop'
            sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          {/* Device Info */}
          <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 1 }}>
            {t('auth.passkey.device_info', 'Device Information')}
          </Typography>
          <Box
            sx={{
              bgcolor: 'action.hover',
              borderRadius: 2,
              p: 2,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Devices sx={{ color: 'text.secondary', fontSize: 24 }} />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                <Chip
                  label={passkey.device}
                  size='small'
                  variant='outlined'
                  sx={{ borderRadius: 1, height: 22, fontSize: '0.7rem' }}
                />
                <Chip
                  label={passkey.browser}
                  size='small'
                  variant='outlined'
                  sx={{ borderRadius: 1, height: 22, fontSize: '0.7rem' }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography
                  variant='caption'
                  color='text.disabled'
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}
                >
                  <Schedule sx={{ fontSize: 11 }} /> Created {passkey.createdAt}
                </Typography>
                <Typography variant='caption' color='text.disabled'>
                  Last used {passkey.lastUsed}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Settings */}
          <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 1 }}>
            {t('auth.passkey.settings', 'Settings')}
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={autoUse}
                  onChange={(e) => setAutoUse(e.target.checked)}
                  size='small'
                />
              }
              label={
                <Typography variant='body2' fontWeight={500}>
                  Auto-suggest on this device
                </Typography>
              }
              sx={{ mb: 1 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={requireBiometric}
                  onChange={(e) => setRequireBiometric(e.target.checked)}
                  size='small'
                />
              }
              label={
                <Typography variant='body2' fontWeight={500}>
                  Always require biometric verification
                </Typography>
              }
            />
          </FormGroup>

          <Divider sx={{ my: 2 }} />

          {/* Danger Zone */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant='subtitle2' fontWeight={600} color='error.main'>
                {t('auth.passkey.remove_passkey', 'Remove Passkey')}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                This action cannot be undone.
              </Typography>
            </Box>
            <Button
              color='error'
              variant='outlined'
              size='small'
              startIcon={<Delete />}
              onClick={() => setShowDeleteConfirm(true)}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
            >
              {t('common.remove', 'Remove')}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600 }}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            variant='contained'
            disabled={!name.trim()}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            {t('common.save', 'Save Changes')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        maxWidth='xs'
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {t('auth.passkey.confirm_remove', 'Remove Passkey?')}
        </DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary'>
            {t(
              'auth.passkey.remove_warning',
              'This will permanently remove this passkey. You will need to create a new one to use passkey authentication from this device.',
            )}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setShowDeleteConfirm(false)}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            color='error'
            variant='contained'
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            {t('auth.passkey.confirm_remove_btn', 'Yes, Remove')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
