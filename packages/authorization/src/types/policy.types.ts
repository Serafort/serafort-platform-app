import type {
  RolePlane,
  TenantMembership,
  ImpersonationSession,
} from "@cap/shared-types";

/**
 * Subject = the acting principal (current user)
 */
export interface PolicySubject {
  id: string | number;
  roles: string[]; // normalized role slugs
  permissions: string[]; // flat string permissions
  attributes: Record<string, unknown>; // arbitrary ABAC attrs (org, tier, etc.)
  plane?: RolePlane; // platform vs tenant plane
  activeTenantId?: string | number | null;
  memberships?: TenantMembership[];
  impersonationSession?: ImpersonationSession | null;
}

/** Resource being accessed */
export interface PolicyResource {
  type: string; // e.g. 'user', 'document', 'invoice', 'tenant'
  id?: string | number;
  attributes?: Record<string, unknown>;
}

/** Standard policy actions across platform and tenant operations */
export enum PolicyActionEnum {
  READ = "read",
  WRITE = "write",
  DELETE = "delete",
  ACCESS = "access",
  CREATE = "create",
  UPDATE = "update",
  EXECUTE = "execute",
  MANAGE = "manage",
  IMPERSONATE = "impersonate",
  TRANSFER = "transfer",
  CONFIGURE_SSO = "configure_sso",
  MANAGE_API_KEYS = "manage_api_keys",
  AUDIT = "audit",
}

/** The action being attempted */
export type PolicyAction = PolicyActionEnum | (string & {});

/** Effect of a rule */
export enum PolicyEffectEnum {
  ALLOW = "allow",
  DENY = "deny",
}
export type PolicyEffect = `${PolicyEffectEnum}`;

/** A single ABAC condition evaluator ID + args */
export interface PolicyCondition {
  id: string; // registered condition name, e.g. 'owns', 'sameOrg', 'isPlatformUser'
  args?: Record<string, unknown>;
}

/** Evaluator signature for custom condition handlers */
export type ConditionEvaluator = (
  subject: PolicySubject,
  resource: PolicyResource,
  args?: Record<string, unknown>,
) => boolean;

/** A single policy rule */
export interface PolicyRule {
  effect: PolicyEffect;
  roles?: string[]; // RBAC: match if subject has any of these roles
  permissions?: string[]; // RBAC: match if subject has any of these permissions
  actions?: PolicyAction[]; // match if action is in this list (undefined = any)
  resources?: string[]; // match if resource.type is in this list (undefined = any)
  condition?: PolicyCondition; // ABAC: additional condition that must pass
  priority?: number; // higher = evaluated first (default 0); deny takes precedence at equal priority
}

/** Named, reusable policy */
export interface Policy {
  id: string;
  description?: string;
  rules: PolicyRule[];
}

/** The complete set of policies the engine evaluates */
export interface PolicySet {
  version: string;
  policies: Policy[];
  defaultEffect: PolicyEffect; // what to return when no rule matches
}

/** Evaluation input */
export interface PolicyEvaluationContext {
  subject: PolicySubject;
  resource: PolicyResource;
  action: PolicyAction;
  environment?: Record<string, unknown>; // time, IP, etc.
}

/** Evaluation result */
export interface PolicyDecision {
  effect: PolicyEffect;
  matchedPolicyId?: string;
  matchedRuleIndex?: number;
  reason?: string;
}
