import React from 'react'
import { TextField, type TextFieldProps, alpha } from '@mui/material'

export type AuthTextFieldProps = TextFieldProps

/**
 * The auth funnel's text input.
 *
 * Every screen re-declared the same outlined-input overrides (48px min height,
 * 12px radius, paper background, focus ring) with small differences in radius
 * and background, so fields looked subtly different between sign-in, reset and
 * the passwordless flow. The 48px floor is the Fitts's Law target size the
 * design mandate requires; it lives here so no screen can undercut it.
 */
const AuthTextField: React.FC<AuthTextFieldProps> = ({ sx, ...props }) => (
  <TextField
    fullWidth
    {...props}
    sx={{
      '& .MuiOutlinedInput-root': {
        minHeight: 48,
        borderRadius: 'var(--sf-radius-lg, 12px)',
        bgcolor: 'background.paper',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        '& fieldset': { borderColor: 'divider' },
        '&:hover fieldset': { borderColor: 'primary.main' },
        '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '1px' },
        '&.Mui-focused': {
          boxShadow: (theme) => `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
        },
        '&.Mui-error.Mui-focused': {
          boxShadow: (theme) => `0 0 0 3px ${alpha(theme.palette.error.main, 0.2)}`,
        },
      },
      ...sx,
    }}
  />
)

export default AuthTextField
