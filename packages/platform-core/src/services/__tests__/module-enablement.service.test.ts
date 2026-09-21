import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  moduleEnablementService,
  isCoreModule,
  CORE_MODULE_IDS,
} from '../module-enablement.service'
import { moduleInventoryService } from '../module-inventory.service'
import { ModuleRegistry } from '../../assembly/ModuleRegistry'
import type { CAPModule } from '@cap/shared-types'

const themeModule: CAPModule = {
  id: 'theme-module',
  version: '1.1.0',
  name: 'Theme Customization Module',
  description: 'Theme customization and live preview editor module',
  routes: [
    { path: '/theme', element: null as any, layout: 'vertical', icon: 'palette' },
    { path: '/theme/preview', element: null as any, layout: 'vertical' },
  ],
  navItems: [{ id: 'theme-nav', label: 'Theme', path: '/theme' }] as any,
  searchItems: [{ id: 'search-theme', name: 'Theme Customization' }] as any,
  i18n: { en: {}, fr: {}, ar: {} },
}

const authModule: CAPModule = {
  id: 'auth-module',
  version: '1.0.0',
  routes: [{ path: '/login', element: null as any, layout: 'public' }],
}

describe('moduleEnablementService', () => {
  beforeEach(() => {
    window.localStorage.clear()
    moduleEnablementService.reset()
  })

  it('treats every module as enabled by default', () => {
    expect(moduleEnablementService.isEnabled('theme-module')).toBe(true)
    expect(moduleEnablementService.getDisabledIds()).toEqual([])
  })

  it('persists a disabled module and reports it as disabled', () => {
    moduleEnablementService.setEnabled('theme-module', false)

    expect(moduleEnablementService.isEnabled('theme-module')).toBe(false)
    expect(JSON.parse(window.localStorage.getItem('serafort.modules.disabled')!)).toEqual([
      'theme-module',
    ])
  })

  it('re-enables a module and clears it from storage', () => {
    moduleEnablementService.setEnabled('theme-module', false)
    moduleEnablementService.setEnabled('theme-module', true)

    expect(moduleEnablementService.isEnabled('theme-module')).toBe(true)
    expect(JSON.parse(window.localStorage.getItem('serafort.modules.disabled')!)).toEqual([])
  })

  it('refuses to disable a core module instead of silently succeeding', () => {
    CORE_MODULE_IDS.forEach((id) => {
      expect(isCoreModule(id)).toBe(true)
      expect(() => moduleEnablementService.setEnabled(id, false)).toThrow(/core platform module/i)
      expect(moduleEnablementService.isEnabled(id)).toBe(true)
    })
  })

  it('notifies subscribers and stops after unsubscribe', () => {
    const listener = vi.fn()
    const unsubscribe = moduleEnablementService.subscribe(listener)

    moduleEnablementService.setEnabled('theme-module', false)
    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
    moduleEnablementService.setEnabled('theme-module', true)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('survives unreadable storage', () => {
    window.localStorage.setItem('serafort.modules.disabled', 'not json')
    moduleEnablementService.reset()
    window.localStorage.setItem('serafort.modules.disabled', 'not json')

    expect(moduleEnablementService.isEnabled('theme-module')).toBe(true)
  })
})

describe('moduleInventoryService', () => {
  beforeEach(() => {
    window.localStorage.clear()
    moduleEnablementService.reset()
    const registry = ModuleRegistry.getInstance()
    registry.reset()
    registry.registerModule(authModule)
    registry.registerModule(themeModule)
  })

  it('derives counts from the module contracts themselves', () => {
    const theme = moduleInventoryService.listModules().find((m) => m.id === 'theme-module')!

    expect(theme.name).toBe('Theme Customization Module')
    expect(theme.version).toBe('1.1.0')
    expect(theme.routeCount).toBe(2)
    // One declared nav item plus the /theme route, which carries an icon.
    expect(theme.navCount).toBe(2)
    expect(theme.searchCount).toBe(1)
    expect(theme.locales).toEqual(['ar', 'en', 'fr'])
    expect(theme.isCore).toBe(false)
    expect(theme.status).toBe('active')
  })

  it('marks core modules and locks them as core', () => {
    const auth = moduleInventoryService.listModules().find((m) => m.id === 'auth-module')!
    expect(auth.isCore).toBe(true)
    // No `name` on the contract, so the id is prettified rather than shown raw.
    expect(auth.name).toBe('Auth Module')
  })

  it('reports a disabled module but keeps listing it', () => {
    moduleEnablementService.setEnabled('theme-module', false)

    const listed = moduleInventoryService.listModules()
    expect(listed).toHaveLength(2)
    expect(listed.find((m) => m.id === 'theme-module')!.status).toBe('disabled')
  })

  it('counts only routes that are actually mounted', () => {
    expect(moduleInventoryService.countRegisteredRoutes()).toBe(3)

    moduleEnablementService.setEnabled('theme-module', false)
    expect(moduleInventoryService.countRegisteredRoutes()).toBe(1)
  })

  it('drops a disabled module from the command palette', () => {
    const registry = ModuleRegistry.getInstance()
    const enabled = (module: CAPModule) => moduleEnablementService.isEnabled(module.id)

    expect(registry.getSearchItems(enabled)).toHaveLength(1)

    moduleEnablementService.setEnabled('theme-module', false)
    expect(registry.getSearchItems(enabled)).toHaveLength(0)
  })
})
