import { describe, it, expect, beforeEach } from "vitest";
import { DEFAULT_POLICY_SET } from "../policies/defaultPolicySet";
import { policyEngine } from "../engine/engine";
import { PolicySubject, PolicyResource } from "../types/policy.types";

describe("DEFAULT_POLICY_SET", () => {
  beforeEach(() => {
    policyEngine.setPolicySet(DEFAULT_POLICY_SET);
  });

  const resource: PolicyResource = { type: "role", id: 42 };

  it("defaults to deny for regular users", () => {
    const userSubject: PolicySubject = {
      id: "user-1",
      roles: ["user"],
      permissions: [],
      attributes: {},
    };

    expect(policyEngine.can(userSubject, "read", resource)).toBe(false);
    expect(policyEngine.can(userSubject, "write", resource)).toBe(false);
  });

  it("allows admins on any action and resource", () => {
    const adminSubject: PolicySubject = {
      id: "admin-1",
      roles: ["admin"],
      permissions: [],
      attributes: {},
    };

    expect(policyEngine.can(adminSubject, "delete", resource)).toBe(true);
    expect(policyEngine.can(adminSubject, "read", { type: "user" })).toBe(true);
  });

  it("allows super admins on any action and resource", () => {
    const superAdminSubject: PolicySubject = {
      id: "super-1",
      roles: ["super_admin"],
      permissions: [],
      attributes: {},
    };

    expect(policyEngine.can(superAdminSubject, "write", resource)).toBe(true);
  });

  it("allows super admin employees and provider admins", () => {
    const employeeSubject: PolicySubject = {
      id: "emp-1",
      roles: ["super_admin_employee"],
      permissions: [],
      attributes: {},
    };
    const providerAdminSubject: PolicySubject = {
      id: "prov-1",
      roles: ["provider_admin"],
      permissions: [],
      attributes: {},
    };

    expect(policyEngine.can(employeeSubject, "access", resource)).toBe(true);
    expect(policyEngine.can(providerAdminSubject, "access", resource)).toBe(
      true,
    );
  });
});
