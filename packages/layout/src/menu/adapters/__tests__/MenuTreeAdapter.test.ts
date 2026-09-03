import { describe, it, expect } from 'vitest'
import { MenuTreeAdapter, DEFAULT_MAX_ITEMS_PER_SECTION } from '../MenuTreeAdapter'
import type { NavItemConfig } from '@cap/shared-types'

describe('MenuTreeAdapter', () => {
  it('translates navigation keys with prefix stripping', () => {
    const dict = {
      navigation: {
        dashboard: 'Tableau de bord',
      },
    }

    expect(MenuTreeAdapter.translateKey('navigation.dashboard', dict)).toBe('Tableau de bord')
    expect(MenuTreeAdapter.translateKey('dashboard', dict)).toBe('Tableau de bord')
    expect(MenuTreeAdapter.translateKey('navigation.more')).toBe('More')
  })

  it('keeps sections within 7 items unchanged', () => {
    const items: NavItemConfig[] = [
      { id: 'sec1', label: 'Section 1', section: 'Section 1' },
      { id: 'item1', label: 'Item 1', path: '/item1' },
      { id: 'item2', label: 'Item 2', path: '/item2' },
      { id: 'item3', label: 'Item 3', path: '/item3' },
    ]

    const tree = MenuTreeAdapter.buildMenuTree(items)
    expect(tree).toHaveLength(1)
    expect(tree[0].items).toHaveLength(3)
  })

  it('enforces Miller Law progressive disclosure when items exceed 7', () => {
    const items: NavItemConfig[] = [
      { id: 'sec1', label: 'Section 1', section: 'Section 1' },
      { id: 'item1', label: 'Item 1', path: '/1' },
      { id: 'item2', label: 'Item 2', path: '/2' },
      { id: 'item3', label: 'Item 3', path: '/3' },
      { id: 'item4', label: 'Item 4', path: '/4' },
      { id: 'item5', label: 'Item 5', path: '/5' },
      { id: 'item6', label: 'Item 6', path: '/6' },
      { id: 'item7', label: 'Item 7', path: '/7' },
      { id: 'item8', label: 'Item 8', path: '/8' },
      { id: 'item9', label: 'Item 9', path: '/9' },
    ]

    const tree = MenuTreeAdapter.buildMenuTree(items, undefined, undefined, undefined, {
      maxItemsPerSection: DEFAULT_MAX_ITEMS_PER_SECTION, // 7
      enableProgressiveDisclosure: true,
    })

    expect(tree).toHaveLength(1)
    // 6 visible items + 1 'More' sub-menu = 7 total top-level items in the section
    expect(tree[0].items).toHaveLength(7)
    const moreItem = tree[0].items[6]
    expect(moreItem.id).toBe('sec1_more')
    expect(moreItem.label).toBe('More')
    expect(moreItem.children).toBeDefined()
    expect(moreItem.children).toHaveLength(3) // items 7, 8, 9
    expect(moreItem.children![0].id).toBe('item7')
    expect(moreItem.children![1].id).toBe('item8')
    expect(moreItem.children![2].id).toBe('item9')
  })
})
