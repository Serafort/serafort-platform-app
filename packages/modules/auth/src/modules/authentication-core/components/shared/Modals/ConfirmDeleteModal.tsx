
import { Dialog, Button, Box, Typography } from '@mui/material';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import { useTranslation } from 'react-i18next';

interface ConfirmDeleteModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  confirmLabel?: string
  isSubmitting?: boolean
}

const ConfirmDeleteModal = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  isSubmitting,
}: ConfirmDeleteModalProps) => {
  const { t } = useTranslation('auth')

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: '#1a1a2e',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundImage: 'none',
          maxWidth: 400,
        },
      }}
    >
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(244, 67, 54, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <ErrorOutline sx={{ fontSize: 32, color: '#f44336' }} />
        </Box>

        <Typography variant='h5' sx={{ fontWeight: 700, mb: 1 }}>
          {title || t('common.confirm_deletion', 'Confirm Deletion')}
        </Typography>

        <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 4 }}>
          {message ||
            t(
              'common.delete_warning',
              'Are you sure? This action is permanent and cannot be undone.',
            )}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          <Button
            fullWidth
            variant='contained'
            color='error'
            onClick={onConfirm}
            disabled={isSubmitting}
            sx={{
              py: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(45deg, #f44336 30%, #ff5252 90%)',
              boxShadow: '0 4px 14px 0 rgba(244, 67, 54, 0.39)',
              fontWeight: 600,
            }}
          >
            {isSubmitting
              ? t('common.deleting', 'Deleting...')
              : confirmLabel || t('common.delete', 'Delete Permanently')}
          </Button>
          <Button
            fullWidth
            variant='text'
            onClick={onClose}
            sx={{ color: 'rgba(255, 255, 255, 0.5)', '&:hover': { color: 'white' } }}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

export default ConfirmDeleteModal
