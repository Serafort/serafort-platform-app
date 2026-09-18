import React from 'react'
import { Avatar, alpha, useTheme, type Theme } from '@mui/material'
import { isAuthTone, resolveToneColor, type AuthTone } from './authTone'

interface AuthScreenIconProps {
  icon: React.ReactNode
  /** Semantic tone. Prefer this over `color`. */
  tone?: AuthTone
  /**
   * Legacy escape hatch kept for existing call sites: accepts either a palette
   * path such as `success.main` or a resolved colour string.
   */
  color?: string
  size?: number
  /** Fills the badge with a tinted wash instead of leaving it transparent. */
  filled?: boolean
}

/**
 * Resolves a `palette.path` string (e.g. `success.main`) against the theme.
 *
 * The previous implementation checked `color.includes('.')` and then always
 * fell back to `palette.primary.main`, so every screen that asked for a
 * success or error badge silently got a primary-coloured border around a
 * correctly coloured glyph.
 */
const resolvePaletteColor = (theme: Theme, color: string): string => {
  if (!color.includes('.')) return color
  const [channel, shade] = color.split('.')
  const paletteChannel = (theme.palette as unknown as Record<string, Record<string, string>>)[
    channel
  ]
  return paletteChannel?.[shade] || theme.palette.primary.main
}

const AuthScreenIcon: React.FC<AuthScreenIconProps> = ({
  icon,
  tone,
  color = 'primary.main',
  size = 56,
  filled = false,
}) => {
  const theme = useTheme()
  const resolved =
    tone && isAuthTone(tone) ? resolveToneColor(theme, tone) : resolvePaletteColor(theme, color)

  return (
    <Avatar
      variant='square'
      sx={{
        width: size,
        height: size,
        bgcolor: filled ? alpha(resolved, 0.12) : 'transparent',
        color: resolved,
        borderRadius: `${Math.round(size * 0.43)}px`,
        border: '2px solid',
        borderColor: alpha(resolved, 0.2),
      }}
    >
      {icon}
    </Avatar>
  )
}

export default AuthScreenIcon
