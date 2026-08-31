import React, { useEffect } from 'react'
import { WidgetCanvas, CustomModeFab } from '@cap/theme'
import { useLayoutEngineContext } from '@cap/platform-core'
import { useAppStore } from '@cap/platform-store'
import { DEFAULT_LANDING_GRID_LAYOUT } from '../widgets'

export default function Home() {
  const { isCustomMode, toggleCustomMode } = useLayoutEngineContext()
  const initializeLayout = useAppStore((state) => state.initializeLayout)
  const PAGE_ID = 'landing'

  useEffect(() => {
    initializeLayout(PAGE_ID, DEFAULT_LANDING_GRID_LAYOUT)
  }, [initializeLayout])

  return (
    <>
      <WidgetCanvas
        pageId={PAGE_ID}
        mode={isCustomMode ? 'custom' : 'classic'}
        defaultLayout={DEFAULT_LANDING_GRID_LAYOUT}
      />
      <CustomModeFab customMode={isCustomMode} onToggle={toggleCustomMode} />
    </>
  )
}

