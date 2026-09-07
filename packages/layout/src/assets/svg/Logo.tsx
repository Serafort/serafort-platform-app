import React from 'react'
import { useTheme } from '@mui/material/styles'

export type LogoVariant = 'icon' | 'lockup'

/**
 * Serafort logo, served from the brand kit assets in `app/public/brand/logo`.
 *
 * Two variants:
 *
 * - `icon` (default) - the standalone wing mark from the brand kit's `icons/`
 *   set. For narrow slots such as a collapsed nav drawer, and for anywhere the
 *   product name is already rendered as adjacent text.
 * - `lockup` - the mark plus wordmark from `logo-lockups/`. Its aspect ratio is
 *   roughly 5.5:1, so it only belongs in slots wide enough to carry it, such as
 *   an expanded nav drawer.
 *
 * Both are sized by height with `width: auto` so they stay proportionate in a
 * fixed-height row.
 */
const LOGO_SRC: Record<LogoVariant, Record<'light' | 'dark', string>> = {
  icon: {
    light: '/brand/logo/icon-color.svg',
    dark: '/brand/logo/icon-white.png',
  },
  lockup: {
    light: '/brand/logo/logo-horizontal-color.png',
    dark: '/brand/logo/logo-horizontal-white.png',
  },
}

export interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  variant?: LogoVariant
  /**
   * Force the white artwork. Needed by the `semiDark` sidebar, which renders
   * dark while `theme.palette.mode` is still `light`: the colour lockup's
   * wordmark is brand ink and would disappear against a navy ground.
   */
  onDark?: boolean
}

const Logo = ({ variant = 'icon', onDark, style, ...rest }: LogoProps) => {
  const theme = useTheme()
  const tone = (onDark ?? theme.palette.mode === 'dark') ? 'dark' : 'light'

  return (
    <img
      src={LOGO_SRC[variant][tone]}
      alt='Serafort'
      style={{
        height: '2rem',
        width: 'auto',
        objectFit: 'contain',
        // The lockup is wide - let it shrink inside a tight header rather than
        // overflow it. The icon is narrow enough to hold its size.
        ...(variant === 'lockup'
          ? { maxWidth: '100%', minWidth: 0, flexShrink: 1 }
          : { flexShrink: 0 }),
        ...style,
      }}
      {...rest}
    />
  )
}

export default Logo
