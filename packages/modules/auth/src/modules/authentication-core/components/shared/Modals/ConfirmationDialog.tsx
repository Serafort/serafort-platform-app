import { Dialog, Button, Box, Typography, alpha, useTheme, CircularProgress } from '@mui/material'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import { useTranslation } from 'react-i18next'

interface ConfirmationDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  isSubmitting?: boolean
  severity?: 'info' | 'warning' | 'error'
}

const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  isSubmitting = false,
  severity = 'warning',
}: ConfirmationDialogProps) => {
  const { t } = useTranslation('common')
  const theme = useTheme()

  const getIcon = () => {
    switch (severity) {
      case 'info':
        return <InfoOutlined sx={{ fontSize: 32, color: theme.palette.info.main }} />
      case 'error':
        return <ErrorOutline sx={{ fontSize: 32, color: theme.palette.error.main }} />
      case 'warning':
      default:
        return <WarningAmberOutlined sx={{ fontSize: 32, color: theme.palette.warning.main }} />
    }
  }

  const getBgColor = () => {
    switch (severity) {
      case 'info':
        return alpha(theme.palette.info.main, 0.1)
      case 'error':
        return alpha(theme.palette.error.main, 0.1)
      case 'warning':
      default:
        return alpha(theme.palette.warning.main, 0.1)
    }
  }

  const getButtonColor = () => {
    return severity === 'error' ? 'error' : severity === 'info' ? 'info' : 'warning'
  }

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 2,
          maxWidth: 400,
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        },
      }}
    >
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: getBgColor(),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          {getIcon()}
        </Box>

        <Typography variant='h5' sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
          {title}
        </Typography>

        <Typography variant='body2' color='text.secondary' sx={{ mb: 4, lineHeight: 1.6 }}>
          {message}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          <Button
            fullWidth
            variant='contained'
            color={getButtonColor() as any}
            onClick={onConfirm}
            disabled={isSubmitting}
            sx={{
              py: 1.2,
              borderRadius: 2,
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              },
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color='inherit' />
            ) : (
              confirmLabel || t('auth.common.continue', 'Continue')
            )}
          </Button>
          <Button
            fullWidth
            variant='text'
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              py: 1.2,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              color: 'text.secondary',
            }}
          >
            {cancelLabel || t('auth.common.cancel', 'Cancel')}
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

export default ConfirmationDialog
