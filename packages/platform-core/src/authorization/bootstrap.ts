import {
  DEFAULT_POLICY_SET,
  policyEngine,
  createFetchApiAuthEnforcer,
  type PolicyResource,
} from '@cap/authorization'
import { onBeforeRequest, type FetchRequestConfig } from '@cap/platform-store'

/**
 * Maps admin API endpoints to policy resource types so the API enforcement
 * layer can evaluate requests against the policy engine. Scoped to the RBAC
 * admin surface only; unmatched endpoints pass through unguarded (the server
 * remains the authoritative gate for everything else).
 */
export const defaultResourceMapper = (
  endpoint: string,
  _config: FetchRequestConfig,
): PolicyResource | undefined => {
  if (endpoint.startsWith('/api/admin/rbac/roles')) return { type: 'role' }
  if (endpoint.startsWith('/api/admin/rbac/permissions')) return { type: 'permission' }
  if (
    endpoint.startsWith('/api/admin/rbac/users') ||
    endpoint.startsWith('/api/admin/rbac/members')
  ) {
    return { type: 'membership' }
  }
  if (endpoint.startsWith('/api/admin/users')) return { type: 'user' }
  if (endpoint.startsWith('/api/admin/clients')) return { type: 'oidc-client' }
  return undefined
}

export interface InstallAuthorizationOptions {
  /** Block denied admin requests before they hit the network (default: true) */
  optimisticDeny?: boolean
  /** Override the default endpoint -> resource mapping */
  getResource?: (endpoint: string, config: FetchRequestConfig) => PolicyResource | undefined
}

let installed = false

/**
 * Composition-root wiring for the client-side authorization layer:
 * 1. Seeds the policy engine with the baseline default-deny + admin-bypass set.
 * 2. Registers the fetch-based API enforcer on the shared `apiClient`.
 *
 * Safe to call once per app session (idempotent; re-installation is a no-op).
 */
export const installAuthorization = (options: InstallAuthorizationOptions = {}): void => {
  if (installed) return
  installed = true

  policyEngine.setPolicySet(DEFAULT_POLICY_SET)

  const enforcer = createFetchApiAuthEnforcer({
    optimisticDeny: options.optimisticDeny ?? true,
    getResource: options.getResource || defaultResourceMapper,
  })

  onBeforeRequest(enforcer.beforeRequest)
}

export const _resetAuthorizationInstalledStateForTest = (): void => {
  installed = false
}
