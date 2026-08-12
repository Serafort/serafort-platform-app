import React, { useState, useCallback, useRef } from 'react'
import {
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Skeleton,
} from '@mui/material'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Crop,
  Delete,
  DeleteOutline,
  DragIndicator,
  DriveFileMove,
  MoreVert,
  RestartAlt,
  Settings,
  ViewColumn,
} from '@mui/icons-material'
import { widgetInspectorStore } from '../../store/widgetInspectorStore'
import { useTranslation } from 'react-i18next'
import { globalWidgetRegistry, useResizeObserver, ContainerSizeProvider } from '@cap/platform-core'
import { useAppStore, DEFAULT_SLOT_SIZE } from '@cap/platform-store'
import { useShallow } from 'zustand/shallow'
import type {
  SlotId,
  WidgetId,
  WidgetSpan,
  WidgetHeight,
  GridLayout,
} from '@cap/shared-types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export type DashboardMode = 'classic' | 'custom'

export interface WidgetWrapperProps {
  pageId: string
  slotId: SlotId
  widgetId: WidgetId
  mode: DashboardMode
  defaultLayout?: GridLayout
  onReset?: () => void
}

const EMPTY_SLOTS: string[] = []

const WidgetWrapperInner: React.FC<WidgetWrapperProps> = ({
  pageId,
  slotId,
  widgetId,
  mode,
  defaultLayout,
  onReset,
}) => {
  const { t } = useTranslation()
  const slots = useAppStore((state) => state.layouts[pageId]?.slots || EMPTY_SLOTS)
  const slotSize = useAppStore(
    (state) => state.layouts[pageId]?.slotSizes?.[slotId] || DEFAULT_SLOT_SIZE,
  )

  // Narrow selector: only extract layout IDs (not the full layouts object)
  // to avoid re-renders when layout *contents* change in other canvases.
  // useShallow ensures array reference equality when the keys remain the same.
  const availableLayouts = useAppStore(
    useShallow((state) => Object.keys(state.layouts || {}).filter((id) => id !== pageId))
  )

  // Consolidate all action selectors into a single subscription
  const actions = useAppStore(useShallow((state) => ({
    moveWidgetBy: state.moveWidgetBy,
    resizeWidgetSpan: state.resizeWidgetSpan,
    resizeWidgetHeight: state.resizeWidgetHeight,
    resetLayout: state.resetLayout,
    transferWidget: state.transferWidget,
    removeWidget: state.removeWidget,
    removePanel: state.removePanel,
  })))

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `widget_${pageId}_${slotId}`,
    data: {
      layoutId: pageId,
      slotId: slotId,
      widgetId: widgetId,
    },
    disabled: mode !== 'custom',
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 'auto',
  }

  const descriptor = globalWidgetRegistry.get(widgetId)
  if (!descriptor) return null

  const WidgetComponent = descriptor.Component
  const slotIndex = slots.indexOf(slotId)
  const isFirst = slotIndex <= 0
  const isLast = slotIndex >= slots.length - 1

  const closeMenu = useCallback(() => setMenuAnchor(null), [])

  const handleMoveLeft = useCallback(() => {
    if (import.meta.env.DEV) console.log('[WidgetWrapper] Menu MoveLeft:', { pageId, slotId })
    actions.moveWidgetBy(pageId, slotId, -1)
    setMenuAnchor(null)
  }, [actions, pageId, slotId])

  const handleMoveRight = useCallback(() => {
    if (import.meta.env.DEV) console.log('[WidgetWrapper] Menu MoveRight:', { pageId, slotId })
    actions.moveWidgetBy(pageId, slotId, 1)
    setMenuAnchor(null)
  }, [actions, pageId, slotId])

  const handleResizeSpan = useCallback((span: WidgetSpan) => {
    if (import.meta.env.DEV) console.log('[WidgetWrapper] Menu ResizeSpan:', { pageId, slotId, span })
    actions.resizeWidgetSpan(pageId, slotId, span)
    setMenuAnchor(null)
  }, [actions, pageId, slotId])

  const handleResizeHeight = useCallback((height: WidgetHeight) => {
    if (import.meta.env.DEV) console.log('[WidgetWrapper] Menu ResizeHeight:', { pageId, slotId, height })
    actions.resizeWidgetHeight(pageId, slotId, height)
    setMenuAnchor(null)
  }, [actions, pageId, slotId])

  const handleReset = useCallback(() => {
    if (import.meta.env.DEV) console.log('[WidgetWrapper] Menu Reset:', { pageId, slotId })
    if (onReset) {
      onReset()
    } else if (defaultLayout) {
      actions.resetLayout(pageId, defaultLayout)
    }
    setMenuAnchor(null)
  }, [actions, pageId, slotId, onReset, defaultLayout])

  const handleTransfer = useCallback((targetLayoutId: string, targetSlotId: string) => {
    if (import.meta.env.DEV) console.log('[WidgetWrapper] Menu Transfer:', { pageId, slotId, targetLayoutId, targetSlotId })
    actions.transferWidget(pageId, slotId, targetLayoutId, targetSlotId)
    setMenuAnchor(null)
  }, [actions, pageId, slotId])

  const handleRemoveWidget = useCallback(() => {
    if (import.meta.env.DEV) console.log('[WidgetWrapper] Menu RemoveWidget:', { pageId, slotId })
    actions.removeWidget(pageId, slotId)
    setMenuAnchor(null)
  }, [actions, pageId, slotId])

  const handleRemovePanel = useCallback(() => {
    if (import.meta.env.DEV) console.log('[WidgetWrapper] Menu RemovePanel:', { pageId, slotId })
    actions.removePanel(pageId, slotId)
    setMenuAnchor(null)
  }, [actions, pageId, slotId])

  const handleNativeDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleNativeDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    let dropWidgetId = ''
    try {
      const jsonStr = e.dataTransfer.getData('application/json')
      if (jsonStr) {
        const data = JSON.parse(jsonStr)
        dropWidgetId = data.widgetId
      }
    } catch {}
    if (!dropWidgetId) {
      dropWidgetId = e.dataTransfer.getData('text/plain')
    }
    if (dropWidgetId) {
      if (import.meta.env.DEV) console.log('[Native DND Drop on WidgetWrapper]', { dropWidgetId, pageId, slotId })
      actions.transferWidget('marketplace-catalog', `catalog-${dropWidgetId}`, pageId, slotId)
    }
  }

  const containerRef = useRef<HTMLDivElement | null>(null)
  const { width: containerWidth } = useResizeObserver(containerRef)

  const handleCombinedRef = useCallback((node: HTMLDivElement | null) => {
    setNodeRef(node)
    containerRef.current = node
  }, [setNodeRef])

  const containerDragProps = mode === 'custom' ? { ...attributes, ...listeners } : {}

  return (
    <Box
      ref={handleCombinedRef}
      style={style}
      data-container-width={containerWidth || undefined}
      onDragOver={handleNativeDragOver}
      onDrop={handleNativeDrop}
      {...containerDragProps}
      sx={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        cursor: mode === 'custom' ? (isDragging ? 'grabbing' : 'grab') : 'default',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        ...(mode === 'custom' && {
          border: (theme) => `1px dashed ${isDragging ? theme.palette.primary.main : theme.palette.primary.light}`,
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: 2,
          },
        }),
      }}
    >
      {mode === 'custom' && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 0.25,
            pb: 0.5,
          }}
        >
          <IconButton
            size="small"
            aria-label={t('dashboard.dragHandle')}
            disableRipple
            sx={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <DragIndicator fontSize="small" color="primary" />
          </IconButton>
          <IconButton
            size="small"
            aria-label={t('dashboard.widgetMenu')}
            aria-haspopup="menu"
            aria-expanded={Boolean(menuAnchor)}
            disableRipple
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              event.preventDefault()
              setMenuAnchor(event.currentTarget)
            }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={closeMenu}
            slotProps={{
              paper: {
                sx: { minWidth: 240, pointerEvents: 'auto' },
                onPointerDown: (e: any) => e.stopPropagation(),
                onMouseDown: (e: any) => e.stopPropagation(),
                onTouchStart: (e: any) => e.stopPropagation(),
              },
            }}
          >
            <MenuItem
              onClick={() => {
                closeMenu()
                widgetInspectorStore.openInspector({
                  pageId,
                  slotId,
                  widgetId,
                  title: t(descriptor?.titleKey || '', { defaultValue: widgetId }),
                })
              }}
            >
              <ListItemIcon>
                <Settings fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText>{t('dashboard.inspectWidget', { defaultValue: 'Configure & Inspect' })}</ListItemText>
            </MenuItem>
            <Divider />

            <MenuItem disabled={isFirst} onClick={handleMoveLeft}>
              <ListItemIcon>
                <ArrowLeft fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('dashboard.moveLeft')}</ListItemText>
            </MenuItem>
            <MenuItem disabled={isLast} onClick={handleMoveRight}>
              <ListItemIcon>
                <ArrowRight fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('dashboard.moveRight')}</ListItemText>
            </MenuItem>

            {availableLayouts.length > 0 && <Divider />}
            {availableLayouts.length > 0 && (
              <ListSubheader component="div" sx={{ lineHeight: '28px', fontSize: '0.75rem', fontWeight: 700 }}>
                {t('dashboard.moveToCanvas', { defaultValue: 'Move to Canvas' })}
              </ListSubheader>
            )}
            {availableLayouts.map((targetLayoutId) => (
              <MenuItem key={`tr-${targetLayoutId}`} onClick={() => handleTransfer(targetLayoutId, `${targetLayoutId}-slot-1`)}>
                <ListItemIcon>
                  <DriveFileMove fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText>
                  {targetLayoutId === 'dashboard' ? 'Main Dashboard' : targetLayoutId}
                </ListItemText>
              </MenuItem>
            ))}

            <Divider />
            <ListSubheader component="div" sx={{ lineHeight: '28px', fontSize: '0.75rem', fontWeight: 700 }}>
              {t('dashboard.resizeWidth')}
            </ListSubheader>
            <MenuItem selected={slotSize.span === 4} onClick={() => handleResizeSpan(4)}>
              <ListItemIcon>{slotSize.span === 4 ? <Check fontSize="small" /> : <ViewColumn fontSize="small" />}</ListItemIcon>
              <ListItemText>{t('dashboard.span4')}</ListItemText>
            </MenuItem>
            <MenuItem selected={slotSize.span === 8} onClick={() => handleResizeSpan(8)}>
              <ListItemIcon>{slotSize.span === 8 ? <Check fontSize="small" /> : <ViewColumn fontSize="small" />}</ListItemIcon>
              <ListItemText>{t('dashboard.span8')}</ListItemText>
            </MenuItem>
            <MenuItem selected={slotSize.span === 12} onClick={() => handleResizeSpan(12)}>
              <ListItemIcon>{slotSize.span === 12 ? <Check fontSize="small" /> : <ViewColumn fontSize="small" />}</ListItemIcon>
              <ListItemText>{t('dashboard.span12')}</ListItemText>
            </MenuItem>

            <Divider />
            <ListSubheader component="div" sx={{ lineHeight: '28px', fontSize: '0.75rem', fontWeight: 700 }}>
              {t('dashboard.resizeHeight')}
            </ListSubheader>
            <MenuItem selected={slotSize.height === 200} onClick={() => handleResizeHeight(200)}>
              <ListItemIcon>{slotSize.height === 200 ? <Check fontSize="small" /> : <Crop fontSize="small" />}</ListItemIcon>
              <ListItemText>{t('dashboard.heightCompact')}</ListItemText>
            </MenuItem>
            <MenuItem selected={slotSize.height === 280} onClick={() => handleResizeHeight(280)}>
              <ListItemIcon>{slotSize.height === 280 ? <Check fontSize="small" /> : <Crop fontSize="small" />}</ListItemIcon>
              <ListItemText>{t('dashboard.heightStandard')}</ListItemText>
            </MenuItem>
            <MenuItem selected={slotSize.height === 400} onClick={() => handleResizeHeight(400)}>
              <ListItemIcon>{slotSize.height === 400 ? <Check fontSize="small" /> : <Crop fontSize="small" />}</ListItemIcon>
              <ListItemText>{t('dashboard.heightTall')}</ListItemText>
            </MenuItem>

            {(defaultLayout || onReset) && <Divider key="reset-divider" />}
            {(defaultLayout || onReset) && (
              <MenuItem key="reset-item" onClick={handleReset}>
                <ListItemIcon>
                  <RestartAlt fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t('dashboard.resetLayout')}</ListItemText>
              </MenuItem>
            )}

            <Divider />
            <ListSubheader component="div" sx={{ lineHeight: '28px', fontSize: '0.75rem', fontWeight: 700, color: 'error.main' }}>
              Remove Options
            </ListSubheader>
            <MenuItem onClick={handleRemoveWidget}>
              <ListItemIcon>
                <DeleteOutline fontSize="small" color="warning" />
              </ListItemIcon>
              <ListItemText sx={{ color: 'warning.main' }}>Remove Widget</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleRemovePanel}>
              <ListItemIcon>
                <Delete fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText sx={{ color: 'error.main' }}>Remove Panel Slot</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      )}

      <ContainerSizeProvider size={{ width: containerWidth, height: 0, containerSize: (() => { const w = containerWidth; if (w >= 1280) return 'xl'; if (w >= 1024) return 'lg'; if (w >= 768) return 'md'; if (w >= 480) return 'sm'; return 'xs'; })(), entry: null }}>
        <React.Suspense fallback={<Skeleton variant="rounded" sx={{ flex: 1 }} aria-label={t('dashboard.widgetLoading')} />}>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <WidgetComponent subLayout={defaultLayout} mode={mode} slotId={slotId} pageId={pageId} />
          </Box>
        </React.Suspense>
      </ContainerSizeProvider>
    </Box>
  )
}

export const WidgetWrapper = React.memo(WidgetWrapperInner)

export default WidgetWrapper
