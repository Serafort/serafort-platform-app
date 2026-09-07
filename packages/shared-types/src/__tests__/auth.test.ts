import { describe, it, expect } from "vitest";
import { normalizeRole } from "../auth";

describe("normalizeRole", () => {
  it("should return undefined for falsy values", () => {
    expect(normalizeRole(undefined)).toBeUndefined();
    expect(normalizeRole(null)).toBeUndefined();
    expect(normalizeRole("")).toBeUndefined();
  });

  describe("number input", () => {
    it("should map numeric roles to string keys", () => {
      expect(normalizeRole(1)).toBe("user");
      expect(normalizeRole(8)).toBe("super_admin");
    });

    it("should return undefined for unknown numeric roles", () => {
      expect(normalizeRole(99)).toBeUndefined();
      expect(normalizeRole(0)).toBeUndefined();
    });
  });

  describe("string input", () => {
    it("should map numeric string roles to string keys", () => {
      expect(normalizeRole("1")).toBe("user");
      expect(normalizeRole(" 8 ")).toBe("super_admin");
    });

    it("should return the normalized string if it exists in ROLE_VALUES", () => {
      expect(normalizeRole("user")).toBe("user");
      expect(normalizeRole("super_admin")).toBe("super_admin");
    });

    it("should normalize string format before matching", () => {
      expect(normalizeRole(" SUPER ADMIN ")).toBe("super_admin");
      expect(normalizeRole("tenant-admin")).toBe("tenant_admin");
    });

    it("should map aliases to standard roles", () => {
      expect(normalizeRole("admin")).toBe("admin");
      expect(normalizeRole("administrator")).toBe("admin");
      expect(normalizeRole("superadmin")).toBe("super_admin");
      expect(normalizeRole("owner")).toBe("tenant_owner");
    });

    it("should return undefined for unknown string roles", () => {
      expect(normalizeRole("unknown_role")).toBeUndefined();
    });
  });

  describe("object input", () => {
    it("should resolve role from object with slug", () => {
      expect(normalizeRole({ slug: "super_admin" })).toBe("super_admin");
    });

    it("should resolve role from object with name", () => {
      expect(normalizeRole({ name: "superadmin" })).toBe("super_admin");
    });

    it("should resolve role from object with role", () => {
      expect(normalizeRole({ role: "admin" })).toBe("admin");
    });

    it("should resolve role from object with roleId", () => {
      expect(normalizeRole({ roleId: 1 })).toBe("user");
    });

    it("should resolve role from object with role_id", () => {
      expect(normalizeRole({ role_id: "8" })).toBe("super_admin");
    });

    it("should resolve role from object with roleName", () => {
      expect(normalizeRole({ roleName: "owner" })).toBe("tenant_owner");
    });

    it("should resolve role from object with role_name", () => {
      expect(normalizeRole({ role_name: "moderator" })).toBe("moderator");
    });

    it("should resolve role from object with value", () => {
      expect(normalizeRole({ value: "judge" })).toBe("judge");
    });

    it("should resolve role from object with code", () => {
      expect(normalizeRole({ code: "participant" })).toBe("participant");
    });

    it("should resolve role from object with id", () => {
      expect(normalizeRole({ id: 2 })).toBe("participant");
    });

    it("should return undefined for object without matching properties", () => {
      expect(normalizeRole({ unknownKey: "admin" })).toBeUndefined();
    });
  });
});
