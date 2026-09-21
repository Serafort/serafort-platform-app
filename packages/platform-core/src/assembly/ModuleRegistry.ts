import i18next from 'i18next'
import type {
  CAPModule,
  SearchItemConfig,
  NavItemConfig,
  ModuleRouteConfig,
} from '@cap/shared-types'
import { registerDictionary } from '../i18n/registry'

export type AuthRouteConfig = ModuleRouteConfig & {
  element: React.JSX.Element
}

/** Predicate deciding which registered modules contribute routes and navigation. */
export type ModuleFilter = (module: CAPModule) => boolean

/**
 * A route carries navigation metadata when it declares any of the fields the
 * shell menu reads. Kept as one exported rule so route extraction and the
 * per-module counts shown in Module Management can never drift apart.
 */
export const routeDeclaresNavItem = (route: {
  variant?: unknown
  roles?: unknown
  guestOnly?: unknown
  icon?: unknown
}): boolean => Boolean(route.variant || route.roles || route.guestOnly || route.icon)

/** What a single module contributes to the assembled shell. */
export interface ModuleContributions {
  routeCount: number
  navCount: number
  searchCount: number
  locales: string[]
}

/**
 * Counts what one module declares, using the same rules `extractRoutesAndNav`
 * applies. Route paths are de-duplicated within the module; collisions against
 * *other* modules are resolved at assembly time and so are not counted here.
 */
export const summarizeModuleContributions = (module: CAPModule): ModuleContributions => {
  const routes = module.routes || module.authRouteConfig || []
  const seenPaths = new Set<string>()
  let navFromRoutes = 0

  routes.forEach((route) => {
    if (!route?.path || seenPaths.has(route.path)) return
    seenPaths.add(route.path)
    if (routeDeclaresNavItem(route)) navFromRoutes += 1
  })

  return {
    routeCount: seenPaths.size,
    navCount: (module.navItems?.length ?? 0) + navFromRoutes,
    searchCount: module.searchItems?.length ?? 0,
    locales: module.i18n ? Object.keys(module.i18n).map((lang) => lang.toLowerCase()).sort() : [],
  }
}

/**
 * Singleton ModuleRegistry for encapsulating dynamic module registration,
 * i18n bundles, search items, and route configuration discovery.
 */
export class ModuleRegistry {
  private static instance: ModuleRegistry
  private modulesMap = new Map<string, CAPModule>()

  public static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) ModuleRegistry.instance = new ModuleRegistry()
    return ModuleRegistry.instance
  }

  /**
   * Resets all internal module registries (useful for tests and HMR).
   */
  public reset(): void {
    this.modulesMap.clear()
  }

  /**
   * Registers a single CAPModule, initializing its i18n resource bundles and search index.
   */
  public registerModule(module: CAPModule): void {
    const key = module.id || (module as any).name || `module_${this.modulesMap.size}`
    if (this.modulesMap.has(key)) return // Avoid redundant re-registration
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

  }

  /**
   * Returns all currently registered Serafort modules.
   */
  public getModules(): CAPModule[] {
    return Array.from(this.modulesMap.values())
  }

  /**
   * Returns the command-palette items contributed by registered modules,
   * de-duplicated by id. Computed on read rather than accumulated at
   * registration time so that a module switched off stops offering results
   * for routes the router no longer has.
   */
  public getSearchItems(include?: ModuleFilter): SearchItemConfig[] {
    const modules = include ? this.getModules().filter(include) : this.getModules()
    const seenIds = new Set<string>()
    const items: SearchItemConfig[] = []

    modules.forEach((module) => {
      module.searchItems?.forEach((item) => {
        if (seenIds.has(item.id)) return
        seenIds.add(item.id)
        items.push(item)
      })
    })

    return items
  }

  /**
   * Extracts route configs and nav items from registered modules.
   *
   * @param include Optional predicate; modules it rejects stay registered (so
   * they remain listable and re-enableable) but contribute nothing to the
   * router or the menu.
   */
  public extractRoutesAndNav(include?: ModuleFilter): {
    allRouteConfigs: AuthRouteConfig[]
    routeNavItems: NavItemConfig[]
    navItemsToRegister: NavItemConfig[][]
  } {
    const modules = include ? this.getModules().filter(include) : this.getModules()
    const allRouteConfigs: AuthRouteConfig[] = []
    const seenPaths = new Set<string>()
    const routeNavItems: NavItemConfig[] = []
    const navItemsToRegister: NavItemConfig[][] = []

    modules.forEach((module) => {
      if (module.navItems) navItemsToRegister.push(module.navItems)

      const routesToRegister = module.routes || module.authRouteConfig
      if (routesToRegister) {
        routesToRegister.forEach((route: any) => {
          if (route && route.path && !seenPaths.has(route.path)) {
            seenPaths.add(route.path)
            allRouteConfigs.push(route)

            // Auto-extract nav item from route if it has nav properties
            if (routeDeclaresNavItem(route)) {
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
