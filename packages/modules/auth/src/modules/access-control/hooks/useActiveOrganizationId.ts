import { useAppStore } from '@cap/platform-store'

/**
 * The organization every access-control call is scoped to.
 *
 * The NFC routes take an `:orgId` path segment, so the screens need one before
 * they can fetch anything. It is resolved from the authenticated session, never
 * from the URL: an operator must not be able to read another tenant's badge
 * inventory by editing an id in the address bar. The backend scopes its queries
 * independently, so this is defence in depth rather than the only control — but
 * taking the id from the URL would make the frontend the weaker of the two.
 *
 * The precedence matches `authorization.service`: the explicitly switched
 * tenant wins, then the user's own organization. Returns null when no
 * organization can be resolved, which the screens render as an explanation
 * rather than firing a request at `/organizations/null/…`.
 */
export function useActiveOrganizationId(): string | number | null {
  return useAppStore((state: any) => {
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
