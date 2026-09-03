import i18next from 'i18next'
import type { CAPModule, SearchItemConfig, NavItemConfig, ModuleRouteConfig } from '@cap/shared-types'
import { registerDictionary } from '../i18n/registry'

export type AuthRouteConfig = ModuleRouteConfig & {
  element: React.JSX.Element
}

/**
 * Singleton ModuleRegistry for encapsulating dynamic module registration,
 * i18n bundles, search items, and route configuration discovery.
 */
export class ModuleRegistry {
  private static instance: ModuleRegistry
  private modulesMap = new Map<string, CAPModule>()
  private searchItems: SearchItemConfig[] = []
  private seenSearchIds = new Set<string>()

  public static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry()
    }
    return ModuleRegistry.instance
  }

  /**
   * Resets all internal module registries (useful for tests and HMR).
   */
  public reset(): void {
    this.modulesMap.clear()
    this.searchItems = []
    this.seenSearchIds.clear()
  }

  /**
   * Registers a single CAPModule, initializing its i18n resource bundles and search index.
   */
  public registerModule(module: CAPModule): void {
    const key = module.id || (module as any).name || `module_${this.modulesMap.size}`
    if (this.modulesMap.has(key)) {
      return // Avoid redundant re-registration
    }

    this.modulesMap.set(key, module)

    // Register i18n dictionary
    if (module.i18n) {
      const moduleNs = module.id || (module as any).name || 'common'
      const i18nInstance = (i18next as any)?.default || i18next
      if (!i18nInstance.isInitialized && typeof i18nInstance.init === 'function') {
        i18nInstance.init({
          lng: 'en',
          fallbackLng: 'en',
          resources: {},
          interpolation: { escapeValue: false },
        })
      }
      registerDictionary(module.i18n as any)
      Object.entries(module.i18n).forEach(([lang, resources]) => {
        const langLower = lang.toLowerCase()
        i18nInstance.addResourceBundle(langLower, moduleNs, resources, true, true)
        i18nInstance.addResourceBundle(langLower, 'translation', resources, true, true)
        i18nInstance.addResourceBundle(langLower, 'common', resources, true, true)
      })
    }

    // Register search items
    if (module.searchItems) {
      module.searchItems.forEach((item) => {
        if (!this.seenSearchIds.has(item.id)) {
          this.seenSearchIds.add(item.id)
          this.searchItems.push(item)
        }
      })
    }
  }

  /**
   * Returns all currently registered CAP modules.
   */
  public getModules(): CAPModule[] {
    return Array.from(this.modulesMap.values())
  }

  /**
   * Returns all registered search items across modules.
   */
  public getSearchItems(): SearchItemConfig[] {
    return [...this.searchItems]
  }

  /**
   * Extracts route configs and nav items from all registered modules.
   */
  public extractRoutesAndNav(): {
    allRouteConfigs: AuthRouteConfig[]
    routeNavItems: NavItemConfig[]
    navItemsToRegister: NavItemConfig[][]
  } {
    const modules = this.getModules()
    const allRouteConfigs: AuthRouteConfig[] = []
    const seenPaths = new Set<string>()
    const routeNavItems: NavItemConfig[] = []
    const navItemsToRegister: NavItemConfig[][] = []

    modules.forEach((module) => {
      if (module.navItems) {
        navItemsToRegister.push(module.navItems)
      }

      const routesToRegister = module.routes || module.authRouteConfig
      if (routesToRegister) {
        routesToRegister.forEach((route: any) => {
          if (route && route.path && !seenPaths.has(route.path)) {
            seenPaths.add(route.path)
            allRouteConfigs.push(route)

            // Auto-extract nav item from route if it has nav properties
            if (route.variant || route.roles || route.guestOnly || route.icon) {
              routeNavItems.push({
                id: route.id || route.path,
                label: route.label || route.path,
                path: route.path,
                icon: route.icon,
                section: route.section,
                roles: route.roles,
                permissions: route.permissions,
                guestOnly: route.guestOnly,
                variant: route.variant,
                order: route.order,
              })
            }
          }
        })
      }
    })

    return { allRouteConfigs, routeNavItems, navItemsToRegister }
  }
}
