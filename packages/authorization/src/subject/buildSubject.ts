import { PolicySubject } from "../types/policy.types";
import {
  normalizeRole,
  hasAdminRole,
  isPlatformRole,
  getRoleDefinition,
  RolePlane,
  TenantMembership,
  ImpersonationSession,
} from "@cap/shared-types";

/**
 * Normalizes user state from `@cap/platform-store` into a standardized `PolicySubject`.
 * Seamlessly resolves two-plane roles (System Plane vs Tenant Plane), active tenant
 * memberships, dynamic permissions, and secure time-bound support impersonation.
 */
export function buildSubject(userRaw: any): PolicySubject | null {
  if (!userRaw) return null;

  const user = userRaw.user || userRaw;
  const activeTenantId =
    userRaw.activeTenantId ??
    user.activeTenantId ??
    user.organizationId ??
    user.orgId;
  const memberships: TenantMembership[] = Array.isArray(userRaw.memberships)
    ? userRaw.memberships
    : Array.isArray(user.memberships)
      ? user.memberships
      : [];

  // Check for active impersonation session
  const impersonationSession: ImpersonationSession | null =
    userRaw.impersonationSession || user.impersonationSession || null;

  const isImpersonatingActive =
    !!impersonationSession &&
    (!impersonationSession.expiresAt ||
      impersonationSession.expiresAt > Date.now());

  // Resolve base role
  let baseRole =
    normalizeRole(user.role) ||
    normalizeRole(user.roleObject) ||
    normalizeRole(user.roleName);
  let activeMembership: TenantMembership | undefined;

  if (activeTenantId && memberships.length > 0) {
    activeMembership = memberships.find(
      (m) => String(m.orgId) === String(activeTenantId),
    );
    if (activeMembership && !isPlatformRole(baseRole)) {
      const membershipRole = normalizeRole(activeMembership.role);
      if (membershipRole) {
        baseRole = membershipRole;
      }
    }
  }

  const roles: string[] = [];
  if (baseRole) roles.push(baseRole);

  // Super admin implicit role addition if admin role is detected
  if (hasAdminRole(baseRole) && !roles.includes("admin")) roles.push("admin");

  // Resolve plane
  const plane: RolePlane =
    user.plane || (isPlatformRole(baseRole) ? "platform" : "tenant");

  // Compute composite permissions
  const roleDef = getRoleDefinition(baseRole);
  const defaultPerms = roleDef?.defaultPermissions || [];
  const userPerms: string[] = Array.isArray(user.permissions)
    ? user.permissions
    : [];
  const membershipPerms: string[] =
    activeMembership && Array.isArray(activeMembership.permissions)
      ? activeMembership.permissions
      : [];

  const permissionsSet = new Set<string>([
    ...defaultPerms,
    ...userPerms,
    ...membershipPerms,
  ]);

  const effectiveOrgId = isImpersonatingActive
    ? impersonationSession.targetOrgId
    : activeTenantId ||
      user.organizationId ||
      user.orgId ||
      user.roleObject?.organizationId;

  const attributes: Record<string, unknown> = {
    ...(user.metadata || {}),
    email: user.email,
    status: user.status,
    orgId: effectiveOrgId,
    organizationId: effectiveOrgId,
    plane,
    isPlatform: plane === "platform" || isPlatformRole(baseRole),
    isImpersonating: isImpersonatingActive,
    impersonationSessionId: isImpersonatingActive
      ? impersonationSession.sessionId
      : undefined,
    impersonationReadOnly: isImpersonatingActive
      ? impersonationSession.readOnly
      : undefined,
    mfaVerified: !!(user.mfaEnabled || user.mfaVerified || user.isMfaVerified),
    tier: user.tier || user.metadata?.tier || "standard",
  };

  return {
    id: user.id ?? "anonymous",
    roles,
    permissions: Array.from(permissionsSet),
    attributes,
    plane,
    activeTenantId: effectiveOrgId,
    memberships,
    impersonationSession: isImpersonatingActive ? impersonationSession : null,
  };
}
