import React from 'react'
import { useMedia } from 'react-use'
import { useColorScheme } from '@mui/material/styles'
import { useThemeSettings } from '../../../context/ThemeSettingsContext'

const ModeChanger = () => {
  const settings = useThemeSettings()
  const { setMode } = useColorScheme()
  const isDark = useMedia('(prefers-color-scheme: dark)', false)

  // Track previous values so we only act on *changes*, not the initial mount.
  // The initial class is already set by the inline <script> in index.html before
  // React hydrates, so firing setMode on mount would cause a redundant repaint.
  const prevModeRef = React.useRef<string | null>(null)
  const prevIsDarkRef = React.useRef<boolean | null>(null)
  const isMountedRef = React.useRef(false)

  React.useEffect(() => {
    const isFirstRun = !isMountedRef.current
    isMountedRef.current = true

    const modeUnchanged = prevModeRef.current === settings.mode
    const isDarkUnchanged = prevIsDarkRef.current === isDark

    // Skip the very first render — index.html already applied the correct class.
    // Also skip if neither relevant value changed.
    if (isFirstRun || (modeUnchanged && isDarkUnchanged)) {
      prevModeRef.current = settings.mode
      prevIsDarkRef.current = isDark
      return
    }

    prevModeRef.current = settings.mode
    prevIsDarkRef.current = isDark

    if (!settings.mode) return

    // Update MUI internal mode
    setMode(settings.mode as 'light' | 'dark' | 'system')

    const resolvedMode: 'light' | 'dark' =
      settings.mode === 'system'
        ? isDark
          ? 'dark'
          : 'light'
        : (settings.mode as 'light' | 'dark')

    // Swap color scheme class atomically to avoid intermediate repaints
    const html = document.documentElement
    if (!html.classList.contains(resolvedMode)) {
      html.classList.remove('light', 'dark')
      html.classList.add(resolvedMode)
    }

    document.body.style.colorScheme = resolvedMode
  }, [settings.mode, isDark, setMode])

  return null
}

export default ModeChanger
