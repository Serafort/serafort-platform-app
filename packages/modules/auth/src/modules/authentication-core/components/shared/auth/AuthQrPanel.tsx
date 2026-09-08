import React from 'react'
import { Box, Skeleton } from '@mui/material'
import QrCode2 from '@mui/icons-material/QrCode2'

export interface AuthQrPanelProps {
  /** Data URL of the QR image. When absent, a placeholder is shown. */
  src?: string
  /** Already-translated alt text. */
  alt: string
  size?: number
  loading?: boolean
}

/**
 * High-contrast canvas for a scannable QR code.
 *
 * The panel is deliberately white and the code deliberately dark in *both*
 * themes. QR decoding depends on the light-module / dark-module contrast the
 * spec assumes, and inverting it for dark mode makes many phone cameras fail
 * to lock on. So this is the one surface in the auth funnel that does not
 * follow the palette — it uses `common.white` rather than a page-background
 * token, and says so here so it does not read as an oversight.
 */
const AuthQrPanel: React.FC<AuthQrPanelProps> = ({ src, alt, size = 200, loading = false }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 3,
      mb: 3,
      borderRadius: '20px',
      bgcolor: 'common.white',
      border: '1px solid',
      borderColor: 'divider',
      boxShadow: (theme) => theme.shadows[2],
    }}
  >
    {loading ? (
      <Skeleton variant='rounded' width={size} height={size} />
    ) : src ? (
      <Box
        component='img'
        src={src}
        alt={alt}
        sx={{ width: size, height: size, borderRadius: '8px', display: 'block' }}
      />
    ) : (
      <QrCode2 aria-label={alt} sx={{ fontSize: size * 0.4, color: 'grey.400' }} />
    )}
  </Box>
)

export default AuthQrPanel
