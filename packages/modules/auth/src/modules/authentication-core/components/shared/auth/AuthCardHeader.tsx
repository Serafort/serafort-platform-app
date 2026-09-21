import React from 'react'
import { Box, Typography } from '@mui/material'
import AuthScreenIcon from './AuthScreenIcon'
import type { AuthTone } from './authTone'

export interface AuthCardHeaderProps {
  icon?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  tone?: AuthTone
  /** Tints the heading itself with the tone. Used by outcome screens. */
  toneTitle?: boolean
  align?: 'center' | 'start'
  /** Slot rendered between the subtitle and the card body (chips, badges, …). */
  children?: React.ReactNode
  iconSize?: number
  /** Heading level for the visible title. Defaults to `h1` — auth screens are standalone pages. */
  component?: React.ElementType
  id?: string
}

/**
 * Icon + title + subtitle block that opens every auth card.
 *
 * This markup was duplicated verbatim across a dozen screens, each drifting on
 * icon size, heading variant, spacing and colour. Centralising it fixes the
 * visual hierarchy in one place and lets outcome screens tint the heading by
 * tone without re-implementing the block.
 */
const AuthCardHeader: React.FC<AuthCardHeaderProps> = ({
  icon,
  title,
  subtitle,
  tone = 'primary',
  toneTitle = false,
  align = 'center',
  children,
  iconSize = 56,
  component = 'h1',
  id,
}) => (
  <Box sx={{ mb: 3.5, textAlign: align === 'center' ? 'center' : 'start' }}>
    {icon && (
      <Box
        sx={{
          display: 'flex',
          justifyContent: align === 'center' ? 'center' : 'flex-start',
          mb: 2.5,
        }}
      >
        <AuthScreenIcon icon={icon} tone={tone} size={iconSize} filled />
      </Box>
    )}
    <Typography
      id={id}
      component={component}
      variant='h4'
      sx={{
        fontFamily: 'var(--sf-font-display, inherit)',
        fontWeight: 700,
        mb: subtitle ? 1 : 0,
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
        textWrap: 'balance',
        fontSize: { xs: 'var(--sf-text-xl, 1.4375rem)', sm: 'var(--sf-text-2xl, 1.875rem)' },
        ...(toneTitle ? { color: `${tone}.main` } : {}),
      }}
    >
      {title}
    </Typography>
    {subtitle && (
      <Typography
        variant='body1'
        color='text.secondary'
        sx={{ fontSize: 'var(--sf-text-md, 0.9375rem)', lineHeight: 1.6 }}
      >
        {subtitle}
      </Typography>
    )}
    {children}
  </Box>
)

export default AuthCardHeader
