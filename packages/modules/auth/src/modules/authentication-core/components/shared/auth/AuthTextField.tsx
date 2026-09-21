import React from 'react'
import { TextField, type TextFieldProps } from '@mui/material'

export type AuthTextFieldProps = TextFieldProps

/**
 * The auth funnel's text input, per `uikit.html#inputs`.
 *
 * 48px floor (Fitts's Law), `--sf-radius-md` corners, `--sf-field-bg` ground,
 * hairline border that turns brand-blue on hover/focus, and the brand glow
 * ring (`--sf-shadow-glow`) on focus. Error focus swaps the ring to the error
 * scale. Declared once so no screen can undercut the target size or drift on
 * radius/ring; a screen only passes `sx` for layout.
 */
const AuthTextField: React.FC<AuthTextFieldProps> = ({ sx, ...props }) => (
  <TextField
    fullWidth
    {...props}
    sx={{
      '& .MuiOutlinedInput-root': {
        minHeight: 48,
        borderRadius: 'var(--sf-radius-md, 8px)',
        bgcolor: (theme) => `var(--sf-field-bg, ${theme.palette.background.paper})`,
        fontSize: 'var(--sf-text-base, 0.875rem)',
        transition:
          'box-shadow var(--sf-duration-base, 180ms) var(--sf-ease-standard, ease), border-color var(--sf-duration-base, 180ms) var(--sf-ease-standard, ease)',
        '& fieldset': { borderColor: 'divider' },
        '&:hover fieldset': { borderColor: 'primary.main' },
        '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '1px' },
        '&.Mui-focused': {
          boxShadow: 'var(--sf-shadow-glow, 0 0 0 3px rgba(6, 203, 253, 0.18))',
        },
        '&.Mui-error fieldset': { borderColor: 'error.main' },
        '&.Mui-error.Mui-focused': {
          boxShadow: (theme) => `0 0 0 3px ${theme.palette.error.main}26`,
        },
        '&.Mui-disabled': {
          bgcolor: (theme) => `var(--sf-surface-sunken, ${theme.palette.action.disabledBackground})`,
        },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      },
      '& .MuiFormHelperText-root': {
        marginInline: 0,
        marginBlockStart: 'var(--sf-space-1, 4px)',
        fontSize: 'var(--sf-text-xs, 0.75rem)',
      },
      '& .MuiFormHelperText-root.Mui-error': {
        color: (theme) => `var(--sf-error-text, ${theme.palette.error.dark})`,
      },
      ...sx,
    }}
  />
)

export default AuthTextField
