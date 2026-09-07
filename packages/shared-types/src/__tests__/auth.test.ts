import { describe, it, expect } from "vitest";
import { normalizeRole } from "../auth";

describe("normalizeRole", () => {
  describe("empty values", () => {
    it("returns undefined for undefined", () => {
      expect(normalizeRole(undefined)).toBeUndefined();
    });

    it("returns undefined for null", () => {
      expect(normalizeRole(null)).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
      expect(normalizeRole("")).toBeUndefined();
    });
  });

  describe("numeric values", () => {
    it("returns normalized string for valid number", () => {
      expect(normalizeRole(1)).toBe("user");
      expect(normalizeRole(6)).toBe("admin");
      expect(normalizeRole(8)).toBe("super_admin");
    });

    it("returns undefined for invalid number", () => {
      expect(normalizeRole(99)).toBeUndefined();
    });
  });

  describe("string values", () => {
    it("handles numeric strings", () => {
      expect(normalizeRole("1")).toBe("user");
      expect(normalizeRole(" 6 ")).toBe("admin");
      expect(normalizeRole("8")).toBe("super_admin");
    });

    it("handles exact role values", () => {
      expect(normalizeRole("user")).toBe("user");
      expect(normalizeRole("admin")).toBe("admin");
      expect(normalizeRole("super_admin")).toBe("super_admin");
    });

    it("normalizes case and spacing", () => {
      expect(normalizeRole("USER")).toBe("user");
      expect(normalizeRole(" Admin ")).toBe("admin");
      expect(normalizeRole("Super Admin")).toBe("super_admin");
      expect(normalizeRole("super-admin")).toBe("super_admin");
    });

    it("handles aliases", () => {
      expect(normalizeRole("owner")).toBe("tenant_owner");
      expect(normalizeRole("administrator")).toBe("admin");
      expect(normalizeRole("auditor")).toBe("viewer");
      expect(normalizeRole("dev")).toBe("developer");
    });

    it("returns undefined for unknown string", () => {
      expect(normalizeRole("unknown_role")).toBeUndefined();
    });
  });

  describe("object values", () => {
    it("extracts from slug", () => {
      expect(normalizeRole({ slug: "admin" })).toBe("admin");
      expect(normalizeRole({ slug: 6 })).toBe("admin");
    });

    it("extracts from name", () => {
      expect(normalizeRole({ name: "admin" })).toBe("admin");
    });

    it("extracts from role", () => {
      expect(normalizeRole({ role: "admin" })).toBe("admin");
    });

    it("extracts from roleId", () => {
      expect(normalizeRole({ roleId: "6" })).toBe("admin");
      expect(normalizeRole({ roleId: 6 })).toBe("admin");
    });

    it("extracts from role_id", () => {
      expect(normalizeRole({ role_id: 6 })).toBe("admin");
    });

    it("extracts from roleName", () => {
      expect(normalizeRole({ roleName: "admin" })).toBe("admin");
    });

    it("extracts from role_name", () => {
      expect(normalizeRole({ role_name: "admin" })).toBe("admin");
    });

    it("extracts from value", () => {
      expect(normalizeRole({ value: "admin" })).toBe("admin");
    });

    it("extracts from code", () => {
      expect(normalizeRole({ code: "admin" })).toBe("admin");
    });

    it("extracts from id", () => {
      expect(normalizeRole({ id: "6" })).toBe("admin");
    });

    it("prioritizes keys in order", () => {
      // slug > name
      expect(normalizeRole({ slug: "admin", name: "user" })).toBe("admin");
    });

    it("returns undefined if no valid key has valid role", () => {
      expect(normalizeRole({ somethingElse: "admin" })).toBeUndefined();
      expect(normalizeRole({ slug: "invalid_role" })).toBeUndefined();
      expect(normalizeRole({})).toBeUndefined();
    });
  });

  describe("other types", () => {
    it("returns undefined for boolean", () => {
      expect(normalizeRole(true)).toBeUndefined();
      expect(normalizeRole(false)).toBeUndefined();
    });

    it("returns undefined for function", () => {
      expect(normalizeRole(() => {})).toBeUndefined();
    });
  });
});
