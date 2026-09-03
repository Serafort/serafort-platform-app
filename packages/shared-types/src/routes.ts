/**
 * Dynamic Route Registry Contracts (Tier 0 Foundation)
 * Provides type contracts and dynamic path resolution interfaces.
 * Routes are registered dynamically at runtime by feature modules ("Magnet Legos").
 */

export interface DynamicRouteDescriptor {
  id: string
  path: string
  moduleId?: string
  label?: string
  icon?: string
}

export type DynamicRouteRegistry = Record<string, DynamicRouteDescriptor>

/**
 * Fallback route resolver that looks up registered module paths dynamically,
 * falling back to default convention paths if a module has not registered a custom path.
 */
export const resolveDynamicPath = (
  registeredItems: Array<{ id?: string; path?: string }>,
  targetId: string,
  defaultPath: string
): string => {
  const match = registeredItems.find((item) => item.id === targetId || item.path === defaultPath)
  return match?.path || defaultPath
}

export const AppPaths = {
  account: {
    overview: '/auth/account',
    edit: '/auth/account/edit',
    settings: '/auth/account/settings',
  },
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
  admin: {
    users: '/admin/users',
    roles: '/admin/roles',
  },
  landing: {
    home: '/',
    pricing: '/pricing',
    about: '/about',
    contact: '/contact',
    termsOfService: '/terms-of-service',
    privacyPolicy: '/privacy-policy',
  },
} as const
