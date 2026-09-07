import { describe, it, expect } from "vitest";
import { expandPermissions, ALL_ATOMIC_PERMISSIONS } from "../permissions";

describe("expandPermissions", () => {
  const mockCatalog = [
    "auth:sso:read",
    "auth:sso:configure",
    "auth:scim:read",
    "tenant:settings:read",
    "tenant:settings:write",
    "billing:read",
  ];

  it("should return an empty array when given empty permissions", () => {
    expect(expandPermissions([], mockCatalog)).toEqual([]);
  });

  it("should expand full wildcard '*' to all atoms in the catalog", () => {
    const result = expandPermissions(["*"], mockCatalog);
    expect(result).toEqual(mockCatalog);
  });

  it("should expand prefix wildcards correctly and retain the wildcard itself", () => {
    const result = expandPermissions(["auth:*"], mockCatalog);
    expect(result).toContain("auth:sso:read");
    expect(result).toContain("auth:sso:configure");
    expect(result).toContain("auth:scim:read");
    expect(result).toContain("auth:*");
    // Should not contain other atoms
    expect(result).not.toContain("tenant:settings:read");
    expect(result).not.toContain("billing:read");
  });

  it("should expand deeper prefix wildcards correctly", () => {
    const result = expandPermissions(["auth:sso:*"], mockCatalog);
    expect(result).toContain("auth:sso:read");
    expect(result).toContain("auth:sso:configure");
    expect(result).toContain("auth:sso:*");
    // Should not contain scim
    expect(result).not.toContain("auth:scim:read");
  });

  it("should pass exact atoms unchanged", () => {
    const result = expandPermissions(["billing:read"], mockCatalog);
    expect(result).toEqual(["billing:read"]);
  });

  it("should pass unknown/legacy strings unchanged", () => {
    const result = expandPermissions(["legacy_admin_role"], mockCatalog);
    expect(result).toEqual(["legacy_admin_role"]);
  });

  it("should handle mixed inputs and remove duplicates", () => {
    const result = expandPermissions(
      ["auth:sso:*", "tenant:settings:read", "auth:sso:read", "legacy_role"],
      mockCatalog
    );

    // From auth:sso:*
    expect(result).toContain("auth:sso:read");
    expect(result).toContain("auth:sso:configure");
    expect(result).toContain("auth:sso:*");

    // Exact atoms
    expect(result).toContain("tenant:settings:read");
    expect(result).toContain("legacy_role");

    // Length check to ensure no duplicates
    // 3 from sso wildcard (2 matched + the wildcard itself) + 1 tenant + 1 legacy = 5
    expect(result.length).toBe(5);
  });

  it("should fallback to ALL_ATOMIC_PERMISSIONS when no catalog is provided", () => {
    const result = expandPermissions(["*"]);

    // We don't know the exact atoms in the real catalog here, but we can verify
    // it returned the same array as ALL_ATOMIC_PERMISSIONS.
    // Order might differ if we use Sets but let's check equality or elements
    expect(result.length).toBe(ALL_ATOMIC_PERMISSIONS.length);

    // Since expandPermissions returns an Array.from(Set) of atoms from catalog,
    // and ALL_ATOMIC_PERMISSIONS might have duplicates or the Set removes them,
    // let's do a strict subset check or just check lengths.
    // By definition, expandPermissions(["*"]) will yield everything in the default catalog
    const resultSet = new Set(result);
    ALL_ATOMIC_PERMISSIONS.forEach(atom => {
      expect(resultSet.has(atom)).toBe(true);
    });
  });
});
