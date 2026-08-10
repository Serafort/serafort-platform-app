import React from 'react'
import type { ReactElement } from 'react'
import { RouteLayoutEnum, LayoutModeEnum, type SystemMode } from '@cap/shared-types'
import {
  useSettings,
  useAppStore,
  useStateHydration,
  type AppStore,
} from '@cap/platform-store'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useTheme } from '@mui/material/styles'
import useLayoutInit from '../hooks/useLayoutInit'

type LayoutWrapperProps = {
  systemMode: SystemMode
  verticalLayout: ReactElement
  horizontalLayout: ReactElement
  noLayout?: ReactElement
  publicLayout?: ReactElement
}

const LayoutWrapper = ({
  systemMode,
  verticalLayout,
  horizontalLayout,
  noLayout,
  publicLayout,
}: LayoutWrapperProps) => {
  const { settings } = useSettings()
  const { isHydrating } = useStateHydration()
  const theme = useTheme()

  // Use direct selectors for better performance
  const layoutOverride = useAppStore((state: AppStore) => state.layoutOverride)

  useLayoutInit(systemMode)

  const isNoLayout = layoutOverride === RouteLayoutEnum.NO_LAYOUT

  const isAdminLayout = React.useMemo(() => {
    if (layoutOverride === RouteLayoutEnum.ADMIN) return true
    if (layoutOverride === RouteLayoutEnum.PUBLIC) return false
    return false
  }, [layoutOverride])

  // While hydrating: render the actual layout tree invisibly behind a
  // transparent overlay. This prevents layout-shift / blink because the DOM
  // is already in its final state when we make it visible.
  // A centred spinner still floats on top so the user sees activity.
  if (isHydrating) {
    return (
      <Box sx={{ position: 'relative', minBlockSize: '100vh' }}>
        {/* Invisible pre-render of final layout — eliminates pop-in */}
        <Box sx={{ visibility: 'hidden', pointerEvents: 'none' }}>
          {isNoLayout
            ? (noLayout ?? null)
            : isAdminLayout
              ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: '1 1 auto',
                    backgroundColor: 'transparent',
                  }}
                  data-skin={settings.skin}
                >
                  {settings.layout === LayoutModeEnum.HORIZONTAL ? horizontalLayout : verticalLayout}
                </Box>
              )
              : (publicLayout ?? null)}
        </Box>

        {/* Centered spinner overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.background.default || 'inherit',
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    )
  }

  if (isNoLayout) return noLayout ?? null

  if (isAdminLayout)
    return (
      <>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            backgroundColor: 'transparent',
          }}
          data-skin={settings.skin}
        >
          {settings.layout === LayoutModeEnum.HORIZONTAL ? horizontalLayout : verticalLayout}
        </Box>
      </>
    )

  return publicLayout ?? null
}

export default LayoutWrapper
