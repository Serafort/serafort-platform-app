import { Roles } from '@cap/shared-types'
import { PolicySet, PolicyEffectEnum } from '../types/policy.types'

/**
 * Baseline policy set installed at the composition root via
 * `installAuthorization`. Default-deny with an admin/super-admin bypass so
 * privileged principals are never blocked by a missing rule, while everyone
 * else is denied unless a module registers explicit policies.
 */
export const DEFAULT_POLICY_SET: PolicySet = {
  version: '1.0.0',
  defaultEffect: PolicyEffectEnum.DENY,
  policies: [
    {
      id: 'admin-route-guard-policy',
      description: 'Enforce minimum role ranks and allowed roles on routes',
      rules: [
        {
          effect: PolicyEffectEnum.DENY,
          resources: ['admin_route'],
          actions: ['access'],
          condition: { id: 'lacksMinimumRole' },
          priority: 120,
        },
        {
          effect: PolicyEffectEnum.DENY,
          resources: ['route', 'auth_route'],
          actions: ['access'],
          condition: { id: 'lacksAllowedRoles' },
          priority: 115,
        },
      ],
    },
    {
      id: 'admin-bypass',
      description: 'Admins and super-admins may perform any action on any resource',
      rules: [
        {
          effect: PolicyEffectEnum.ALLOW,
          roles: [
            Roles.ADMIN,
            Roles.SUPERADMIN,
            Roles.SUPERADMINEMPLOYEE,
            Roles.PROVIDERADMIN,
          ],
          actions: ['*'],
          resources: ['*'],
          priority: 100,
        },
      ],
    },
  ],
}

