import { describe, it, expect } from "vitest";
import { normalizeRole } from "../auth";

describe("normalizeRole", () => {
  it("should return undefined for falsy or empty values", () => {
    expect(normalizeRole(undefined)).toBeUndefined();
    expect(normalizeRole(null)).toBeUndefined();
    expect(normalizeRole("")).toBeUndefined();
  });

  it("should map valid numeric roles", () => {
    expect(normalizeRole(1)).toBe("user");
    expect(normalizeRole(2)).toBe("participant");
    expect(normalizeRole(3)).toBe("judge");
    expect(normalizeRole(4)).toBe("provider_employee");
    expect(normalizeRole(5)).toBe("provider_admin");
    expect(normalizeRole(6)).toBe("admin");
    expect(normalizeRole(7)).toBe("super_admin_employee");
    expect(normalizeRole(8)).toBe("super_admin");
  });

  it("should return undefined for invalid numeric roles", () => {
    expect(normalizeRole(99)).toBeUndefined();
    expect(normalizeRole(-1)).toBeUndefined();
    expect(normalizeRole(0)).toBeUndefined();
  });

  it("should map valid stringified numeric roles", () => {
    expect(normalizeRole("1")).toBe("user");
    expect(normalizeRole("  8  ")).toBe("super_admin");
  });

  it("should return exact match from ROLE_VALUES", () => {
    expect(normalizeRole("super_admin")).toBe("super_admin");
    expect(normalizeRole("user")).toBe("user");
    expect(normalizeRole("tenant_owner")).toBe("tenant_owner");
  });

  it("should resolve aliases", () => {
    expect(normalizeRole("platform owner")).toBe("platform_owner");
    expect(normalizeRole("super admin")).toBe("super_admin");
    expect(normalizeRole("provider employee")).toBe("provider_employee");
    expect(normalizeRole("tenant admin")).toBe("tenant_admin");
    expect(normalizeRole("dev")).toBe("developer");
  });

  it("should handle case insensitivity and spaces/dashes", () => {
    expect(normalizeRole("  SuPeR-Admin ")).toBe("super_admin");
    expect(normalizeRole(" PLATFORM   OWNER ")).toBe("platform_owner");
    expect(normalizeRole("Provider-Employee")).toBe("provider_employee");
  });

  it("should return undefined for unmatched string roles", () => {
    expect(normalizeRole("non_existent_role")).toBeUndefined();
    expect(normalizeRole("random-string")).toBeUndefined();
  });

  it("should extract role from objects using fallback keys", () => {
    expect(normalizeRole({ slug: "super_admin" })).toBe("super_admin");
    expect(normalizeRole({ name: "admin" })).toBe("admin");
    expect(normalizeRole({ role: "user" })).toBe("user");
    expect(normalizeRole({ roleId: 8 })).toBe("super_admin");
    expect(normalizeRole({ role_id: "1" })).toBe("user");
    expect(normalizeRole({ roleName: "platform owner" })).toBe("platform_owner");
    expect(normalizeRole({ role_name: "  SuPeR-Admin " })).toBe("super_admin");
    expect(normalizeRole({ value: "tenant_owner" })).toBe("tenant_owner");
    expect(normalizeRole({ code: 4 })).toBe("provider_employee");
  });

  it("should return undefined for objects without valid role keys", () => {
    expect(normalizeRole({ randomKey: "super_admin" })).toBeUndefined();
    expect(normalizeRole({})).toBeUndefined();
  });

  it("should handle deeply nested valid role via recursive fallback (simulated via key fallbacks)", () => {
    // Note: normalizeRole recursively calls itself on the values.
    // If we have { slug: { name: "super_admin" } }, it will call normalizeRole({ name: "super_admin" }).
    expect(normalizeRole({ slug: { name: "super_admin" } })).toBe("super_admin");
    expect(normalizeRole({ role: { roleId: 1 } })).toBe("user");
  });
});
