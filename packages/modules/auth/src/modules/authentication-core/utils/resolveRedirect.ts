import { Roles } from '@cap/platform-core'
import { Path } from '../../../routes/path'

const ADMIN_ROLES: (Roles | string | number)[] = [
  Roles.ADMIN,
  Roles.SUPERADMINEMPLOYEE,
  Roles.SUPERADMIN,
  'admin',
  'super_admin',
  'super_admin_employee',
  1,
]

export const resolveRedirectPathForUser = (userRole?: Roles | string | number): string => {
  if (userRole && ADMIN_ROLES.includes(userRole)) {
    return Path.admin.users
  }
  if (userRole === Roles.PARTICIPANT || userRole === 'participant') {
    return '/provider'
  }
  return '/auth/account'
}

