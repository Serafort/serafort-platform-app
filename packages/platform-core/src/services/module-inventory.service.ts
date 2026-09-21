import type { ModuleStatusInfo } from '@cap/shared-types'
import { ModuleRegistry, summarizeModuleContributions } from '../assembly/ModuleRegistry'
import { isCoreModule, moduleEnablementService } from './module-enablement.service'

/** Install timestamps for modules registered after boot, keyed by module id. */
const runtimeInstalls = new Map<string, string>()

/**
 * Records that a module was registered at runtime rather than shipped in the
 * workspace, so Module Management can show when it arrived.
 */
export const markModuleInstalledAt = (moduleId: string, installedAt = new Date().toISOString()) => {
  runtimeInstalls.set(moduleId, installedAt)
}

/** `widget-studio-module` -> `Widget Studio Module`, used only when a module omits `name`. */
const prettifyId = (id: string): string =>
  id
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

/**
 * Live inventory of every module the shell knows about, read from the module
 * registry that `assembleApp` populates. Every count here is derived from the
 * module contracts themselves, so the screen cannot drift from the app.
 */
export class ModuleInventoryService {
  private get registry(): ModuleRegistry {
    return ModuleRegistry.getInstance()
  }

  public listModules(): ModuleStatusInfo[] {
    return this.registry
      .getModules()
      .map((module) => {
        const { routeCount, navCount, searchCount, locales } = summarizeModuleContributions(module)
        const enabled = moduleEnablementService.isEnabled(module.id)

        return {
          id: module.id,
          name: module.name || prettifyId(module.id),
          version: module.version,
          description: module.description,
          status: enabled ? 'active' : 'disabled',
          routeCount,
          navCount,
          searchCount,
          locales,
          isCore: isCoreModule(module.id),
          installedAt: runtimeInstalls.get(module.id),
        } satisfies ModuleStatusInfo
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  /**
   * Routes actually mounted in the router right now. This is not the sum of
   * the per-module counts: assembly de-duplicates paths across modules and
   * skips disabled ones, and this reports the result of that.
   */
  public countRegisteredRoutes(): number {
    return this.registry.extractRoutesAndNav((module) =>
      moduleEnablementService.isEnabled(module.id),
    ).allRouteConfigs.length
  }
}

export const moduleInventoryService = new ModuleInventoryService()
