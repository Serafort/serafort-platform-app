import type {
  CAPPlugin,
  PluginRegistry as IPluginRegistry,
  PluginLifecycleState,
  PluginInstallContext,
  PluginUninstallContext,
  ServicePlugin,
  ComponentPlugin,
  RoutePlugin,
  RouteRegistration,
  HybridPlugin,
  ComponentType,
  PluginMetadata,
} from '@cap/shared-types'

/**
 * Plugin output tracking for services only
 */
interface PluginOutputs {
  services: string[]
}

/**
 * Track which plugins own each service (for proper cleanup)
 */
interface ServiceOwnership {
  services: Map<string, Set<string>>
}

/**
 * Plugin Registry Implementation
 *
 * Manages the lifecycle of ServicePlugins including registration, installation,
 * and uninstallation. Provides methods to access registered services.
 *
 * Note: This registry currently supports ServicePlugin only. Other plugin types
 * (ComponentPlugin, RoutePlugin, I18nPlugin, HybridPlugin) are defined in contracts
 * but not implemented here as they're not currently used.
 */
class PluginRegistryImpl implements IPluginRegistry {
  private plugins: Map<string, CAPPlugin> = new Map()
  private pluginStates: Map<string, PluginLifecycleState> = new Map()
  private pluginOutputs: Map<string, PluginOutputs> = new Map()
  private services: Map<string, unknown> = new Map()
  private components: Map<string, ComponentType> = new Map()
  private routes: Map<string, RouteRegistration[]> = new Map()

  private serviceOwnership: ServiceOwnership = {
    services: new Map(),
  }

  private componentOwnership: {
    components: Map<string, Set<string>>
  } = {
    components: new Map(),
  }

