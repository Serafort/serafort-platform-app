import {
  ConditionEvaluator,
  PolicySubject,
  PolicyResource,
} from "../types/policy.types";
import {
  getRoleRank,
  isPlatformRole,
  isTenantRole,
  normalizeRole,
} from "@cap/shared-types";

const conditionRegistry = new Map<string, ConditionEvaluator>();

/**
 * Register a custom condition evaluator for ABAC rules.
 */
export function registerCondition(
  id: string,
  evaluator: ConditionEvaluator,
): void {
  conditionRegistry.set(id, evaluator);
}

/**
 * Retrieve a registered condition evaluator.
 */
export function getCondition(id: string): ConditionEvaluator | undefined {
  return conditionRegistry.get(id);
}

// -------------------------------------------------------------
// Built-in Condition Evaluators
// -------------------------------------------------------------

// Ownership
registerCondition(
  "owns",
  (subject: PolicySubject, resource: PolicyResource) => {
    if (!resource.attributes) return false;
    const ownerId =
      resource.attributes.ownerId ??
      resource.attributes.userId ??
      resource.attributes.createdBy;
    return String(subject.id) === String(ownerId);
  },
);

// Same Organization / Tenant
registerCondition(
  "sameOrg",
  (subject: PolicySubject, resource: PolicyResource) => {
    const resourceOrg =
      resource.attributes?.orgId ??
      resource.attributes?.organizationId ??
      resource.attributes?.tenantId;
    // If resource has no org scoping specified, allow
    if (resourceOrg === undefined) return true;

    const subjectOrg =
      subject.attributes?.orgId ??
      subject.attributes?.organizationId ??
      subject.activeTenantId;
    if (subjectOrg === undefined) return false;
    return String(subjectOrg) === String(resourceOrg);
  },
);

// Constant evaluators
registerCondition("always", () => true);
registerCondition("never", () => false);

// Platform Plane checks
registerCondition("isPlatformUser", (subject: PolicySubject) => {
  if (subject.attributes?.isPlatform === true || subject.plane === "platform")
    return true;
  return subject.roles.some((r) => isPlatformRole(r));
});

registerCondition("isTenantUser", (subject: PolicySubject) => {
  if (subject.plane === "tenant") return true;
  return subject.roles.some((r) => isTenantRole(r));
});

registerCondition(
  "isTenantOwner",
  (subject: PolicySubject, resource: PolicyResource) => {
    // Check if subject holds tenant_owner role
    if (subject.roles.includes("tenant_owner")) return true;
    // Check active membership owner flag
    if (subject.memberships && subject.activeTenantId) {
      const mem = subject.memberships.find(
        (m) => String(m.orgId) === String(subject.activeTenantId),
      );
      if (mem?.isOwner || normalizeRole(mem?.role) === "tenant_owner")
        return true;
    }
    // Check resource ownerId match
    if (
      resource.attributes?.ownerId &&
      String(subject.id) === String(resource.attributes.ownerId)
    )
      return true;
    return false;
  },
);

// Impersonation guards
registerCondition("isNotImpersonating", (subject: PolicySubject) => {
  return !subject.attributes?.isImpersonating && !subject.impersonationSession;
});

registerCondition("isImpersonating", (subject: PolicySubject) => {
  return (
    !!subject.attributes?.isImpersonating || !!subject.impersonationSession
  );
});

registerCondition("isNotImpersonationReadOnly", (subject: PolicySubject) => {
  if (!subject.attributes?.isImpersonating && !subject.impersonationSession)
    return true;
  return (
    subject.attributes?.impersonationReadOnly !== true &&
    subject.impersonationSession?.readOnly !== true
  );
});

// MFA verification condition
registerCondition("isMfaVerified", (subject: PolicySubject) => {
  return subject.attributes?.mfaVerified === true;
});

// Role & Rank evaluation conditions using @cap/shared-types getRoleRank
registerCondition(
  "hasMinimumRole",
  (subject: PolicySubject, resource: PolicyResource) => {
    const minimumRole = resource.attributes?.minimumRole;
    if (!minimumRole) return true;

    const minRank = getRoleRank(minimumRole);
    const userRanks = subject.roles.map((r) => getRoleRank(r));
    const maxUserRank = Math.max(0, ...userRanks);

    return maxUserRank >= minRank;
  },
);

registerCondition(
  "lacksMinimumRole",
  (subject: PolicySubject, resource: PolicyResource) => {
    const minimumRole = resource.attributes?.minimumRole;
    if (!minimumRole) return false;

    const minRank = getRoleRank(minimumRole);
    const userRanks = subject.roles.map((r) => getRoleRank(r));
    const maxUserRank = Math.max(0, ...userRanks);

    return maxUserRank < minRank;
  },
);

registerCondition(
  "hasAllowedRoles",
  (subject: PolicySubject, resource: PolicyResource) => {
    const allowedRoles = resource.attributes?.allowedRoles as
      | unknown[]
      | undefined;
    if (!allowedRoles || allowedRoles.length === 0) return true;

    const normalizedAllowed = allowedRoles
      .map((r) => normalizeRole(r))
      .filter(Boolean) as string[];
    return subject.roles.some((r) => normalizedAllowed.includes(r));
  },
);

registerCondition(
  "lacksAllowedRoles",
  (subject: PolicySubject, resource: PolicyResource) => {
    const allowedRoles = resource.attributes?.allowedRoles as
      | unknown[]
      | undefined;
    if (!allowedRoles || allowedRoles.length === 0) return false;

    const normalizedAllowed = allowedRoles
      .map((r) => normalizeRole(r))
      .filter(Boolean) as string[];
    return !subject.roles.some((r) => normalizedAllowed.includes(r));
  },
);
