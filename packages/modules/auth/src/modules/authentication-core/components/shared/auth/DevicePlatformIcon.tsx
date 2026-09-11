import React from 'react'
import { Avatar, alpha, useTheme } from '@mui/material'
import Apple from '@mui/icons-material/Apple'
import Android from '@mui/icons-material/Android'
import Laptop from '@mui/icons-material/Laptop'
import DesktopWindows from '@mui/icons-material/DesktopWindows'
import PhoneIphone from '@mui/icons-material/PhoneIphone'
import Terminal from '@mui/icons-material/Terminal'
import UsbOutlined from '@mui/icons-material/UsbOutlined'
import DevicesOther from '@mui/icons-material/DevicesOther'

export type DevicePlatform =
  | 'apple'
  | 'android'
  | 'windows'
  | 'linux'
  | 'mobile'
  | 'desktop'
  | 'security-key'
  | 'unknown'

const ICONS: Record<DevicePlatform, React.ReactElement> = {
  apple: <Apple />,
  android: <Android />,
  windows: <DesktopWindows />,
  linux: <Terminal />,
  mobile: <PhoneIphone />,
  desktop: <Laptop />,
  'security-key': <UsbOutlined />,
  unknown: <DevicesOther />,
}

/**
 * Best-effort platform classification from a user-agent or authenticator name.
 *
 * Sessions and passkeys both arrive as free-form strings from the backend
 * ("Chrome on macOS", "Windows Hello", "YubiKey 5"), and both screens were
 * about to grow their own copy of this mapping.
 */
export const resolveDevicePlatform = (source?: string | null): DevicePlatform => {
  const value = (source || '').toLowerCase()
  if (!value) return 'unknown'
  if (/\b(yubikey|security key|usb|nfc|fido)\b/.test(value)) return 'security-key'
  if (/\b(iphone|ipad|ios|macos|mac os|macintosh|darwin|apple|touch id|safari)\b/.test(value)) {
    return 'apple'
  }
  if (/android/.test(value)) return 'android'
  if (/\b(windows|win32|win64|windows hello|edge)\b/.test(value)) return 'windows'
  if (/\b(linux|ubuntu|debian|fedora|x11)\b/.test(value)) return 'linux'
  if (/\b(mobile|phone)\b/.test(value)) return 'mobile'
  return 'desktop'
}

export interface DevicePlatformIconProps {
  /** Raw user-agent, platform or authenticator name. */
  source?: string | null
  /** Overrides the classification when the caller already knows the platform. */
  platform?: DevicePlatform
  size?: number
  /** Highlights the badge, e.g. for the session the user is currently on. */
  active?: boolean
  /** Already-translated accessible label. */
  label?: string
}

const DevicePlatformIcon: React.FC<DevicePlatformIconProps> = ({
  source,
  platform,
  size = 44,
  active = false,
  label,
}) => {
  const theme = useTheme()
  const resolved = platform || resolveDevicePlatform(source)
  const color = active ? theme.palette.success.main : theme.palette.primary.main

  return (
    <Avatar
      aria-label={label}
      sx={{
        width: size,
        height: size,
        borderRadius: 'var(--sf-radius-lg, 12px)',
        bgcolor: alpha(color, 0.1),
        color,
        border: '1px solid',
        borderColor: alpha(color, 0.2),
      }}
    >
      {ICONS[resolved]}
    </Avatar>
  )
}

export default DevicePlatformIcon
