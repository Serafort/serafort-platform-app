import React, { useEffect, useState, useCallback } from 'react'
import { Alert, Box, Container, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { WidgetCanvas, CustomModeFab } from '@cap/theme'
import { useLayoutEngineContext } from '@cap/platform-core'
import { useAppStore } from '@cap/platform-store'
import { useShallow } from 'zustand/shallow'
import { DEFAULT_DASHBOARD_GRID_LAYOUT } from '../widgets'
import { DndContext, DragEndEvent, pointerWithin, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { WidgetStudioPanel } from '@cap/module-widget-studio'

const DashboardScreen: React.FC = () => {
  const { t } = useTranslation()
  const { isCustomMode, toggleCustomMode } = useLayoutEngineContext()
  const { initializeLayout, transferWidget, moveWidget } = useAppStore(
    useShallow((state) => ({
      initializeLayout: state.initializeLayout,
      transferWidget: state.transferWidget,
      moveWidget: state.moveWidget,
    }))
  )
  const PAGE_ID = 'dashboard'

  const [activeWidgetInfo, setActiveWidgetInfo] = useState<{ id: string; widgetId?: string } | null>(null)

  useEffect(() => {
    initializeLayout(PAGE_ID, DEFAULT_DASHBOARD_GRID_LAYOUT)
  }, [initializeLayout])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current
    if (import.meta.env.DEV) {
      console.log('[DND] handleDragStart:', {
        id: event.active.id,
        data,
      })
    }
    setActiveWidgetInfo({
      id: event.active.id as string,
      widgetId: data?.widgetId,
    })
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveWidgetInfo(null)
    const { active, over } = event
    if (import.meta.env.DEV) {
      console.log('[DND] handleDragEnd:', {
        activeId: active?.id,
        activeData: active?.data?.current,
        overId: over?.id,
        overData: over?.data?.current,
      })
    }

    if (!over) {
      console.warn('[DND] Dropped outside any valid target')
      return
    }

    const activeData = active.data.current
    const overData = over.data.current

    if (activeData && overData) {
      const fromLayout = activeData.layoutId
      const fromSlot = activeData.slotId
      const toLayout = overData.layoutId
      const toSlot = overData.slotId

      if (import.meta.env.DEV) {
        console.log('[DND] Transfer Request:', { fromLayout, fromSlot, toLayout, toSlot })
      }

      if (fromLayout === toLayout) {
        if (fromSlot !== toSlot) {
          if (import.meta.env.DEV) console.log('[DND] Executing moveWidget within same layout:', fromLayout, fromSlot, '->', toSlot)
          moveWidget(fromLayout, fromSlot, toSlot)
        } else {
          if (import.meta.env.DEV) console.log('[DND] Same layout and same slot - no-op')
        }
      } else {
        if (import.meta.env.DEV) console.log('[DND] Executing transferWidget across layouts:', fromLayout, fromSlot, '->', toLayout, toSlot)
        transferWidget(fromLayout, fromSlot, toLayout, toSlot)
      }
    } else {
      console.warn('[DND] Missing activeData or overData:', { activeData, overData })
    }
  }, [moveWidget, transferWidget])

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4">{t('dashboard.title')}</Typography>
          <Typography variant="body1" color="text.secondary">
            {t('dashboard.subtitle')}
          </Typography>
        </Box>

        {isCustomMode && (
          <Alert severity="info" sx={{ mb: 3 }}>
            {t('dashboard.customModeHint')}
          </Alert>
        )}

        <WidgetCanvas pageId={PAGE_ID} mode={isCustomMode ? 'custom' : 'classic'} defaultLayout={DEFAULT_DASHBOARD_GRID_LAYOUT} />

        <CustomModeFab customMode={isCustomMode} onToggle={toggleCustomMode} />

        {/* AI Widget Studio Panel — right-side drawer */}
        <WidgetStudioPanel />
      </Container>
      <DragOverlay>
        {activeWidgetInfo ? (
          <Box
            sx={{
              p: 1.5,
              px: 2.5,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 6,
              border: (theme) => `2px solid ${theme.palette.primary.main}`,
              opacity: 0.9,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'grabbing',
            }}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              {activeWidgetInfo.widgetId || 'Widget'}
            </Typography>
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default DashboardScreen
