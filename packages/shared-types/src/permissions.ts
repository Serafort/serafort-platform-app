/**
 * @cap/shared-types — Atomic Permissions Catalog
 *
 * The smallest irreducible authorization units in theSerafort.
 * Every permission follows the strict `domain:resource:action` syntax.
 *
 * Usage:
 *   import { ATOMIC_PERMISSIONS, AtomicPermission, expandPermissions } from '@cap/shared-types'
 */

// ─────────────────────────────────────────────────────────────────────────────
// Atomic Permission Catalog
// ─────────────────────────────────────────────────────────────────────────────

export const ATOMIC_PERMISSIONS = {
  // ── Auth & Identity ──────────────────────────────────────────────────────
  AUTH: {
    SSO: {
      CONFIGURE: "auth:sso:configure" as const,
      READ: "auth:sso:read" as const,
      DELETE: "auth:sso:delete" as const,
    },
    SCIM: {
      PROVISION: "auth:scim:provision" as const,
      READ: "auth:scim:read" as const,
      DELETE: "auth:scim:delete" as const,
    },
    MFA: {
      ENFORCE: "auth:mfa:enforce" as const,
      CONFIGURE: "auth:mfa:configure" as const,
      READ: "auth:mfa:read" as const,
    },
    PASSKEY: {
      ENFORCE: "auth:passkey:enforce" as const,
      CONFIGURE: "auth:passkey:configure" as const,
      READ: "auth:passkey:read" as const,
    },
    SESSION: {
      READ: "auth:session:read" as const,
      REVOKE: "auth:session:revoke" as const,
    },
    IDP: {
      CREATE: "auth:idp:create" as const,
      READ: "auth:idp:read" as const,
      UPDATE: "auth:idp:update" as const,
      DELETE: "auth:idp:delete" as const,
    },
  },

  // ── Security & Compliance ─────────────────────────────────────────────────
  SECURITY: {
    AUDIT_LOGS: {
      READ: "security:audit_logs:read" as const,
      EXPORT: "security:audit_logs:export" as const,
    },
    ANOMALY: {
      READ: "security:anomaly:read" as const,
      CONFIGURE: "security:anomaly:configure" as const,
    },
    ABAC: {
      READ: "security:abac:read" as const,
      WRITE: "security:abac:write" as const,
      DELETE: "security:abac:delete" as const,
      EXECUTE: "security:abac:execute" as const,
    },
    THREATS: {
      READ: "security:threats:read" as const,
      CONFIGURE: "security:threats:configure" as const,
    },
  },

  // ── Theme & UI ────────────────────────────────────────────────────────────
  THEME: {
    TOKENS: {
      READ: "theme:tokens:read" as const,
      WRITE: "theme:tokens:write" as const,
    },
    AI: {
      GENERATE: "theme:ai:generate" as const,
      READ: "theme:ai:read" as const,
    },
    BRANDING: {
      READ: "theme:branding:read" as const,
      WRITE: "theme:branding:write" as const,
    },
    PRESET: {
      READ: "theme:preset:read" as const,
      WRITE: "theme:preset:write" as const,
      DELETE: "theme:preset:delete" as const,
    },
  },

  // ── Developer / Integrator ────────────────────────────────────────────────
  DEV: {
    API_KEYS: {
      CREATE: "dev:api_keys:create" as const,
      READ: "dev:api_keys:read" as const,
      REVOKE: "dev:api_keys:revoke" as const,
    },
    WEBHOOKS: {
      CREATE: "dev:webhooks:create" as const,
      READ: "dev:webhooks:read" as const,
      UPDATE: "dev:webhooks:update" as const,
      DELETE: "dev:webhooks:delete" as const,
    },
    SANDBOX: {
      EXECUTE: "dev:sandbox:execute" as const,
      READ: "dev:sandbox:read" as const,
    },
    PLUGINS: {
      INSTALL: "dev:plugins:install" as const,
      READ: "dev:plugins:read" as const,
      UNINSTALL: "dev:plugins:uninstall" as const,
    },
  },

  // ── Organization ─────────────────────────────────────────────────────────
  ORG: {
    MEMBERS: {
      INVITE: "org:members:invite" as const,
      READ: "org:members:read" as const,
      UPDATE: "org:members:update" as const,
      REMOVE: "org:members:remove" as const,
    },
    ROLES: {
      CREATE: "org:roles:create" as const,
      READ: "org:roles:read" as const,
      ASSIGN: "org:roles:assign" as const,
      DELETE: "org:roles:delete" as const,
    },
    DOMAIN: {
      VERIFY: "org:domain:verify" as const,
      READ: "org:domain:read" as const,
      DELETE: "org:domain:delete" as const,
    },
    SETTINGS: {
      READ: "org:settings:read" as const,
      WRITE: "org:settings:write" as const,
    },
    TRANSFER: {
      EXECUTE: "org:transfer:execute" as const,
    },
    DELETE: {
      EXECUTE: "org:delete:execute" as const,
    },
    BRANDING: {
      READ: "org:branding:read" as const,
      WRITE: "org:branding:write" as const,
    },
  },

  // ── Billing ───────────────────────────────────────────────────────────────
  BILLING: {
    SUBSCRIPTION: {
      READ: "billing:subscription:read" as const,
      UPDATE: "billing:subscription:update" as const,
    },
    INVOICE: {
      READ: "billing:invoice:read" as const,
      EXPORT: "billing:invoice:export" as const,
    },
    LICENSE: {
      READ: "billing:license:read" as const,
      ASSIGN: "billing:license:assign" as const,
    },
    METRICS: {
      READ: "billing:metrics:read" as const,
    },
  },

  // ── Platform (System Plane) ───────────────────────────────────────────────
  PLATFORM: {
    TENANTS: {
      CREATE: "platform:tenants:create" as const,
      READ: "platform:tenants:read" as const,
      UPDATE: "platform:tenants:update" as const,
      SUSPEND: "platform:tenants:suspend" as const,
      DELETE: "platform:tenants:delete" as const,
    },
    BILLING: {
      READ: "platform:billing:read" as const,
      WRITE: "platform:billing:write" as const,
    },
    TIERS: {
      READ: "platform:tiers:read" as const,
      WRITE: "platform:tiers:write" as const,
    },
    FLAGS: {
      READ: "platform:flags:read" as const,
      WRITE: "platform:flags:write" as const,
    },
    MARKETPLACE: {
      APPROVE: "platform:marketplace:approve" as const,
      READ: "platform:marketplace:read" as const,
      REJECT: "platform:marketplace:reject" as const,
    },
    IMPERSONATE: {
      EXECUTE: "platform:impersonate:execute" as const,
    },
    TELEMETRY: {
      READ: "platform:telemetry:read" as const,
    },
    LOGS: {
      READ: "platform:logs:read" as const,
    },
    METRICS: {
      READ: "platform:metrics:read" as const,
    },
  },

  // ── Content ───────────────────────────────────────────────────────────────
  CONTENT: {
    RESOURCE: {
      CREATE: "content:resource:create" as const,
      READ: "content:resource:read" as const,
      UPDATE: "content:resource:update" as const,
      DELETE: "content:resource:delete" as const,
    },
    SUBMISSION: {
      CREATE: "content:submission:create" as const,
      READ: "content:submission:read" as const,
      GRADE: "content:submission:grade" as const,
    },
    MODERATION: {
      READ: "content:moderation:read" as const,
      EXECUTE: "content:moderation:execute" as const,
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Flat array of every defined atom (built from the catalog above)
// ─────────────────────────────────────────────────────────────────────────────

function flattenCatalog(
  obj: Record<string, unknown>,
  acc: string[] = [],
): string[] {
  for (const val of Object.values(obj)) {
    if (typeof val === "string") {
      acc.push(val);
    } else if (typeof val === "object" && val !== null) {
      flattenCatalog(val as Record<string, unknown>, acc);
    }
  }
  return acc;
}

/** Exhaustive list of every valid atomic permission string in the catalog. */
export const ALL_ATOMIC_PERMISSIONS: readonly string[] = Object.freeze(
  flattenCatalog(ATOMIC_PERMISSIONS as unknown as Record<string, unknown>),
);

/**
 * AtomicPermission — string literal union of every atom in the catalog.
 * Use this type for compile-time safety when writing rules or permission sets.
 */
export type AtomicPermission =
  // Auth
  | "auth:sso:configure"
  | "auth:sso:read"
  | "auth:sso:delete"
  | "auth:scim:provision"
  | "auth:scim:read"
  | "auth:scim:delete"
  | "auth:mfa:enforce"
  | "auth:mfa:configure"
  | "auth:mfa:read"
  | "auth:passkey:enforce"
  | "auth:passkey:configure"
  | "auth:passkey:read"
  | "auth:session:read"
  | "auth:session:revoke"
  | "auth:idp:create"
  | "auth:idp:read"
  | "auth:idp:update"
  | "auth:idp:delete"
  // Security
  | "security:audit_logs:read"
  | "security:audit_logs:export"
  | "security:anomaly:read"
  | "security:anomaly:configure"
  | "security:abac:read"
  | "security:abac:write"
  | "security:abac:delete"
  | "security:abac:execute"
  | "security:threats:read"
  | "security:threats:configure"
  // Theme
  | "theme:tokens:read"
  | "theme:tokens:write"
  | "theme:ai:generate"
  | "theme:ai:read"
  | "theme:branding:read"
  | "theme:branding:write"
  | "theme:preset:read"
  | "theme:preset:write"
  | "theme:preset:delete"
  // Dev
  | "dev:api_keys:create"
  | "dev:api_keys:read"
  | "dev:api_keys:revoke"
  | "dev:webhooks:create"
  | "dev:webhooks:read"
  | "dev:webhooks:update"
  | "dev:webhooks:delete"
  | "dev:sandbox:execute"
  | "dev:sandbox:read"
  | "dev:plugins:install"
  | "dev:plugins:read"
  | "dev:plugins:uninstall"
  // Org
  | "org:members:invite"
  | "org:members:read"
  | "org:members:update"
  | "org:members:remove"
  | "org:roles:create"
  | "org:roles:read"
  | "org:roles:assign"
  | "org:roles:delete"
  | "org:domain:verify"
  | "org:domain:read"
  | "org:domain:delete"
  | "org:settings:read"
  | "org:settings:write"
  | "org:transfer:execute"
  | "org:delete:execute"
  | "org:branding:read"
  | "org:branding:write"
  // Billing
  | "billing:subscription:read"
  | "billing:subscription:update"
  | "billing:invoice:read"
  | "billing:invoice:export"
  | "billing:license:read"
  | "billing:license:assign"
  | "billing:metrics:read"
  // Platform
  | "platform:tenants:create"
  | "platform:tenants:read"
  | "platform:tenants:update"
  | "platform:tenants:suspend"
  | "platform:tenants:delete"
  | "platform:billing:read"
  | "platform:billing:write"
  | "platform:tiers:read"
  | "platform:tiers:write"
  | "platform:flags:read"
  | "platform:flags:write"
  | "platform:marketplace:approve"
  | "platform:marketplace:read"
  | "platform:marketplace:reject"
  | "platform:impersonate:execute"
  | "platform:telemetry:read"
  | "platform:logs:read"
  | "platform:metrics:read"
  // Content
  | "content:resource:create"
  | "content:resource:read"
  | "content:resource:update"
  | "content:resource:delete"
  | "content:submission:create"
  | "content:submission:read"
  | "content:submission:grade"
  | "content:moderation:read"
  | "content:moderation:execute";

// ─────────────────────────────────────────────────────────────────────────────
// Permission Set & Custom Role Types
// ─────────────────────────────────────────────────────────────────────────────

/** A named, reusable collection of atomic permissions. Can be platform-shipped or tenant-defined. */
export interface PermissionSet {
  id: string;
  name: string;
  description?: string;
  /** The owner: 'platform' for built-in presets, a tenant org ID for custom sets. */
  ownerId: "platform" | string | number;
  permissions: (AtomicPermission | string)[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * A tenant-defined custom role composed of one or more PermissionSets.
 * Stored on `TenantMembership.customRole` and de-sugared to flat atoms by `buildSubject()`.
 */
export interface CustomRoleDefinition {
  id: string;
  name: string;
  description?: string;
  orgId: string | number;
  /** Resolved permission sets (may be inline or referenced by ID). */
  permissionSets: PermissionSet[];
  /** Optional additional ad-hoc atoms beyond the sets. */
  extraPermissions?: (AtomicPermission | string)[];
  createdAt?: string;
  updatedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Built-In Platform Permission Set Presets
// ─────────────────────────────────────────────────────────────────────────────

export const BUILT_IN_PERMISSION_SETS: readonly PermissionSet[] = Object.freeze(
  [
    {
      id: "preset:sso-config",
      name: "SSO Configuration",
      description:
        "Configure and manage SAML 2.0 / OIDC identity providers, SCIM provisioning, and IDP connections",
      ownerId: "platform",
      permissions: [
        "auth:sso:configure",
        "auth:sso:read",
        "auth:sso:delete",
        "auth:scim:provision",
        "auth:scim:read",
        "auth:scim:delete",
        "auth:idp:create",
        "auth:idp:read",
        "auth:idp:update",
        "auth:idp:delete",
      ],
    },
    {
      id: "preset:mfa-enforcement",
      name: "MFA Enforcement",
      description:
        "Manage multi-factor authentication and passkey / WebAuthn enforcement policies",
      ownerId: "platform",
      permissions: [
        "auth:mfa:enforce",
        "auth:mfa:configure",
        "auth:mfa:read",
        "auth:passkey:enforce",
        "auth:passkey:configure",
        "auth:passkey:read",
      ],
    },
    {
      id: "preset:security-audit",
      name: "Security Audit",
      description:
        "Read-only access to audit logs, anomaly detection, and threat intelligence streams",
      ownerId: "platform",
      permissions: [
        "security:audit_logs:read",
        "security:audit_logs:export",
        "security:anomaly:read",
        "security:threats:read",
      ],
    },
    {
      id: "preset:abac-canvas",
      name: "ABAC Policy Canvas",
      description:
        "Author, edit, and execute policies in the Visual Policy & ABAC Canvas",
      ownerId: "platform",
      permissions: [
        "security:abac:read",
        "security:abac:write",
        "security:abac:delete",
        "security:abac:execute",
        "security:anomaly:configure",
        "security:threats:configure",
      ],
    },
    {
      id: "preset:theme",
      name: "Theme & Branding",
      description:
        "Manage design tokens, AI theme generation, presets, and organizational branding",
      ownerId: "platform",
      permissions: [
        "theme:tokens:read",
        "theme:tokens:write",
        "theme:ai:generate",
        "theme:ai:read",
        "theme:branding:read",
        "theme:branding:write",
        "theme:preset:read",
        "theme:preset:write",
        "theme:preset:delete",
        "org:branding:read",
        "org:branding:write",
      ],
    },
    {
      id: "preset:theme-readonly",
      name: "Theme Read-Only",
      description: "View-only access to theme tokens and branding",
      ownerId: "platform",
      permissions: [
        "theme:tokens:read",
        "theme:ai:read",
        "theme:branding:read",
        "theme:preset:read",
      ],
    },
    {
      id: "preset:dev-sandbox",
      name: "Developer Sandbox",
      description:
        "Read API keys, use the interactive OIDC/SCIM sandbox, and read webhooks",
      ownerId: "platform",
      permissions: [
        "dev:sandbox:execute",
        "dev:sandbox:read",
        "dev:api_keys:read",
        "dev:webhooks:read",
        "dev:plugins:read",
      ],
    },
    {
      id: "preset:dev-full",
      name: "Developer Full Access",
      description:
        "Full developer access: API keys, webhooks, sandbox, and plugin management",
      ownerId: "platform",
      permissions: [
        "dev:api_keys:create",
        "dev:api_keys:read",
        "dev:api_keys:revoke",
        "dev:webhooks:create",
        "dev:webhooks:read",
        "dev:webhooks:update",
        "dev:webhooks:delete",
        "dev:sandbox:execute",
        "dev:sandbox:read",
        "dev:plugins:install",
        "dev:plugins:read",
        "dev:plugins:uninstall",
      ],
    },
    {
      id: "preset:member-management",
      name: "Member Management",
      description:
        "Invite, update, and remove team members; assign roles; manage auto-join domains",
      ownerId: "platform",
      permissions: [
        "org:members:invite",
        "org:members:read",
        "org:members:update",
        "org:members:remove",
        "org:roles:read",
        "org:roles:assign",
        "org:domain:verify",
        "org:domain:read",
        "org:settings:read",
        "org:settings:write",
      ],
    },
    {
      id: "preset:billing-viewer",
      name: "Billing Viewer",
      description:
        "Read-only access to billing information, invoices, and subscription details",
      ownerId: "platform",
      permissions: [
        "billing:subscription:read",
        "billing:invoice:read",
        "billing:license:read",
        "billing:metrics:read",
      ],
    },
    {
      id: "preset:content-readonly",
      name: "Content Read-Only",
      description: "Read access to tenant content and submissions",
      ownerId: "platform",
      permissions: ["content:resource:read", "content:submission:read"],
    },
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// Wildcard Glob Expander
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Expands a list of permission strings (which may contain glob wildcards) into
 * a flat, deduplicated array of exact atomic permission strings.
 *
 * Glob rules:
 *   - `*`              → every atom in the catalog
 *   - `auth:*`         → every atom starting with 'auth:'
 *   - `auth:sso:*`     → every atom starting with 'auth:sso:'
 *   - `auth:sso:read`  → exact match; passed through unchanged
 *
 * @param permissions  Array of raw permission strings (may include globs or exact atoms)
 * @param catalog      Full list of valid atoms to expand against (defaults to ALL_ATOMIC_PERMISSIONS)
 */
export function expandPermissions(
  permissions: (string | AtomicPermission)[],
  catalog: readonly string[] = ALL_ATOMIC_PERMISSIONS,
): string[] {
  const result = new Set<string>();

  for (const perm of permissions) {
    if (perm === "*") {
      // Full wildcard — grant every atom
      for (const atom of catalog) result.add(atom);
      continue;
    }

    if (perm.endsWith(":*")) {
      // Prefix wildcard — e.g. 'auth:sso:*' or 'auth:*' or 'tenant:*' (legacy namespace)
      const prefix = perm.slice(0, -1); // remove trailing '*', keep the colon
      for (const atom of catalog) {
        if (atom.startsWith(prefix)) result.add(atom);
      }
      // Also keep the wildcard string itself so legacy policy rules still match
      result.add(perm);
      continue;
    }

    // Exact atom or legacy coarse string (no wildcard)
    result.add(perm);
  }

  return Array.from(result);
}
