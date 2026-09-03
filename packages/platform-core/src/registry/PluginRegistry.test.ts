import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPluginRegistry, globalPluginRegistry } from './PluginRegistry'
import type { CAPPlugin, ComponentPlugin, RoutePlugin, ServicePlugin } from '@cap/shared-types'

describe('PluginRegistry', () => {
  let registry: ReturnType<typeof createPluginRegistry>

  beforeEach(() => {
    registry = createPluginRegistry()
    registry.clear()
  })

  describe('register()', () => {
    it('should register a plugin successfully', async () => {
      const plugin: CAPPlugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        pluginType: 'component',
        install: vi.fn(),
      }

      await registry.register(plugin)

      expect(registry.hasPlugin('test-plugin')).toBe(true)
      expect(registry.getPluginState('test-plugin')).toBe('active')
    })

    it('should throw error for duplicate plugin ID', async () => {
      const plugin1: CAPPlugin = {
        id: 'test-plugin',
        name: 'Test Plugin 1',
        version: '1.0.0',
        pluginType: 'component',
        install: vi.fn(),
      }

      const plugin2: CAPPlugin = {
        id: 'test-plugin',
        name: 'Test Plugin 2',
        version: '1.0.0',
        pluginType: 'component',
        install: vi.fn(),
      }

      await registry.register(plugin1)
      await expect(registry.register(plugin2)).rejects.toThrow('already registered')
    })

    it('should throw error for missing dependency', async () => {
      const plugin: CAPPlugin = {
        id: 'dependent-plugin',
        name: 'Dependent Plugin',
        version: '1.0.0',
        pluginType: 'component',
        dependencies: ['non-existent-plugin'],
        install: vi.fn(),
      }

      await expect(registry.register(plugin)).rejects.toThrow('requires dependency')
    })

    it('should install plugin and call install hook', async () => {
      const installFn = vi.fn()
      const plugin: CAPPlugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        pluginType: 'component',
        install: installFn,
      }

      await registry.register(plugin)

      expect(installFn).toHaveBeenCalledTimes(1)
      expect(installFn).toHaveBeenCalledWith(
        expect.objectContaining({
          moduleId: 'global',
          registry: expect.any(Object),
        })
      )
    })

    it('should register component outputs from component plugin', async () => {
      const TestComponent = () => null

      const plugin: CAPPlugin & ComponentPlugin = {
        id: 'component-plugin',
        name: 'Component Plugin',
        version: '1.0.0',
        pluginType: 'component',
        install: vi.fn(),
        components: {
          TestComponent,
        },
      }

      await registry.register(plugin)

      const components = registry.getComponents()
      expect(components.TestComponent).toBe(TestComponent)
    })

    it('should register route outputs from route plugin', async () => {
      const plugin: CAPPlugin & RoutePlugin = {
        id: 'route-plugin',
        name: 'Route Plugin',
        version: '1.0.0',
        pluginType: 'route',
        install: vi.fn(),
        routes: [
          { path: '/test', element: null },
          { path: '/test2', element: null },
        ],
      }

      await registry.register(plugin)

      const routes = registry.getRoutes()
      expect(routes).toHaveLength(2)
      expect(routes[0].path).toBe('/test')
    })

    it('should register routes with prefix', async () => {
      const plugin: CAPPlugin & RoutePlugin = {
        id: 'route-plugin',
        name: 'Route Plugin',
        version: '1.0.0',
        pluginType: 'route',
        install: vi.fn(),
        routes: [{ path: '/test', element: null }],
        routePrefix: '/prefix',
      }

      await registry.register(plugin)

      const routes = registry.getRoutes()
      expect(routes[0].path).toBe('/prefix/test')
    })

    it('should register service outputs from service plugin', async () => {
      const testService = { doSomething: () => 'test' }

      const plugin: CAPPlugin & ServicePlugin = {
        id: 'service-plugin',
        name: 'Service Plugin',
        version: '1.0.0',
        pluginType: 'service',
        install: vi.fn(),
        services: {
          testService,
        },
      }

      await registry.register(plugin)

      const service = registry.getService('testService')
      expect(service).toBe(testService)
    })

    it('should call onStateChange callback when state changes', async () => {
      const onStateChange = vi.fn()

      const plugin: CAPPlugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        pluginType: 'component',
        install: vi.fn(),
        onStateChange,
      }

      await registry.register(plugin)

      expect(onStateChange).toHaveBeenCalledWith('active')
    })

    it('should set state to error when install fails', async () => {
      const error = new Error('Install failed')
      const plugin: CAPPlugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        pluginType: 'component',
        install: vi.fn().mockRejectedValue(error),
      }

      await expect(registry.register(plugin)).rejects.toThrow('Install failed')
      expect(registry.hasPlugin('test-plugin')).toBe(false)
    })
  })

  describe('unregister()', () => {
    it('should unregister a plugin and clean up outputs', async () => {
      const TestComponent = () => null

      const plugin: CAPPlugin & ComponentPlugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        pluginType: 'component',
        install: vi.fn(),
        uninstall: vi.fn(),
        components: {
          TestComponent,
        },
      }

      await registry.register(plugin)
      await registry.unregister('test-plugin')

      expect(registry.hasPlugin('test-plugin')).toBe(false)
      expect(registry.getPluginState('test-plugin')).toBe('uninstalled')
      expect(registry.getComponent('TestComponent')).toBeUndefined()
    })

    it('should call uninstall hook during unregistration', async () => {
      const uninstallFn = vi.fn()

      const plugin: CAPPlugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        pluginType: 'component',
        install: vi.fn(),
        uninstall: uninstallFn,
      }

      await registry.register(plugin)
      await registry.unregister('test-plugin')

      expect(uninstallFn).toHaveBeenCalledTimes(1)
    })

    it('should remove routes during unregistration', async () => {
      const plugin: CAPPlugin & RoutePlugin = {
        id: 'route-plugin',
        name: 'Route Plugin',
        version: '1.0.0',
        pluginType: 'route',
        install: vi.fn(),
        routes: [{ path: '/test', element: null }],
      }

      await registry.register(plugin)
      expect(registry.getRoutes()).toHaveLength(1)

      await registry.unregister('route-plugin')
      expect(registry.getRoutes()).toHaveLength(0)
    })

    it('should remove services during unregistration', async () => {
      const testService = { doSomething: () => 'test' }

      const plugin: CAPPlugin & ServicePlugin = {
        id: 'service-plugin',
        name: 'Service Plugin',
        version: '1.0.0',
        pluginType: 'service',
        install: vi.fn(),
        services: { testService },
      }

      await registry.register(plugin)
      expect(registry.getService('testService')).toBe(testService)

      await registry.unregister('service-plugin')
      expect(registry.getService('testService')).toBeUndefined()
    })

    it('should handle unregistering non-existent plugin gracefully', async () => {
      await expect(registry.unregister('non-existent')).resolves.not.toThrow()
    })

    it('should throw error when trying to uninstall while installing', async () => {
      let resolveInstall: () => void
      const installPromise = new Promise<void>((resolve) => {
        resolveInstall = resolve
      })

      const plugin: CAPPlugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        pluginType: 'component',
        install: vi.fn().mockImplementation(() => installPromise),
      }

      const registerPromise = registry.register(plugin)

      await new Promise((r) => setTimeout(r, 10))

      await expect(registry.unregister('test-plugin')).rejects.toThrow('while installing')

      resolveInstall!()
      await registerPromise
    })
  })

  describe('getPlugin()', () => {
    it('should return plugin by ID', async () => {
      const plugin: CAPPlugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        pluginType: 'component',
        install: vi.fn(),
      }

      await registry.register(plugin)

      const retrieved = registry.getPlugin('test-plugin')
      expect(retrieved?.id).toBe('test-plugin')
    })

    it('should return undefined for non-existent plugin', () => {
      expect(registry.getPlugin('non-existent')).toBeUndefined()
    })
  })

  describe('getAllPlugins()', () => {
    it('should return all registered plugins', async () => {
      const plugin1: CAPPlugin = {
        id: 'plugin-1',
        name: 'Plugin 1',
        version: '1.0.0',
        pluginType: 'component',
        install: vi.fn(),
      }

      const plugin2: CAPPlugin = {
        id: 'plugin-2',
        name: 'Plugin 2',
        version: '1.0.0',
        pluginType: 'component',
        install: vi.fn(),
      }

      await registry.register(plugin1)
      await registry.register(plugin2)

      const plugins = registry.getAllPlugins()
      expect(plugins).toHaveLength(2)
    })
  })

  describe('getPluginsByType()', () => {
    it('should return plugins filtered by type', async () => {
      const componentPlugin: CAPPlugin = {
        id: 'component-plugin',
        name: 'Component Plugin',
        version: '1.0.0',
        pluginType: 'component',
        install: vi.fn(),
      }

      const servicePlugin: CAPPlugin = {
        id: 'service-plugin',
        name: 'Service Plugin',
        version: '1.0.0',
        pluginType: 'service',
        install: vi.fn(),
      }

      await registry.register(componentPlugin)
      await registry.register(servicePlugin)

      const componentPlugins = registry.getPluginsByType('component')
      expect(componentPlugins).toHaveLength(1)
      expect(componentPlugins[0].id).toBe('component-plugin')
    })
  })

  describe('getStats()', () => {
    it('should return correct registry statistics', async () => {
      const componentPlugin: CAPPlugin & ComponentPlugin = {
        id: 'component-plugin',
        name: 'Component Plugin',
        version: '1.0.0',
        pluginType: 'component',
        install: vi.fn(),
        components: { Test: () => null },
      }

      const routePlugin: CAPPlugin & RoutePlugin = {
        id: 'route-plugin',
        name: 'Route Plugin',
        version: '1.0.0',
        pluginType: 'route',
        install: vi.fn(),
        routes: [{ path: '/test', element: null }],
      }

      const servicePlugin: CAPPlugin & ServicePlugin = {
        id: 'service-plugin',
        name: 'Service Plugin',
        version: '1.0.0',
        pluginType: 'service',
        install: vi.fn(),
        services: { service: {} },
      }

      await registry.register(componentPlugin)
      await registry.register(routePlugin)
      await registry.register(servicePlugin)

      const stats = registry.getStats()
      expect(stats.totalPlugins).toBe(3)
      expect(stats.activePlugins).toBe(3)
      expect(stats.components).toBe(1)
      expect(stats.routes).toBe(1)
      expect(stats.services).toBe(1)
    })
  })

  describe('clear()', () => {
    it('should remove all plugins and outputs', async () => {
      const plugin: CAPPlugin & ComponentPlugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        pluginType: 'component',
        install: vi.fn(),
        components: { Test: () => null },
      }

      await registry.register(plugin)
      registry.clear()

      expect(registry.getAllPlugins()).toHaveLength(0)
      expect(registry.getComponents()).toEqual({})
    })
  })

  describe('type guards', () => {
    it('should correctly identify component plugins', async () => {
      const { isComponentPlugin, isRoutePlugin, isServicePlugin } = await import('./PluginRegistry')

      const componentPlugin: CAPPlugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        pluginType: 'component',
        install: vi.fn(),
      }

      const routePlugin: CAPPlugin = {
        id: 'test-plugin-2',
        name: 'Test Plugin 2',
        version: '1.0.0',
        pluginType: 'route',
        install: vi.fn(),
      }

      expect(isComponentPlugin(componentPlugin)).toBe(true)
      expect(isComponentPlugin(routePlugin)).toBe(false)

      expect(isRoutePlugin(routePlugin)).toBe(true)
      expect(isRoutePlugin(componentPlugin)).toBe(false)
    })
  })
})

describe('globalPluginRegistry', () => {
  it('should be a singleton instance', () => {
    expect(globalPluginRegistry).toBeDefined()
    expect(globalPluginRegistry).toBe(globalPluginRegistry)
  })
})
