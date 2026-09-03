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

/**
 * Role names arrive capitalised from /api/v1/auth/* ("Participant", "Admin"),
 * while the lists here are written lower case, so string comparison is folded.
 * Numeric role ids are compared as they are.
 */
const roleMatches = (
  userRole: Roles | string | number,
  candidates: (Roles | string | number)[],
): boolean =>
  candidates.some((candidate) =>
    typeof candidate === 'string' && typeof userRole === 'string'
      ? candidate.toLowerCase() === userRole.toLowerCase()
      : candidate === userRole,
  )

export const resolveRedirectPathForUser = (userRole?: Roles | string | number): string => {
  if (userRole && roleMatches(userRole, ADMIN_ROLES)) {
    return Path.admin.users
  }
  if (userRole && roleMatches(userRole, [Roles.PARTICIPANT, 'participant'])) {
    return '/provider'
  }
  return '/auth/account'
}
