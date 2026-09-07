import { describe, it, expect } from "vitest";
import { expandPermissions, ALL_ATOMIC_PERMISSIONS } from "./permissions";

describe("expandPermissions", () => {
  it("should return an empty array when given an empty permissions list", () => {
    const result = expandPermissions([]);
    expect(result).toEqual([]);
  });

  it("should handle exact matches and deduplicate them", () => {
    const permissions = ["auth:sso:read", "auth:sso:read", "theme:preset:read"];
    const result = expandPermissions(permissions);

    // Sort before comparing arrays as order might differ depending on Set implementation,
    // though the current implementation preserves insertion order.
    // We expect it to deduplicate and return exact strings.
    expect(result).toEqual(["auth:sso:read", "theme:preset:read"]);
  });

  it("should expand full wildcard '*' to all atoms in the catalog", () => {
    const result = expandPermissions(["*"]);

    // Should contain all elements of ALL_ATOMIC_PERMISSIONS
    expect(result.length).toBe(ALL_ATOMIC_PERMISSIONS.length);
    ALL_ATOMIC_PERMISSIONS.forEach(atom => {
      expect(result).toContain(atom);
    });
  });

  it("should expand prefix wildcards correctly and include the wildcard itself", () => {
    // Let's use a custom catalog for testing specificity
    const customCatalog = [
      "auth:sso:read",
      "auth:sso:delete",
      "auth:mfa:enforce",
      "theme:ai:read",
      "theme:ai:generate"
    ];

    const permissions = ["auth:sso:*"];
    const result = expandPermissions(permissions, customCatalog);

    expect(result).toContain("auth:sso:read");
    expect(result).toContain("auth:sso:delete");
    expect(result).toContain("auth:sso:*");

    // Should not contain non-matching atoms
    expect(result).not.toContain("auth:mfa:enforce");
    expect(result).not.toContain("theme:ai:read");

    expect(result.length).toBe(3);
  });

  it("should aggregate and deduplicate multiple mixed rules", () => {
    const customCatalog = [
      "auth:sso:read",
      "auth:sso:delete",
      "auth:mfa:enforce",
      "theme:ai:read",
      "theme:ai:generate"
    ];

    const permissions = ["auth:sso:*", "theme:ai:read", "auth:sso:read"];
    const result = expandPermissions(permissions, customCatalog);

    expect(result).toContain("auth:sso:read");
    expect(result).toContain("auth:sso:delete");
    expect(result).toContain("auth:sso:*");
    expect(result).toContain("theme:ai:read");

    expect(result.length).toBe(4);
  });

  it("should work with a custom catalog", () => {
    const catalog = ["cat:read", "cat:write", "dog:read", "bird:fly"];

    // Test *
    expect(expandPermissions(["*"], catalog)).toEqual(["cat:read", "cat:write", "dog:read", "bird:fly"]);

    // Test prefix wildcard
    const catResult = expandPermissions(["cat:*"], catalog);
    expect(catResult).toContain("cat:read");
    expect(catResult).toContain("cat:write");
    expect(catResult).toContain("cat:*");
    expect(catResult.length).toBe(3);
  });
});
