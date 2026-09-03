import React from 'react'
import { IAuthPlugin, IAuthRegistry } from '@cap/platform-core'
import TenantService from '@cap/platform-core/services/tenantService'

// Statically define the metadata and lazy load the implementations
const knownPlugins: Record<string, IAuthPlugin> = {
  'mfa-totp': {
    id: 'mfa-totp',
    name: 'auth.mfa.totp.title',
    type: 'secondary',
    ui: {
      loginOption: React.lazy(() =>
        import('../plugins/MFATOTPPlugin').then(m => ({
          default: m.MFATOTPPlugin.ui?.loginOption || (() => null)
        }))
      ),
      verificationView: React.lazy(() =>
        import('../plugins/MFATOTPPlugin').then(m => ({
          default: m.MFATOTPPlugin.ui?.verificationView || (() => null)
        }))
      ),
      setupView: React.lazy(() =>
        import('../plugins/MFATOTPPlugin').then(m => ({
          default: m.MFATOTPPlugin.ui?.setupView || (() => null)
        }))
      ),
    },
    handleChallenge: async (challengeData) => {
      const m = await import('../plugins/MFATOTPPlugin')
      return m.MFATOTPPlugin.handleChallenge(challengeData)
    }
  }
}

/**
 * AuthRegistry manages authentication-specific, tenant-gated plugins.
 * Unlike globalPluginRegistry, which handles generic application-wide plugins
 * (Service, Component, Route) and their lifecycle, AuthRegistry is specifically
 * for authentication plugins whose availability is restricted/gated by the active
 * tenant's configuration.
 */
class AuthRegistry implements IAuthRegistry {
  private dynamicPlugins: Map<string, IAuthPlugin> = new Map()

  register(plugin: IAuthPlugin) {
    if (knownPlugins[plugin.id]) {
      console.warn(
        `[AuthRegistry] Collision detected: plugin ID "${plugin.id}" is already statically defined. Skipping dynamic registration.`
      )
      return
    }
    if (this.dynamicPlugins.has(plugin.id)) {
      const existing = this.dynamicPlugins.get(plugin.id)
      throw new Error(
        `[AuthRegistry] Duplicate module id "${plugin.id}". ` +
        `Module IDs must be globally unique. ` +
        `Already registered by: ${existing?.type ?? 'unknown'}`
      )
    }
    this.dynamicPlugins.set(plugin.id, plugin)
  }

  getPlugin(id: string) {
    return this.activePlugins.find(p => p.id === id)
  }

  getPluginsByType(type: IAuthPlugin['type']) {
    return this.activePlugins.filter(p => p.type === type)
  }

  /**
   * Independently verify whether a specific auth plugin is enabled for a given domain/tenant.
   * Provides backend-verifiable auth feature checking.
   */
  verifyPluginEnabled(pluginId: string, domain?: string): boolean {
    return TenantService.verifyTenantAuthFeature(domain, pluginId)
  }

  get activePlugins() {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
    const config = TenantService.getCachedTenant(hostname)
    // Note: Backend services independently enforce tenant feature gating via TenantService.verifyTenantAuthFeature.
    const enabledIds = config?.features?.enabledAuthPlugins || []

    const active: IAuthPlugin[] = []

    // 1. Gather active statically defined plugins
    for (const id of enabledIds) {
      if (knownPlugins[id]) {
        active.push(knownPlugins[id])
      }
    }

    // 2. Gather active dynamically registered plugins
    for (const [id, plugin] of this.dynamicPlugins.entries()) {
      if (enabledIds.includes(id) && !knownPlugins[id]) {
        active.push(plugin)
      }
    }

    return active
  }
}

export const authRegistry = new AuthRegistry()
