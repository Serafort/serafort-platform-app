import { Roles } from '@cap/platform-core'
import { Path } from '@cap/module-auth/routes/path'

const ADMIN_ROLES: Roles[] = [Roles.ADMIN, Roles.SUPERADMINEMPLOYEE, Roles.SUPERADMIN]

export const resolveRedirectPathForUser = (userRole?: Roles): string => {
  if (userRole && ADMIN_ROLES.includes(userRole)) {
    return Path.admin.users
  }
  if (userRole === Roles.PARTICIPANT) {
    return '/provider'
  }
  return '/auth/account'
}
