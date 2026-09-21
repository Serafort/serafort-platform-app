import React from 'react'
import { Typography } from '@mui/material'

interface AuthInputLabelProps {
  children: React.ReactNode
  required?: boolean
  htmlFor?: string
}

/**
 * Field label per the brand-kit input anatomy (`uikit.html#inputs`): sits above
 * the field, 13px / 600, sentence case, primary text colour. It used to be a
 * tiny uppercase tertiary caption, which read as a section eyebrow rather than
 * the name of the control below it.
 */
const AuthInputLabel: React.FC<AuthInputLabelProps> = ({ children, required, htmlFor }) => {
  return (
    <Typography
      component='label'
      htmlFor={htmlFor}
      variant='caption'
      sx={{
        fontWeight: 600,
        fontSize: 'var(--sf-text-sm, 0.8125rem)',
        marginBlockEnd: 'var(--sf-space-2, 8px)',
        display: 'block',
        color: 'text.primary',
        lineHeight: 1.4,
      }}
    >
      {children}
      {required && (
        <Typography
          component='span'
          aria-hidden
          sx={{
            color: (theme) => `var(--sf-error-text, ${theme.palette.error.dark})`,
            marginInlineStart: 0.5,
          }}
        >
          *
        </Typography>
      )}
    </Typography>
  )
}

export default AuthInputLabel
