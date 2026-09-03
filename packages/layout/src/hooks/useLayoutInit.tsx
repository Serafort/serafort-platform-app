import { useEffect } from 'react'
import { useColorScheme } from '@mui/material/styles'
import { useCookie, useMedia } from 'react-use'
import type { SystemMode } from '@cap/shared-types'
import { useSettings } from '@cap/platform-store'

const useLayoutInit = (colorSchemeFallback: SystemMode) => {
  const { settings } = useSettings()
  const { setMode } = useColorScheme()
  const [, updateCookieColorPref] = useCookie('colorPref')
  const isDark = useMedia('(prefers-color-scheme: dark)', colorSchemeFallback === 'dark')

  useEffect(() => {
    const requestedMode = settings.mode || colorSchemeFallback
    const appMode = requestedMode === 'system' ? (isDark ? 'dark' : 'light') : requestedMode

    updateCookieColorPref(appMode)

    if (typeof setMode === 'function') {
      setMode(requestedMode as 'light' | 'dark' | 'system')
    }

    const html = document.documentElement
    html.classList.remove('light', 'dark')
    html.classList.add(appMode)
    html.style.colorScheme = appMode
    document.body.style.colorScheme = appMode
  }, [colorSchemeFallback, isDark, setMode, settings.mode, updateCookieColorPref])
}

export default useLayoutInit
