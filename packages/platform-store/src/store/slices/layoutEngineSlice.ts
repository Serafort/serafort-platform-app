import { StateCreator } from 'zustand'
import type { AppStore } from '../../types'
import type {
  SlotId,
  WidgetSpan,
  WidgetHeight,
  GridLayout,
  SlotItemEntry,
  SlotWidgetValue,
} from '@cap/shared-types'
import { isWidgetNode, getWidgetIdFromSlotValue } from '@cap/shared-types'

export const DEFAULT_SLOT_SIZE = {
  span: 4 as WidgetSpan,
  height: 280 as WidgetHeight,
}

const isContainerWidget = (val: SlotWidgetValue | undefined): boolean => {
  if (!val) return false
  if (isWidgetNode(val)) return true
  const widgetId = getWidgetIdFromSlotValue(val)
  return widgetId === 'dashboard-widget-splitPane' || widgetId === 'dashboard-widget-tabbedCanvas'
}

const generateUniqueSlotId = (pageId: string, existingSlots: string[] = []): string => {
  let index = existingSlots.length + 1
  let candidate = `${pageId}-slot-${index}`
  while (existingSlots.includes(candidate)) {
    index++
    candidate = `${pageId}-slot-${index}`
  }
  return candidate
}

export interface LayoutEngineSlice {
  layouts: Record<string, GridLayout>
  savedViews: Record<string, Record<string, GridLayout>>
  activeViewName: string
  /** Initializes a page with a default layout if it doesn't already exist. */
  initializeLayout: (pageId: string, defaultLayout: GridLayout) => void
  /** Swaps the widgets occupying `fromSlot` and `toSlot`. */
  moveWidget: (pageId: string, fromSlot: SlotId, toSlot: SlotId) => void
  /** Moves the widget in `slot` one position left (-1) or right (+1). */
  moveWidgetBy: (pageId: string, slot: SlotId, direction: -1 | 1) => void
  /** Applies a swapy slotItemMap result to the store. */
  applySlotItemMap: (pageId: string, entries: SlotItemEntry[]) => void
  /** Resizes the grid column span for a given slot. */
  resizeWidgetSpan: (pageId: string, slot: SlotId, span: WidgetSpan) => void
  /** Resizes the height/crop for a given slot. */
  resizeWidgetHeight: (pageId: string, slot: SlotId, height: WidgetHeight) => void
  /** Resets the layout to default */
  resetLayout: (pageId: string, defaultLayout: GridLayout) => void
  /** Transfers or swaps a widget between two layout canvas instances. */
  transferWidget: (
    fromLayoutId: string,
    fromSlot: SlotId,
    toLayoutId: string,
    toSlot: SlotId
  ) => void
  /** Removes the widget from a slot, making it an empty slot. */
  removeWidget: (pageId: string, slotId: SlotId) => void
  /** Removes the entire slot/panel from the layout. */
  removePanel: (pageId: string, slotId: SlotId) => void
  /** Adds a new empty panel slot to the layout. */
  addPanel: (pageId: string) => void
  /** Adds a new slot with a widget to the layout. */
  addSlot: (
    pageId: string,
    slotId: string,
    widgetId: SlotWidgetValue,
    size?: { span?: WidgetSpan; height?: WidgetHeight }
  ) => void
  /** Saves current layouts state as a named view template. */
  saveView: (viewName: string) => void
  /** Loads a saved named view template into layouts. */
  loadView: (viewName: string) => void
  /** Deletes a saved view template. */
  deleteView: (viewName: string) => void
  /** Exports all layouts and saved views as a JSON string for cloud sync. */
  exportLayoutsJson: () => string
  /** Imports a layout JSON snapshot into the layout engine. */
  importLayoutsJson: (jsonString: string) => boolean
}

const swapWidgets = (layout: GridLayout, a: SlotId, b: SlotId): GridLayout => {
  if (a === b) return layout
  const valA = layout.slotWidgets[a]
  const valB = layout.slotWidgets[b]
  const replacementForA = valB && valB !== valA && !isContainerWidget(valB) ? valB : ''

  return {
    ...layout,
    slotWidgets: {
      ...layout.slotWidgets,
      [a]: replacementForA,
      [b]: valA || '',
    },
  }
}

