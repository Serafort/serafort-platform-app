import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Box, IconButton, Tooltip, Typography, alpha, useTheme } from '@mui/material'
import ContentCopy from '@mui/icons-material/ContentCopy'
import Check from '@mui/icons-material/Check'
import { useTranslation } from 'react-i18next'

export interface AuthCopyFieldProps {
  /** The value shown and copied. */
  value: string
  /** Already-translated field label. */
  label?: React.ReactNode
  /** Renders the value in a monospace face. Secrets and codes should. */
  monospace?: boolean
  /** Accessible name for the copy button, already translated. */
  copyLabel?: string
  id?: string
}

const COPIED_RESET_MS = 2000

/**
 * A read-only secret with a one-click copy affordance.
 *
 * Copying a TOTP secret, a recovery code or an API token is the same
 * interaction everywhere, and every screen was re-implementing the value box,
 * the icon swap and the "copied" timeout — including the timeout leak that
 * fires `setState` after unmount.
 */
const AuthCopyField: React.FC<AuthCopyFieldProps> = ({
  value,
  label,
  monospace = true,
  copyLabel,
  id,
}) => {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Clipboard access can be denied; the value stays selectable by hand.
      return
    }
    setCopied(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), COPIED_RESET_MS)
  }, [value])

  const resolvedCopyLabel = copyLabel || t('common.copy', 'Copy')

  return (
    <Box
      id={id}
      sx={{
        p: 2,
        borderRadius: 'var(--sf-radius-lg, 12px)',
        bgcolor: alpha(theme.palette.action.selected, 0.05),
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {label && (
        <Typography
          variant='caption'
          sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.5 }}
        >
          {label}
        </Typography>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography
          component='code'
          variant='body2'
          // Attribute, not a CSS `direction` declaration: stylis-plugin-rtl
          // rewrites the CSS value, which would reverse a secret under Arabic.
          dir='ltr'
          sx={{
            flex: 1,
            minInlineSize: 0,
            fontFamily: monospace ? 'monospace' : undefined,
            fontWeight: 700,
            letterSpacing: monospace ? '2px' : undefined,
            wordBreak: 'break-all',
            textAlign: 'start',
          }}
        >
          {value}
        </Typography>
        <Tooltip title={copied ? t('common.copied', 'Copied!') : resolvedCopyLabel}>
          <IconButton
            onClick={handleCopy}
            aria-label={resolvedCopyLabel}
            sx={{ width: 44, height: 44, flexShrink: 0 }}
          >
            {copied ? <Check color='success' fontSize='small' /> : <ContentCopy fontSize='small' />}
          </IconButton>
        </Tooltip>
      </Box>
      {/* Announced separately so the confirmation is not conveyed by icon alone. */}
      <Box
        role='status'
        aria-live='polite'
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
        }}
      >
        {copied ? t('common.copied', 'Copied!') : ''}
      </Box>
    </Box>
  )
}

export default AuthCopyField
