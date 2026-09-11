import React from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import Close from '@mui/icons-material/Close'
import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded'
import { useTranslation } from 'react-i18next'
import type { AuthTone } from './authTone'

export interface AuthConfirmDrawerProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  /** Already-translated heading. */
  title: React.ReactNode
  /** Already-translated explanation of what will happen. */
  description?: React.ReactNode
  /** Already-translated confirm button label. */
  confirmLabel: React.ReactNode
  /** Already-translated cancel label; defaults to the shared "Cancel". */
  cancelLabel?: React.ReactNode
  /** Drives the icon and the confirm button colour. */
  tone?: Extract<AuthTone, 'error' | 'warning' | 'primary'>
  loading?: boolean
  /** Detail rendered above the actions — the device being revoked, say. */
  children?: React.ReactNode
  id?: string
}

/**
 * Slide-over confirmation for a destructive account action.
 *
 * Preferred over a centred dialog for actions that act on a specific row: the
 * sheet slides in beside the list, so the item stays on screen and the user
 * can still see what they are about to revoke. The panel takes focus, is
 * labelled by its own heading, and closes on Escape via MUI's Drawer.
 */
const AuthConfirmDrawer: React.FC<AuthConfirmDrawerProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = 'error',
  loading = false,
  children,
  id,
}) => {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const color = theme.palette[tone].main
  const titleId = `${id || 'auth-confirm'}-title`

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={loading ? undefined : onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 420 },
            // Logical inset so the sheet enters from the inline-end edge in
            // both writing directions.
            borderStartStartRadius: { xs: 0, sm: '16px' },
            borderEndStartRadius: { xs: 0, sm: '16px' },
          },
        },
      }}
      aria-labelledby={titleId}
    >
      <Box id={id} sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 3 }}>
        <Stack direction='row' alignItems='flex-start' spacing={2} sx={{ mb: 2 }}>
          <Box
            aria-hidden
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              flexShrink: 0,
              borderRadius: 'var(--sf-radius-lg, 12px)',
              bgcolor: alpha(color, 0.12),
              color,
            }}
          >
            <WarningAmberRounded />
          </Box>
          <Box sx={{ flex: 1, minInlineSize: 0 }}>
            <Typography id={titleId} component='h2' variant='h6' sx={{ fontWeight: 800 }}>
              {title}
            </Typography>
            {description && (
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ mt: 0.5, fontWeight: 500, lineHeight: 1.6 }}
              >
                {description}
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={onClose}
            disabled={loading}
            aria-label={t('common.close', 'Close')}
            sx={{ width: 44, height: 44 }}
          >
            <Close />
          </IconButton>
        </Stack>

        {children && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ flex: 1, overflowY: 'auto' }}>{children}</Box>
          </>
        )}

        <Stack spacing={1.5} sx={{ mt: 'auto', pt: 3 }}>
          <Button
            fullWidth
            variant='contained'
            color={tone === 'primary' ? 'primary' : tone}
            onClick={onConfirm}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color='inherit' /> : undefined}
            sx={{ minHeight: 48, borderRadius: 'var(--sf-radius-lg, 12px)', fontWeight: 800, textTransform: 'none' }}
          >
            {confirmLabel}
          </Button>
          <Button
            fullWidth
            variant='text'
            onClick={onClose}
            disabled={loading}
            sx={{
              minHeight: 48,
              borderRadius: 'var(--sf-radius-lg, 12px)',
              fontWeight: 700,
              textTransform: 'none',
              color: 'text.secondary',
            }}
          >
            {cancelLabel || t('common.cancel', 'Cancel')}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  )
}

export default AuthConfirmDrawer