export const createLayoutEngineSlice: StateCreator<
  AppStore,
  [['zustand/devtools', never], ['zustand/persist', unknown], ['zustand/immer', never]],
  [],
  LayoutEngineSlice
> = (set, get) => ({
  layouts: {},
  savedViews: {},
  activeViewName: 'Default View',

  initializeLayout: (pageId, defaultLayout) =>
    set((state) => {
      if (!state.layouts[pageId]) {
        state.layouts[pageId] = defaultLayout
      }
    }),

  moveWidget: (pageId, fromSlot, toSlot) =>
    set((state) => {
      if (import.meta.env.DEV) console.log('[Store:layoutEngine] moveWidget called:', { pageId, fromSlot, toSlot })
      const layout = state.layouts[pageId]
      if (layout) {
        state.layouts[pageId] = swapWidgets(layout, fromSlot, toSlot)
        if (import.meta.env.DEV) console.log('[Store:layoutEngine] moveWidget succeeded:', state.layouts[pageId].slotWidgets)
      } else {
        console.warn('[Store:layoutEngine] moveWidget failed - layout not found:', pageId)
      }
    }),

  moveWidgetBy: (pageId, slot, direction) =>
    set((state) => {
      if (import.meta.env.DEV) console.log('[Store:layoutEngine] moveWidgetBy called:', { pageId, slot, direction })
      const layout = state.layouts[pageId]
      if (!layout) return
      const index = layout.slots.indexOf(slot)
      const target = index + direction
      if (index !== -1 && target >= 0 && target < layout.slots.length) {
        state.layouts[pageId] = swapWidgets(layout, slot, layout.slots[target])
      }
    }),

  applySlotItemMap: (pageId, entries) =>
    set((state) => {
      if (import.meta.env.DEV) console.log('[Store:layoutEngine] applySlotItemMap called:', { pageId, entries })
      const layout = state.layouts[pageId]
      if (!layout) return
      const slotWidgets = { ...layout.slotWidgets }
      for (const entry of entries) {
        if (entry.item && slotWidgets[entry.slot] !== undefined) {
          slotWidgets[entry.slot] = entry.item
        }
      }
      layout.slotWidgets = slotWidgets
    }),

  resizeWidgetSpan: (pageId, slot, span) =>
    set((state) => {
      const layout = state.layouts[pageId]
      if (!layout) return
      if (!layout.slotSizes) {
        layout.slotSizes = {}
      }
      const currentSize = layout.slotSizes[slot] || DEFAULT_SLOT_SIZE
      layout.slotSizes[slot] = { ...currentSize, span }
    }),

  resizeWidgetHeight: (pageId, slot, height) =>
    set((state) => {
      const layout = state.layouts[pageId]
      if (!layout) return
      if (!layout.slotSizes) {
        layout.slotSizes = {}
      }
      const currentSize = layout.slotSizes[slot] || DEFAULT_SLOT_SIZE
      layout.slotSizes[slot] = { ...currentSize, height }
    }),

  resetLayout: (pageId, defaultLayout) =>
    set((state) => {
      if (import.meta.env.DEV) console.log('[Store:layoutEngine] resetLayout called:', pageId)
      state.layouts[pageId] = { ...defaultLayout }
    }),

  transferWidget: (fromLayoutId, fromSlot, toLayoutId, toSlot) =>
    set((state) => {
      if (import.meta.env.DEV) console.log('[Store:layoutEngine] transferWidget called:', { fromLayoutId, fromSlot, toLayoutId, toSlot })
      if (fromLayoutId === toLayoutId) {
        if (fromSlot === toSlot) return
        const layout = state.layouts[fromLayoutId]
        if (!layout) return
        state.layouts[fromLayoutId] = swapWidgets(layout, fromSlot, toSlot)
        if (import.meta.env.DEV) console.log('[Store:layoutEngine] transferWidget (same layout swap) result:', state.layouts[fromLayoutId].slotWidgets)
        return
      }

      const fromLayout = state.layouts[fromLayoutId]
      const toLayout = state.layouts[toLayoutId]
      if (!toLayout) {
        console.warn('[Store:layoutEngine] transferWidget failed - target layout missing:', toLayoutId)
        return
      }

      let widgetA: SlotWidgetValue | undefined
      if (fromLayout) {
        widgetA = fromLayout.slotWidgets?.[fromSlot]
      } else if (fromLayoutId === 'marketplace-catalog' || fromSlot.startsWith('catalog-')) {
        widgetA = fromSlot.replace(/^catalog-/, '')
      }

      const widgetB = toLayout.slotWidgets[toSlot]
      if (import.meta.env.DEV) console.log('[Store:layoutEngine] transferWidget widgets:', { widgetA, widgetB })
      if (!widgetA) {
        console.warn('[Store:layoutEngine] transferWidget failed - source widget empty')
        return
      }

      const fromSize = fromLayout?.slotSizes?.[fromSlot] || DEFAULT_SLOT_SIZE

      // Determine target slot in toLayout:
      // If toSlot is empty, use toSlot directly.
      // If toSlot is occupied by widgetB (or is a container), find an empty slot in toLayout, or create a brand new unique slot!
      let targetSlot = toSlot
      if (widgetB && widgetB !== '' && widgetB !== widgetA) {
        if (import.meta.env.DEV) console.log('[Store:layoutEngine] Target slot occupied; finding or creating empty slot in target layout')
        const emptySlot = toLayout.slots.find((sId) => !toLayout.slotWidgets[sId] || toLayout.slotWidgets[sId] === '')
        if (emptySlot) {
          targetSlot = emptySlot
        } else {
          targetSlot = generateUniqueSlotId(toLayoutId, toLayout.slots)
        }
      }

      const isToSlotNew = !toLayout.slots.includes(targetSlot)
      const newToSlots = Array.from(new Set(isToSlotNew ? [...toLayout.slots, targetSlot] : toLayout.slots))

      // Clear any duplicate instances of widgetA in toLayout (other than targetSlot)
      const toSlotWidgets = { ...toLayout.slotWidgets }
      for (const [sId, wVal] of Object.entries(toSlotWidgets)) {
        if (sId !== targetSlot && wVal === widgetA) {
          toSlotWidgets[sId] = ''
        }
      }
      toSlotWidgets[targetSlot] = widgetA

      // Clear widgetA from fromSlot in fromLayout if fromLayout exists
      if (fromLayout) {
        state.layouts[fromLayoutId] = {
          ...fromLayout,
          slotWidgets: {
            ...fromLayout.slotWidgets,
            [fromSlot]: '',
          },
        }
      }

      state.layouts[toLayoutId] = {
        ...toLayout,
        slots: newToSlots,
        slotWidgets: toSlotWidgets,
        slotSizes: {
          ...toLayout.slotSizes,
          [targetSlot]: fromSize,
        },
      }
      if (import.meta.env.DEV) {
        console.log('[Store:layoutEngine] transferWidget completed:', {
          fromWidgets: state.layouts[fromLayoutId]?.slotWidgets,
          toWidgets: state.layouts[toLayoutId]?.slotWidgets,
        })
      }
    }),

  removeWidget: (pageId, slotId) =>
    set((state) => {
      if (import.meta.env.DEV) console.log('[Store:layoutEngine] removeWidget called:', { pageId, slotId })
      const layout = state.layouts[pageId]
      if (!layout) return
      state.layouts[pageId] = {
        ...layout,
        slotWidgets: {
          ...layout.slotWidgets,
          [slotId]: '',
        },
      }
      if (import.meta.env.DEV) console.log('[Store:layoutEngine] removeWidget completed:', state.layouts[pageId].slotWidgets)
    }),

  removePanel: (pageId, slotId) =>
    set((state) => {
      if (import.meta.env.DEV) console.log('[Store:layoutEngine] removePanel called:', { pageId, slotId })
      const layout = state.layouts[pageId]
      if (!layout) return
      const newSlots = layout.slots.filter((s) => s !== slotId)
      const newSlotWidgets = { ...layout.slotWidgets }
      delete newSlotWidgets[slotId]
      const newSlotSizes = { ...layout.slotSizes }
      delete newSlotSizes[slotId]

      state.layouts[pageId] = {
        ...layout,
        slots: newSlots,
        slotWidgets: newSlotWidgets,
        slotSizes: newSlotSizes,
      }
      if (import.meta.env.DEV) console.log('[Store:layoutEngine] removePanel completed:', state.layouts[pageId])
    }),

  addPanel: (pageId) =>
    set((state) => {
      if (import.meta.env.DEV) console.log('[Store:layoutEngine] addPanel called:', pageId)
      const layout = state.layouts[pageId]
      if (!layout) return
      const newSlotId = generateUniqueSlotId(pageId, layout.slots)
      state.layouts[pageId] = {
        ...layout,
        slots: Array.from(new Set([...layout.slots, newSlotId])),
        slotWidgets: {
          ...layout.slotWidgets,
          [newSlotId]: '',
        },
        slotSizes: {
          ...layout.slotSizes,
          [newSlotId]: DEFAULT_SLOT_SIZE,
        },
      }
      if (import.meta.env.DEV) console.log('[Store:layoutEngine] addPanel completed:', state.layouts[pageId])
    }),

  addSlot: (pageId, slotId, widgetId, size) =>
    set((state) => {
      const layout = state.layouts[pageId]
      if (!layout) return
      if (!layout.slots.includes(slotId)) {
        layout.slots.push(slotId)
      }
      layout.slotWidgets[slotId] = widgetId
      if (!layout.slotSizes) {
        layout.slotSizes = {}
      }
      layout.slotSizes[slotId] = {
        span: size?.span ?? DEFAULT_SLOT_SIZE.span,
        height: size?.height ?? DEFAULT_SLOT_SIZE.height,
      }
      if (import.meta.env.DEV) console.log('[Store:layoutEngine] addSlot completed:', { pageId, slotId, widgetId })
    }),

  saveView: (viewName) =>
    set((state) => {
      if (!viewName.trim()) return
      const snapshot = JSON.parse(JSON.stringify(state.layouts))
      state.savedViews[viewName] = snapshot
      state.activeViewName = viewName
      if (import.meta.env.DEV) console.log('[Store:layoutEngine] saveView:', { viewName, snapshot })
    }),

  loadView: (viewName) =>
    set((state) => {
      const snapshot = state.savedViews[viewName]
      if (!snapshot) return
      state.layouts = JSON.parse(JSON.stringify(snapshot))
      state.activeViewName = viewName
      if (import.meta.env.DEV) console.log('[Store:layoutEngine] loadView:', { viewName })
    }),

  deleteView: (viewName) =>
    set((state) => {
      delete state.savedViews[viewName]
      if (state.activeViewName === viewName) {
        state.activeViewName = 'Default View'
      }
      if (import.meta.env.DEV) console.log('[Store:layoutEngine] deleteView:', viewName)
    }),

  exportLayoutsJson: () => {
    const currentState = get()
    const payload = {
      version: '1.0.0',
      timestamp: Date.now(),
      activeViewName: currentState.activeViewName || 'Default View',
      layouts: currentState.layouts || {},
      savedViews: currentState.savedViews || {},
    }
    return JSON.stringify(payload, null, 2)
  },

  importLayoutsJson: (jsonString) => {
    try {
      const data = JSON.parse(jsonString)
      if (data && typeof data === 'object' && data.layouts) {
        set((state) => {
          state.layouts = data.layouts
          if (data.savedViews) state.savedViews = data.savedViews
          if (data.activeViewName) state.activeViewName = data.activeViewName
        })
        return true
      }
    } catch (e) {
      console.error('[Store:layoutEngine] Error importing layouts JSON:', e)
    }
    return false
  },
})
