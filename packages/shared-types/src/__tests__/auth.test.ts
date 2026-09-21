import { describe, it, expect } from "vitest";
import { normalizeRole } from "../auth";

describe("normalizeRole", () => {
  it("should return undefined for falsy or empty values", () => {
    expect(normalizeRole(undefined)).toBeUndefined();
    expect(normalizeRole(null)).toBeUndefined();
    expect(normalizeRole("")).toBeUndefined();
  });

  describe("when role is a number", () => {
    it("should return the corresponding mapped role string if it exists", () => {
      expect(normalizeRole(1)).toBe("user");
      expect(normalizeRole(6)).toBe("admin");
      expect(normalizeRole(8)).toBe("super_admin");
    });

    it("should return undefined if the number is not mapped", () => {
      expect(normalizeRole(99)).toBeUndefined();
      expect(normalizeRole(0)).toBeUndefined();
      expect(normalizeRole(-1)).toBeUndefined();
    });
  });

  describe("when role is a string", () => {
    it("should map numeric strings to their mapped role", () => {
      expect(normalizeRole("1")).toBe("user");
      expect(normalizeRole(" 6 ")).toBe("admin");
      expect(normalizeRole("8")).toBe("super_admin");
    });

    it("should return undefined for unmapped numeric strings", () => {
      expect(normalizeRole("999")).toBeUndefined();
    });

    it("should normalize string values in ROLE_VALUES", () => {
      expect(normalizeRole("platform_owner")).toBe("platform_owner");
      expect(normalizeRole("super_admin")).toBe("super_admin");
      expect(normalizeRole("user")).toBe("user");
    });

    it("should convert spaces and dashes to underscores and lowercase", () => {
      expect(normalizeRole("SUPER-ADMIN")).toBe("super_admin");
      expect(normalizeRole(" platform  owner ")).toBe("platform_owner");
      expect(normalizeRole("SUPER_ADMIN_EMPLOYEE")).toBe("super_admin_employee");
    });

    it("should map role aliases", () => {
      expect(normalizeRole("owner")).toBe("tenant_owner");
      expect(normalizeRole("administrator")).toBe("admin");
      expect(normalizeRole("compliance_admin")).toBe("security_admin");
      expect(normalizeRole("integrator")).toBe("developer");
      expect(normalizeRole("read-only")).toBe("viewer");
    });

    it("should return undefined for unknown strings", () => {
      expect(normalizeRole("unknown_role")).toBeUndefined();
      expect(normalizeRole("random string")).toBeUndefined();
    });
  });

  describe("when role is an object", () => {
    it("should extract role from known properties", () => {
      // test each of the extracted properties based on the auth.ts fallback chain
      expect(normalizeRole({ slug: "super_admin" })).toBe("super_admin");
      expect(normalizeRole({ name: "admin" })).toBe("admin");
      expect(normalizeRole({ role: "developer" })).toBe("developer");
      expect(normalizeRole({ roleId: 1 })).toBe("user");
      expect(normalizeRole({ role_id: 2 })).toBe("participant");
      expect(normalizeRole({ roleName: "judge" })).toBe("judge");
      expect(normalizeRole({ role_name: "member" })).toBe("member");
      expect(normalizeRole({ value: "viewer" })).toBe("viewer");
      expect(normalizeRole({ code: "owner" })).toBe("tenant_owner");
      expect(normalizeRole({ id: 8 })).toBe("super_admin");
    });

    it("should prioritize earlier properties in the fallback chain", () => {
      // slug takes precedence over name
      expect(normalizeRole({ slug: "admin", name: "user" })).toBe("admin");

      // role takes precedence over roleId
      expect(normalizeRole({ role: "member", roleId: 8 })).toBe("member");
    });

    it("should return undefined if the object doesn't have any matching property", () => {
      expect(normalizeRole({})).toBeUndefined();
      expect(normalizeRole({ someOtherProp: "admin" })).toBeUndefined();
    });

    it("should return undefined if the matched property resolves to an unknown role", () => {
      expect(normalizeRole({ slug: "unknown_role" })).toBeUndefined();
      expect(normalizeRole({ roleId: 999 })).toBeUndefined();
    });
  });
});
