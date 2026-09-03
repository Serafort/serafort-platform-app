import type { VisualPolicyGraph } from "../types/graphTypes";

export const POLICY_CANVAS_TEMPLATES: VisualPolicyGraph[] = [
  {
    id: "template-multi-tenant-isolation",
    name: "Multi-Tenant Strict Data Isolation",
    description:
      "Enforces strict tenant boundary isolation ensuring users can only interact with resources belonging to their organization.",
    version: "1.0.0",
    defaultEffect: "deny",
    combiningAlgorithm: "deny-overrides",
    nodes: [
      {
        id: "sub-tenant-member",
        type: "subject",
        position: { x: 50, y: 100 },
        data: {
          label: "Tenant Members",
          roles: ["member", "admin", "manager"],
          requiredAttributes: { tenantId: "$tenant" },
        },
      },
      {
        id: "act-all-ops",
        type: "action",
        position: { x: 350, y: 100 },
        data: {
          label: "CRUD Operations",
          actions: ["read", "write", "create", "update", "delete", "access"],
        },
      },
      {
        id: "res-org-entities",
        type: "resource",
        position: { x: 650, y: 100 },
        data: {
          label: "Organization Resources",
          resourceType: "*",
        },
      },
      {
        id: "cond-same-tenant",
        type: "condition",
        position: { x: 950, y: 100 },
        data: {
          label: "Same Organization Check",
          conditionId: "sameOrg",
          operator: "AND",
        },
      },
      {
        id: "dec-allow-isolated",
        type: "decision",
        position: { x: 1250, y: 100 },
        data: {
          label: "ALLOW",
          effect: "allow",
          reason: "Access granted within verified tenant organization boundary",
          priority: 10,
        },
      },
    ],
    edges: [
      {
        id: "e-1",
        source: "sub-tenant-member",
        target: "act-all-ops",
        animated: true,
      },
      {
        id: "e-2",
        source: "act-all-ops",
        target: "res-org-entities",
        animated: true,
      },
      {
        id: "e-3",
        source: "res-org-entities",
        target: "cond-same-tenant",
        animated: true,
      },
      {
        id: "e-4",
        source: "cond-same-tenant",
        target: "dec-allow-isolated",
        animated: true,
      },
    ],
  },
  {
    id: "template-step-up-mfa-exports",
    name: "Step-Up MFA on Financial Exports",
    description:
      "Requires multi-factor authentication verification before allowing export of sensitive invoice and financial data.",
    version: "1.0.0",
    defaultEffect: "deny",
    combiningAlgorithm: "deny-overrides",
    nodes: [
      {
        id: "sub-finance-verified",
        type: "subject",
        position: { x: 50, y: 80 },
        data: {
          label: "Finance Specialist (MFA Verified)",
          roles: ["finance", "billing_admin", "super_admin"],
          requireMfa: true,
        },
      },
      {
        id: "act-export",
        type: "action",
        position: { x: 350, y: 80 },
        data: {
          label: "Export Data",
          actions: ["export", "execute"],
        },
      },
      {
        id: "res-financials",
        type: "resource",
        position: { x: 650, y: 80 },
        data: {
          label: "Financial Invoices & Reports",
          resourceType: "invoice",
        },
      },
      {
        id: "cond-owner-or-admin",
        type: "condition",
        position: { x: 950, y: 80 },
        data: {
          label: "Organization Owner or Admin",
          conditionId: "sameOrg",
          operator: "AND",
        },
      },
      {
        id: "dec-allow-export",
        type: "decision",
        position: { x: 1250, y: 80 },
        data: {
          label: "ALLOW EXPORT",
          effect: "allow",
          reason: "Financial export authorized with active MFA verification",
          priority: 20,
        },
      },
      // Blocked / Unverified branch
      {
        id: "sub-unverified",
        type: "subject",
        position: { x: 50, y: 260 },
        data: {
          label: "Unverified / General Roles",
          roles: ["*"],
        },
      },
      {
        id: "act-export-unverified",
        type: "action",
        position: { x: 350, y: 260 },
        data: {
          label: "Export Data",
          actions: ["export"],
        },
      },
      {
        id: "res-financials-unverified",
        type: "resource",
        position: { x: 650, y: 260 },
        data: {
          label: "Financial Invoices",
          resourceType: "invoice",
        },
      },
      {
        id: "dec-deny-step-up",
        type: "decision",
        position: { x: 1250, y: 260 },
        data: {
          label: "DENY (STEP-UP MFA REQUIRED)",
          effect: "deny",
          reason:
            "Sensitive export requires elevated Step-Up MFA authentication",
          priority: 50,
          stepUpMfaRequired: true,
        },
      },
    ],
    edges: [
      { id: "e-1", source: "sub-finance-verified", target: "act-export" },
      { id: "e-2", source: "act-export", target: "res-financials" },
      { id: "e-3", source: "res-financials", target: "cond-owner-or-admin" },
      { id: "e-4", source: "cond-owner-or-admin", target: "dec-allow-export" },
      { id: "e-5", source: "sub-unverified", target: "act-export-unverified" },
      {
        id: "e-6",
        source: "act-export-unverified",
        target: "res-financials-unverified",
      },
      {
        id: "e-7",
        source: "res-financials-unverified",
        target: "dec-deny-step-up",
      },
    ],
  },
  {
    id: "template-owner-only-document-deletion",
    name: "Owner-Only Resource Deletion",
    description:
      "Allows resource authors or administrators to delete documents, while strictly blocking non-owners.",
    version: "1.0.0",
    defaultEffect: "deny",
    combiningAlgorithm: "deny-overrides",
    nodes: [
      {
        id: "sub-admin",
        type: "subject",
        position: { x: 50, y: 60 },
        data: {
          label: "Super Admin / Org Admin",
          roles: ["admin", "super_admin"],
        },
      },
      {
        id: "act-delete-admin",
        type: "action",
        position: { x: 350, y: 60 },
        data: {
          label: "Delete Action",
          actions: ["delete"],
        },
      },
      {
        id: "res-doc-admin",
        type: "resource",
        position: { x: 650, y: 60 },
        data: {
          label: "All Documents",
          resourceType: "document",
        },
      },
      {
        id: "dec-allow-admin-delete",
        type: "decision",
        position: { x: 1250, y: 60 },
        data: {
          label: "ALLOW (ADMIN)",
          effect: "allow",
          reason: "Administrator override permission granted",
          priority: 30,
        },
      },
      {
        id: "sub-author",
        type: "subject",
        position: { x: 50, y: 220 },
        data: {
          label: "Author / Contributor",
          roles: ["editor", "author", "member"],
        },
      },
      {
        id: "act-delete-author",
        type: "action",
        position: { x: 350, y: 220 },
        data: {
          label: "Delete Action",
          actions: ["delete"],
        },
      },
      {
        id: "res-doc-author",
        type: "resource",
        position: { x: 650, y: 220 },
        data: {
          label: "Owned Document",
          resourceType: "document",
        },
      },
      {
        id: "cond-owns-doc",
        type: "condition",
        position: { x: 950, y: 220 },
        data: {
          label: "Subject Owns Document",
          conditionId: "owns",
          operator: "AND",
        },
      },
      {
        id: "dec-allow-owner-delete",
        type: "decision",
        position: { x: 1250, y: 220 },
        data: {
          label: "ALLOW (OWNER)",
          effect: "allow",
          reason: "Document owner verified for deletion",
          priority: 15,
        },
      },
    ],
    edges: [
      { id: "e-1", source: "sub-admin", target: "act-delete-admin" },
      { id: "e-2", source: "act-delete-admin", target: "res-doc-admin" },
      { id: "e-3", source: "res-doc-admin", target: "dec-allow-admin-delete" },
      { id: "e-4", source: "sub-author", target: "act-delete-author" },
      { id: "e-5", source: "act-delete-author", target: "res-doc-author" },
      { id: "e-6", source: "res-doc-author", target: "cond-owns-doc" },
      { id: "e-7", source: "cond-owns-doc", target: "dec-allow-owner-delete" },
    ],
  },
];
