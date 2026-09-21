import { useAppStore } from '@cap/platform-store'

/** The slice of the session store this hook reads. Deliberately narrower than the full store. */
interface ActiveOrgSource {
  activeTenantId?: string | number | null
  user?: ActiveOrgUser & { user?: ActiveOrgUser }
}

interface ActiveOrgUser {
  activeTenantId?: string | number | null
  organizationId?: string | number | null
  orgId?: string | number | null
  tenantId?: string | number | null
}

/**
 * The organization an organization-scoped call is issued for.
 *
 * Organization-scoped admin screens -- the NFC badge inventory, the domain
 * verification registry -- need one before they can fetch anything. It is
 * resolved from the authenticated session, never from the URL: an operator must
 * not be able to read another tenant's records by editing an id in the address
 * bar. The backend scopes its queries
 * independently, so this is defence in depth rather than the only control — but
 * taking the id from the URL would make the frontend the weaker of the two.
 *
 * The precedence matches `authorization.service`: the explicitly switched
 * tenant wins, then the user's own organization. Returns null when no
 * organization can be resolved, which the screens render as an explanation
 * rather than firing a request at `/organizations/null/…`.
 */
export function useActiveOrganizationId(): string | number | null {
  return useAppStore((store) => {
    const state = store as unknown as ActiveOrgSource
    const user = state?.user?.user ?? state?.user
    return (
      state?.activeTenantId ??
      user?.activeTenantId ??
      user?.organizationId ??
      user?.orgId ??
      user?.tenantId ??
      null
    )
  })
}
