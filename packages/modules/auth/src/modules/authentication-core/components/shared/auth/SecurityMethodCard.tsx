import React from 'react'
import { Box, Stack, Typography, alpha, useTheme } from '@mui/material'
import type { AuthTone } from './authTone'

export interface SecurityMethodCardProps {
  icon: React.ReactNode
  /** Already-translated method name, e.g. "Authenticator app". */
  title: React.ReactNode
  /** Already-translated one-line explanation. */
  description?: React.ReactNode
  /** Status chip / switch rendered in the header's trailing corner. */
  status?: React.ReactNode
  /** Actions rendered along the card's bottom edge. */
  actions?: React.ReactNode
  /** Extra content between the description and the actions. */
  children?: React.ReactNode
  /** Tints the icon badge and the enabled border. */
  tone?: AuthTone
  /** Draws the tone-coloured border, marking the method as active. */
  enabled?: boolean
  id?: string
}

/**
 * One security method in a management grid — authenticator app, SMS, passkey,
 * recovery codes, a registered device.
 *
 * The MFA and passkey consoles both list heterogeneous methods with the same
 * anatomy (badge, name, explanation, state, actions). Giving them one card
 * keeps "enabled" looking identical across both screens, and keeps the state
 * from being carried by colour alone — the `status` slot always holds a
 * labelled chip or switch, never just a tint.
 */
const SecurityMethodCard: React.FC<SecurityMethodCardProps> = ({
  icon,
  title,
  description,
  status,
  actions,
  children,
  tone = 'primary',
  enabled = false,
  id,
}) => {
  const theme = useTheme()
  const color = theme.palette[tone].main

  return (
    <Box
      id={id}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        p: 2.5,
        borderRadius: 'var(--sf-radius-lg, 12px)',
        bgcolor: enabled ? alpha(color, 0.04) : 'background.paper',
        border: '1px solid',
        borderColor: enabled ? alpha(color, 0.28) : 'divider',
        transition: 'border-color 0.2s ease, background-color 0.2s ease',
      }}
    >
      <Stack direction='row' spacing={2} alignItems='flex-start'>
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
            bgcolor: alpha(color, 0.1),
            color,
          }}
        >
          {icon}
        </Box>

        <Box sx={{ flex: 1, minInlineSize: 0 }}>
          <Typography variant='subtitle1' sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            {title}
          </Typography>
          {description && (
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ mt: 0.25, fontWeight: 500, lineHeight: 1.5 }}
            >
              {description}
            </Typography>
          )}
        </Box>

        {status && <Box sx={{ flexShrink: 0 }}>{status}</Box>}
      </Stack>

      {children && <Box sx={{ mt: 2 }}>{children}</Box>}

      {actions && (
        <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap sx={{ mt: 'auto', pt: 2 }}>
          {actions}
        </Stack>
      )}
    </Box>
  )
}

export default SecurityMethodCard
