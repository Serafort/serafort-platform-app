import { describe, it, expect } from "vitest";
import { normalizeRole } from "../auth";

describe("normalizeRole", () => {
  it("should return undefined for null, undefined, or empty string", () => {
    expect(normalizeRole(undefined)).toBeUndefined();
    expect(normalizeRole(null)).toBeUndefined();
    expect(normalizeRole("")).toBeUndefined();
  });

  describe("when role is a number", () => {
    it("should map valid numbers to their string representations", () => {
      expect(normalizeRole(1)).toBe("user");
      expect(normalizeRole(6)).toBe("admin");
      expect(normalizeRole(8)).toBe("super_admin");
    });

    it("should return undefined for invalid numbers", () => {
      expect(normalizeRole(99)).toBeUndefined();
      expect(normalizeRole(0)).toBeUndefined();
      expect(normalizeRole(-1)).toBeUndefined();
    });
  });

  describe("when role is a string", () => {
    it("should handle numeric strings", () => {
      expect(normalizeRole("1")).toBe("user");
      expect(normalizeRole("6")).toBe("admin");
      expect(normalizeRole(" 8 ")).toBe("super_admin"); // with padding
      expect(normalizeRole("99")).toBeUndefined(); // invalid numeric string
    });

    it("should return exact matches when normalized matches ROLE_VALUES", () => {
      expect(normalizeRole("admin")).toBe("admin");
      expect(normalizeRole("super_admin")).toBe("super_admin");
      expect(normalizeRole("platform_owner")).toBe("platform_owner");
    });

    it("should normalize string casing and whitespace", () => {
      expect(normalizeRole(" ADMIN ")).toBe("admin");
      expect(normalizeRole("Super_Admin")).toBe("super_admin");
    });

    it("should resolve known aliases correctly", () => {
      expect(normalizeRole("superadmin")).toBe("super_admin");
      expect(normalizeRole("super admin")).toBe("super_admin");
      expect(normalizeRole("platform owner")).toBe("platform_owner");
      expect(normalizeRole("Super Admin Employee")).toBe("super_admin_employee");
      expect(normalizeRole("support")).toBe("platform_support");
      expect(normalizeRole("owner")).toBe("tenant_owner");
      expect(normalizeRole("administrator")).toBe("admin");
      expect(normalizeRole("read-only")).toBe("viewer");
    });

    it("should return undefined for unrecognized strings", () => {
      expect(normalizeRole("unknown_role")).toBeUndefined();
      expect(normalizeRole("abc")).toBeUndefined();
    });
  });

  describe("when role is an object", () => {
    it("should recursively resolve valid roles from object keys", () => {
      // slug
      expect(normalizeRole({ slug: "admin" })).toBe("admin");
      // name
      expect(normalizeRole({ name: "superadmin" })).toBe("super_admin");
      // role
      expect(normalizeRole({ role: "platform owner" })).toBe("platform_owner");
      // roleId
      expect(normalizeRole({ roleId: 6 })).toBe("admin");
      // role_id
      expect(normalizeRole({ role_id: "8" })).toBe("super_admin");
      // roleName
      expect(normalizeRole({ roleName: "administrator" })).toBe("admin");
      // role_name
      expect(normalizeRole({ role_name: "support" })).toBe("platform_support");
      // value
      expect(normalizeRole({ value: 1 })).toBe("user");
      // code
      expect(normalizeRole({ code: "owner" })).toBe("tenant_owner");
      // id
      expect(normalizeRole({ id: 2 })).toBe("participant");
    });

    it("should return undefined for objects without valid role keys", () => {
      expect(normalizeRole({})).toBeUndefined();
      expect(normalizeRole({ someOtherKey: "admin" })).toBeUndefined();
    });

    it("should return the first valid role based on key precedence", () => {
      const obj = {
        name: "unknown_role",
        roleId: 6,
        value: "super_admin",
      };
      // 'name' is unknown, but 'roleId' works and comes before 'value' in the normalizeRole object checks
      expect(normalizeRole(obj)).toBe("admin");
    });
  });
});