  /**
   * Register a plugin and install it
   */
  async register(plugin: CAPPlugin): Promise<void> {
    if (this.plugins.has(plugin.id)) {
      const existing = this.plugins.get(plugin.id)
      throw new Error(
        `[PluginRegistry] Plugin "${plugin.id}" is already registered. ` +
          `Plugin IDs must be unique. ` +
          `Already registered: ${existing?.name ?? 'unknown'}`,
      )
    }

    if (plugin.dependencies?.length) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(
            `[PluginRegistry] Plugin "${plugin.id}" requires dependency "${dep}" which is not registered.`,
          )
        }
      }
    }

    this.plugins.set(plugin.id, plugin)
    this.pluginStates.set(plugin.id, 'installing')

    try {
      const context: PluginInstallContext = {
        moduleId: 'global',
        registry: this as unknown as IPluginRegistry,
        config: {},
        getPlugin: <T extends CAPPlugin = CAPPlugin>(id: string): T | undefined =>
          this.getPlugin<T>(id),
      }

      await plugin.install(context)

      if (plugin.pluginType === 'service') {
        this.registerServices((plugin as ServicePlugin).services, plugin.id)
      } else if (plugin.pluginType === 'component') {
        this.registerComponents((plugin as ComponentPlugin).components, plugin.id)
      } else if (plugin.pluginType === 'route') {
        this.registerRoutes(
          (plugin as RoutePlugin).routes,
          (plugin as RoutePlugin).routePrefix,
          plugin.id,
        )
      } else if (plugin.pluginType === 'hybrid') {
        this.registerServices((plugin as HybridPlugin).services || {}, plugin.id)
        this.registerComponents((plugin as HybridPlugin).components || {}, plugin.id)
        this.registerRoutes(
          (plugin as HybridPlugin).routes || [],
          (plugin as HybridPlugin).routePrefix,
          plugin.id,
        )
      }

      this.pluginStates.set(plugin.id, 'active')
      plugin.onStateChange?.('active')
    } catch (error) {
      this.pluginStates.set(plugin.id, 'error')
      plugin.onStateChange?.('error', error instanceof Error ? error : new Error(String(error)))

      this.plugins.delete(plugin.id)
      throw error
    }
  }

  private registerServices(services: Record<string, unknown> | undefined, pluginId: string): void {
    if (!services) return
    const outputs: PluginOutputs = { services: [] }

    for (const [name, service] of Object.entries(services)) {
      if (this.services.has(name)) {
        console.warn(`[PluginRegistry] Service "${name}" is being overwritten`)
      }
      this.services.set(name, service)
      outputs.services.push(name)

      if (!this.serviceOwnership.services.has(name)) {
        this.serviceOwnership.services.set(name, new Set())
      }
      this.serviceOwnership.services.get(name)!.add(pluginId)
    }

    this.pluginOutputs.set(pluginId, outputs)
  }

  private registerComponents(
    components: Record<string, ComponentType> | undefined,
    pluginId: string,
  ): void {
    if (!components) return

    for (const [name, component] of Object.entries(components)) {
      if (this.components.has(name)) {
        console.warn(`[PluginRegistry] Component "${name}" is being overwritten`)
      }
      this.components.set(name, component)

      if (!this.componentOwnership.components.has(name)) {
        this.componentOwnership.components.set(name, new Set())
      }
      this.componentOwnership.components.get(name)!.add(pluginId)
    }
  }

  private registerRoutes(
    routes: RouteRegistration[] | undefined,
    routePrefix: string | undefined,
    pluginId: string,
  ): void {
    if (!routes) return
    const formattedRoutes = routes.map((route) => {
      let path = route.path
      if (routePrefix) {
        const cleanPrefix = routePrefix.endsWith('/') ? routePrefix.slice(0, -1) : routePrefix
        const cleanPath = path.startsWith('/') ? path : '/' + path
        path = cleanPrefix + cleanPath
      }
      return {
        ...route,
        path,
      }
    })
    this.routes.set(pluginId, formattedRoutes)
  }

  /**
   * Unregister a plugin
   */
  async unregister(id: string): Promise<void> {
    const plugin = this.plugins.get(id)
    if (!plugin) {
      return
    }

    const state = this.pluginStates.get(id)
    if (state === 'installing') {
      throw new Error(`[PluginRegistry] Cannot uninstall plugin "${id}" while installing`)
    }

    try {
      if (plugin.uninstall) {
        const context: PluginUninstallContext = {
          moduleId: 'global',
          registry: this as unknown as IPluginRegistry,
        }
        await plugin.uninstall(context)
      }

      this.cleanupPluginOutputs(plugin)

      this.plugins.delete(id)
      this.pluginStates.set(id, 'uninstalled')
      plugin.onStateChange?.('uninstalled')
    } catch (error) {
      console.error(`[PluginRegistry] Error uninstalling plugin "${id}":`, error)
      throw error
    }
  }

  private cleanupPluginOutputs(plugin: CAPPlugin): void {
    const outputs = this.pluginOutputs.get(plugin.id)
    if (outputs) {
      for (const name of outputs.services) {
        const owners = this.serviceOwnership.services.get(name)
        if (owners) {
          owners.delete(plugin.id)
          if (owners.size === 0) {
            this.services.delete(name)
            this.serviceOwnership.services.delete(name)
          }
        } else {
          this.services.delete(name)
        }
      }
      this.pluginOutputs.delete(plugin.id)
    }

    // Cleanup components
    const componentsToRemove: string[] = []
    for (const [name, owners] of this.componentOwnership.components.entries()) {
      if (owners.has(plugin.id)) {
        owners.delete(plugin.id)
        if (owners.size === 0) {
          componentsToRemove.push(name)
        }
      }
    }
    for (const name of componentsToRemove) {
      this.components.delete(name)
      this.componentOwnership.components.delete(name)
    }

    // Cleanup routes
    this.routes.delete(plugin.id)
  }

  getPlugin<T extends CAPPlugin = CAPPlugin>(id: string): T | undefined {
    return this.plugins.get(id) as T | undefined
  }

  getAllPlugins(): CAPPlugin[] {
    return Array.from(this.plugins.values())
  }

  getPluginsByType<T extends CAPPlugin['pluginType']>(
    type: T,
  ): Extract<CAPPlugin, { pluginType: T }>[] {
    return Array.from(this.plugins.values()).filter((p) => p.pluginType === type) as Extract<
      CAPPlugin,
      { pluginType: T }
    >[]
  }

  getPluginsByCategory(category: PluginMetadata['category']): CAPPlugin[] {
    return Array.from(this.plugins.values()).filter((p) => p.category === category)
  }

  hasPlugin(id: string): boolean {
    return this.plugins.has(id)
  }

  getPluginState(id: string): PluginLifecycleState | undefined {
    return this.pluginStates.get(id)
  }

  getServices(): Record<string, unknown> {
    return Object.fromEntries(this.services.entries())
  }

  getService<T = unknown>(name: string): T | undefined {
    return this.services.get(name) as T | undefined
  }

  getComponents(): Record<string, ComponentType> {
    return Object.fromEntries(this.components.entries())
  }

  getComponent<T = ComponentType>(name: string): T | undefined {
    return this.components.get(name) as T | undefined
  }

  registerComponent(name: string, component: ComponentType): void {
    if (this.components.has(name)) {
      console.warn(`[PluginRegistry] Component ${name} is already registered. Overwriting.`)
    }
    this.components.set(name, component)
  }

  getRoutes(): RouteRegistration[] {
    return Array.from(this.routes.values()).flat()
  }

  clear(): void {
    this.plugins.clear()
    this.pluginStates.clear()
    this.pluginOutputs.clear()
    this.services.clear()
    this.components.clear()
    this.routes.clear()
    this.serviceOwnership.services.clear()
    this.componentOwnership.components.clear()
  }

  getStats(): {
    totalPlugins: number
    activePlugins: number
    services: number
    components: number
    routes: number
  } {
    let activePlugins = 0
    for (const state of this.pluginStates.values()) {
      if (state === 'active') activePlugins++
    }

    return {
      totalPlugins: this.plugins.size,
      activePlugins,
      services: this.services.size,
      components: this.components.size,
      routes: this.getRoutes().length,
    }
  }
}

/**
 * globalPluginRegistry acts as the generic, application-wide plugin registry.
 * It manages the lifecycle, installation, and uninstallation of Service, Component,
 * Route, and Hybrid plugins across the application.
 *
 * This differs from `authRegistry`, which is specialized for authentication-specific
 * plugins and gates active plugins based on the active tenant configuration.
 */
export const globalPluginRegistry = new PluginRegistryImpl()

export const createPluginRegistry = (): PluginRegistryImpl => {
  return new PluginRegistryImpl()
}

export const isServicePlugin = (plugin: CAPPlugin): plugin is ServicePlugin =>
  plugin.pluginType === 'service'

export const isComponentPlugin = (plugin: CAPPlugin): plugin is ComponentPlugin =>
  plugin.pluginType === 'component'

export const isRoutePlugin = (plugin: CAPPlugin): plugin is RoutePlugin =>
  plugin.pluginType === 'route'
