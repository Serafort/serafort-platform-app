import React, { useEffect, useRef, useMemo } from 'react'
import { Box, Grid, IconButton, Tooltip, Typography } from '@mui/material'
import Delete from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';
import { useAppStore } from '@cap/platform-store'
import { globalWidgetRegistry, useResizeObserver } from '@cap/platform-core'
import WidgetWrapper, { type DashboardMode } from './WidgetWrapper'
import type { GridLayout, SlotWidgetValue, SlotSizeConfig } from '@cap/shared-types'
import {
  getWidgetIdFromSlotValue,
  getSubLayoutFromSlotValue,
  isWidgetNode,
} from '@cap/shared-types'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'

export interface WidgetCanvasProps {
  pageId?: string
  layoutId?: string
  mode: DashboardMode
  defaultLayout?: GridLayout
}

export const CanvasDepthContext = React.createContext<number>(0)

// A simple droppable wrapper for empty slots
const EmptySlotDroppableInner: React.FC<{ slotId: string, layoutId: string, sizeConfig?: SlotSizeConfig, effectiveMode: DashboardMode }> = ({ slotId, layoutId, sizeConfig, effectiveMode }) => {
  const removePanel = useAppStore((state) => state.removePanel)
  const transferWidget = useAppStore((state) => state.transferWidget)
  const [isDragOverNative, setIsDragOverNative] = React.useState(false)

  const { setNodeRef, isOver } = useDroppable({
    id: `slot_${layoutId}_${slotId}`,
    data: {
      slotId,
      layoutId,
      isEmpty: true
    },
  })

  const isHighlighted = isOver || isDragOverNative

  const handleNativeDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
    if (!isDragOverNative) setIsDragOverNative(true)
  }

  const handleNativeDragLeave = () => {
    setIsDragOverNative(false)
  }

  const handleNativeDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOverNative(false)
    let widgetId = ''
    try {
      const jsonStr = e.dataTransfer.getData('application/json')
      if (jsonStr) {
        const data = JSON.parse(jsonStr)
        widgetId = data.widgetId
      }
    } catch {}
    if (!widgetId) {
      widgetId = e.dataTransfer.getData('text/plain')
    }
    if (widgetId) {
      if (import.meta.env.DEV) console.log('[Native DND Drop on Empty Slot]', { widgetId, layoutId, slotId })
      transferWidget('marketplace-catalog', `catalog-${widgetId}`, layoutId, slotId)
    }
  }

  if (isOver && import.meta.env.DEV) {
    console.log('[WidgetCanvas] Hovering over EmptySlotDroppable:', { layoutId, slotId })
  }

  return (
    <Grid
      ref={setNodeRef}
      onDragOver={handleNativeDragOver}
      onDragLeave={handleNativeDragLeave}
      onDrop={handleNativeDrop}
      sx={{
        gridColumn: `span ${Math.min(12, sizeConfig?.span || 4)}`,
        height: '100%',
        minHeight: sizeConfig?.height || 280,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          minHeight: sizeConfig?.height || 280,
          border: (theme) => `2px dashed ${isHighlighted ? theme.palette.primary.main : theme.palette.divider}`,
          bgcolor: isHighlighted ? 'action.hover' : 'transparent',
          borderRadius: 2.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isHighlighted ? (theme) => `0 0 16px ${theme.palette.primary.main}33` : 'none',
        }}
      >
        <Typography variant="caption" color={isHighlighted ? 'primary.main' : 'text.secondary'} fontWeight={600}>
          {isHighlighted ? 'Drop Widget Here' : `Empty Slot (${slotId})`}
        </Typography>
        {effectiveMode === 'custom' && (
          <Tooltip title="Remove Empty Panel Slot">
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                if (import.meta.env.DEV) console.log('[WidgetCanvas] Empty slot remove clicked:', { layoutId, slotId })
                removePanel(layoutId, slotId)
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Grid>
  )
}

const EmptySlotDroppable = React.memo(EmptySlotDroppableInner)

export const WidgetCanvas: React.FC<WidgetCanvasProps> = ({
  pageId,
  layoutId,
  mode,
  defaultLayout,
}) => {
  const depth = React.useContext(CanvasDepthContext)
  const effectiveLayoutId = layoutId || pageId || 'default'
  const layout = useAppStore((state) => state.layouts[effectiveLayoutId])
  const initializeLayout = useAppStore((state) => state.initializeLayout)
  const addPanel = useAppStore((state) => state.addPanel)
  const containerRef = useRef<HTMLDivElement>(null)
  const { containerSize } = useResizeObserver(containerRef)

  // Derive grid columns from measured canvas width, not viewport width.
  // This makes nested canvases (e.g. inside a drawer) self-adapting.
  const gridCols = useMemo(() => {
    if (containerSize === 'xs') return 'repeat(4, 1fr)'
    if (containerSize === 'sm') return 'repeat(6, 1fr)'
    return 'repeat(12, 1fr)'
  }, [containerSize])

  const defaultLayoutRef = useRef(defaultLayout)
  defaultLayoutRef.current = defaultLayout

  useEffect(() => {
    if (!layout && defaultLayoutRef.current) {
      initializeLayout(effectiveLayoutId, defaultLayoutRef.current)
    }
  }, [layout, effectiveLayoutId, initializeLayout])

  const uniqueSlots = useMemo(() => {
    if (!layout) return []
    return Array.from(new Set(layout.slots))
  }, [layout])

  const sortableItemIds = useMemo(() => {
    return uniqueSlots
      .filter((s: string) => {
        const val = layout.slotWidgets[s]
        const wId = getWidgetIdFromSlotValue(val)
        return !!wId && !!globalWidgetRegistry.get(wId)
      })
      .map((s: string) => `widget_${effectiveLayoutId}_${s}`)
  }, [uniqueSlots, layout, effectiveLayoutId])

  if (!layout) return null

  const effectiveMode = mode

  return (
    <CanvasDepthContext.Provider value={depth + 1}>
      <SortableContext items={sortableItemIds} strategy={rectSortingStrategy}>
        <Box
          ref={containerRef}
          sx={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: gridCols,
            gap: 2,
            gridAutoFlow: 'dense',
            alignItems: 'stretch',
            p: 0.5,
          }}
        >
          {uniqueSlots.map((slotId: string) => {
            const slotValue: SlotWidgetValue | undefined = layout.slotWidgets[slotId]
            const widgetId = getWidgetIdFromSlotValue(slotValue)
            const nodeSubLayout = getSubLayoutFromSlotValue(slotValue)
            const nodeSize = isWidgetNode(slotValue) ? slotValue.size : undefined
            const sizeConfig = nodeSize || (layout.slotSizes && layout.slotSizes[slotId])
            const descriptor = widgetId ? globalWidgetRegistry.get(widgetId) : undefined

            if (!widgetId || !descriptor) {
              return (
                <EmptySlotDroppable 
                  key={slotId} 
                  slotId={slotId} 
                  layoutId={effectiveLayoutId} 
                  sizeConfig={sizeConfig} 
                  effectiveMode={effectiveMode} 
                />
              )
            }

            const span = Math.min(12, sizeConfig?.span || 4)

            return (
              <Box
                key={slotId}
                sx={{
                  gridColumn: `span ${span}`,
                  height: '100%',
                  minHeight: sizeConfig?.height || 280,
                  maxHeight: sizeConfig?.height || 280,
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: 2.5,
                }}
              >
                <WidgetWrapper
                  key={`wrapper-${slotId}`}
                  pageId={effectiveLayoutId}
                  slotId={slotId}
                  widgetId={widgetId}
                  mode={effectiveMode}
                  defaultLayout={nodeSubLayout || defaultLayout}
                />
              </Box>
            )
          })}
          {effectiveMode === 'custom' && (
            <Box
              sx={{
                gridColumn: 'span 12',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <Box
                onClick={() => addPanel(effectiveLayoutId)}
                sx={{
                  p: 1.5,
                  border: (theme) => `1px dashed ${theme.palette.primary.main}`,
                  borderRadius: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  bgcolor: 'action.hover',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: 'action.selected',
                    borderColor: (theme) => theme.palette.primary.dark,
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                <Add fontSize="small" color="primary" />
                <Typography variant="body2" color="primary" fontWeight={600}>
                  Add Panel Slot
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </SortableContext>
    </CanvasDepthContext.Provider>
  )
}

export default WidgetCanvas
