import { beforeEach, describe, expect, it } from 'vitest'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { createLayoutEngineSlice, type LayoutEngineSlice } from './layoutEngineSlice'
import type { GridLayout } from '@cap/shared-types'

const TEST_WIDGETS = {
  widgetA: 'widget-a',
  widgetB: 'widget-b',
  widgetC: 'widget-c',
}

const TEST_GRID_LAYOUT: GridLayout = {
  slots: ['slot-1', 'slot-2', 'slot-3'],
  slotWidgets: {
    'slot-1': TEST_WIDGETS.widgetA,
    'slot-2': TEST_WIDGETS.widgetB,
    'slot-3': TEST_WIDGETS.widgetC,
  },
  slotSizes: {
    'slot-1': { span: 4, height: 280 },
    'slot-2': { span: 4, height: 280 },
    'slot-3': { span: 4, height: 280 },
  },
}

// Create a standalone store for testing just this slice, wrapped in immer
const useTestStore = create<LayoutEngineSlice>()(
  immer((...a: any[]) => ({
    ...createLayoutEngineSlice(...(a as [any, any, any])),
  })) as any
)

describe('layoutEngineSlice', () => {
  const PAGE_ID = 'test-page'

  beforeEach(() => {
    useTestStore.setState({ layouts: {} })
    useTestStore.getState().initializeLayout(PAGE_ID, TEST_GRID_LAYOUT)
  })

  it('swaps the widgets occupying two slots', () => {
    useTestStore.getState().moveWidget(PAGE_ID, 'slot-1', 'slot-3')
    const layout = useTestStore.getState().layouts[PAGE_ID]
    expect(layout.slotWidgets['slot-1']).toBe(TEST_WIDGETS.widgetC)
    expect(layout.slotWidgets['slot-3']).toBe(TEST_WIDGETS.widgetA)
    expect(layout.slots).toEqual(['slot-1', 'slot-2', 'slot-3'])
  })

  it('moves a widget one position left', () => {
    useTestStore.getState().moveWidgetBy(PAGE_ID, 'slot-3', -1)
    const layout = useTestStore.getState().layouts[PAGE_ID]
    expect(layout.slotWidgets['slot-2']).toBe(TEST_WIDGETS.widgetC)
    expect(layout.slotWidgets['slot-3']).toBe(TEST_WIDGETS.widgetB)
  })

  it('moves a widget one position right', () => {
    useTestStore.getState().moveWidgetBy(PAGE_ID, 'slot-1', 1)
    const layout = useTestStore.getState().layouts[PAGE_ID]
    expect(layout.slotWidgets['slot-1']).toBe(TEST_WIDGETS.widgetB)
    expect(layout.slotWidgets['slot-2']).toBe(TEST_WIDGETS.widgetA)
  })

  it('ignores moves outside the canvas bounds', () => {
    useTestStore.getState().moveWidgetBy(PAGE_ID, 'slot-1', -1)
    expect(useTestStore.getState().layouts[PAGE_ID]).toEqual(TEST_GRID_LAYOUT)

    useTestStore.getState().moveWidgetBy(PAGE_ID, 'slot-3', 1)
    expect(useTestStore.getState().layouts[PAGE_ID]).toEqual(TEST_GRID_LAYOUT)
  })

  it('applies a swapy slotItemMap result', () => {
    useTestStore.getState().applySlotItemMap(PAGE_ID, [
      { slot: 'slot-1', item: TEST_WIDGETS.widgetC },
      { slot: 'slot-2', item: TEST_WIDGETS.widgetA },
      { slot: 'slot-3', item: TEST_WIDGETS.widgetB },
    ])
    const layout = useTestStore.getState().layouts[PAGE_ID]
    expect(layout.slotWidgets).toEqual({
      'slot-1': TEST_WIDGETS.widgetC,
      'slot-2': TEST_WIDGETS.widgetA,
      'slot-3': TEST_WIDGETS.widgetB,
    })
  })

  it('ignores unknown slots and items in a slotItemMap', () => {
    useTestStore.getState().applySlotItemMap(PAGE_ID, [
      { slot: 'slot-1', item: TEST_WIDGETS.widgetB },
      { slot: 'does-not-exist', item: TEST_WIDGETS.widgetC },
    ])
    const layout = useTestStore.getState().layouts[PAGE_ID]
    expect(layout.slotWidgets['slot-1']).toBe(TEST_WIDGETS.widgetB)
    expect(layout.slotWidgets['slot-2']).toBe(TEST_WIDGETS.widgetB)
  })

  it('resets to the default layout', () => {
    useTestStore.getState().moveWidget(PAGE_ID, 'slot-1', 'slot-2')
    useTestStore.getState().resetLayout(PAGE_ID, TEST_GRID_LAYOUT)
    expect(useTestStore.getState().layouts[PAGE_ID]).toEqual(TEST_GRID_LAYOUT)
  })

  it('resizes a widget grid column span', () => {
    useTestStore.getState().resizeWidgetSpan(PAGE_ID, 'slot-1', 8)
    const layout = useTestStore.getState().layouts[PAGE_ID]
    expect(layout.slotSizes?.['slot-1']?.span).toBe(8)
    expect(layout.slotSizes?.['slot-1']?.height).toBe(280)
  })

  it('resizes a widget crop height', () => {
    useTestStore.getState().resizeWidgetHeight(PAGE_ID, 'slot-1', 400)
    const layout = useTestStore.getState().layouts[PAGE_ID]
    expect(layout.slotSizes?.['slot-1']?.height).toBe(400)
    expect(layout.slotSizes?.['slot-1']?.span).toBe(4)
  })

  it('transfers a widget from parent to child canvas and clears origin slot if target empty', () => {
    const CHILD_PAGE_ID = 'child-page'
    const CHILD_LAYOUT: GridLayout = {
      slots: ['child-slot-1'],
      slotWidgets: {
        'child-slot-1': '',
      },
    }
    useTestStore.getState().initializeLayout(CHILD_PAGE_ID, CHILD_LAYOUT)

    useTestStore.getState().transferWidget(PAGE_ID, 'slot-1', CHILD_PAGE_ID, 'child-slot-1')

    const parentLayout = useTestStore.getState().layouts[PAGE_ID]
    const childLayout = useTestStore.getState().layouts[CHILD_PAGE_ID]

    expect(parentLayout.slotWidgets['slot-1']).toBe('')
    expect(childLayout.slotWidgets['child-slot-1']).toBe(TEST_WIDGETS.widgetA)
  })

  it('adds widget to target layout without kicking out existing widgets when transferring between different layout canvases', () => {
    const CHILD_PAGE_ID = 'child-page-2'
    const CHILD_LAYOUT: GridLayout = {
      slots: ['child-slot-1'],
      slotWidgets: {
        'child-slot-1': 'child-widget-x',
      },
    }
    useTestStore.getState().initializeLayout(CHILD_PAGE_ID, CHILD_LAYOUT)

    useTestStore.getState().transferWidget(PAGE_ID, 'slot-1', CHILD_PAGE_ID, 'child-slot-1')

    const parentLayout = useTestStore.getState().layouts[PAGE_ID]
    const childLayout = useTestStore.getState().layouts[CHILD_PAGE_ID]

    expect(parentLayout.slotWidgets['slot-1']).toBe('')
    expect(childLayout.slotWidgets['child-slot-1']).toBe('child-widget-x')
    expect(childLayout.slots.length).toBe(2)
    expect(childLayout.slotWidgets[childLayout.slots[1]]).toBe(TEST_WIDGETS.widgetA)
  })

  it('adds a new panel slot to a layout', () => {
    useTestStore.getState().addPanel(PAGE_ID)
    const layout = useTestStore.getState().layouts[PAGE_ID]
    expect(layout.slots.length).toBe(4)
    expect(layout.slots[3]).toBe('test-page-slot-4')
    expect(layout.slotWidgets['test-page-slot-4']).toBe('')
  })

  it('creates a new slot in target layout with same size when transferring to a new slot', () => {
    const TARGET_PAGE_ID = 'target-new-slot-page'
    const TARGET_LAYOUT: GridLayout = {
      slots: [],
      slotWidgets: {},
    }
    useTestStore.getState().initializeLayout(TARGET_PAGE_ID, TARGET_LAYOUT)
    useTestStore.getState().resizeWidgetSpan(PAGE_ID, 'slot-1', 8)
    useTestStore.getState().resizeWidgetHeight(PAGE_ID, 'slot-1', 400)

    useTestStore.getState().transferWidget(PAGE_ID, 'slot-1', TARGET_PAGE_ID, 'new-target-slot')

    const parentLayout = useTestStore.getState().layouts[PAGE_ID]
    const targetLayout = useTestStore.getState().layouts[TARGET_PAGE_ID]

    expect(parentLayout.slotWidgets['slot-1']).toBe('')
    expect(targetLayout.slots).toContain('new-target-slot')
    expect(targetLayout.slotWidgets['new-target-slot']).toBe(TEST_WIDGETS.widgetA)
    expect(targetLayout.slotSizes?.['new-target-slot']).toEqual({ span: 8, height: 400 })
  })

  it('removes a widget from a slot, making it empty', () => {
    useTestStore.getState().removeWidget(PAGE_ID, 'slot-1')
    const layout = useTestStore.getState().layouts[PAGE_ID]
    expect(layout.slotWidgets['slot-1']).toBe('')
  })

  it('removes a panel slot entirely from the layout', () => {
    useTestStore.getState().removePanel(PAGE_ID, 'slot-1')
    const layout = useTestStore.getState().layouts[PAGE_ID]
    expect(layout.slots).toEqual(['slot-2', 'slot-3'])
    expect(layout.slotWidgets['slot-1']).toBeUndefined()
  })

  it('clears origin slot and removes duplicate widget instances when transferring duplicate widget to target', () => {
    const TARGET_PAGE_ID = 'target-duplicate-page'
    const TARGET_LAYOUT: GridLayout = {
      slots: ['target-slot-1', 'target-slot-2'],
      slotWidgets: {
        'target-slot-1': TEST_WIDGETS.widgetA,
        'target-slot-2': TEST_WIDGETS.widgetB,
      },
    }
    useTestStore.getState().initializeLayout(TARGET_PAGE_ID, TARGET_LAYOUT)

    useTestStore.getState().transferWidget(PAGE_ID, 'slot-1', TARGET_PAGE_ID, 'target-slot-1')

    const parentLayout = useTestStore.getState().layouts[PAGE_ID]
    const targetLayout = useTestStore.getState().layouts[TARGET_PAGE_ID]

    expect(parentLayout.slotWidgets['slot-1']).toBe('')
    expect(targetLayout.slotWidgets['target-slot-1']).toBe(TEST_WIDGETS.widgetA)
  })
})
