import { describe, it, expect } from "vitest";
import { expandPermissions, ALL_ATOMIC_PERMISSIONS } from "../permissions";

describe("expandPermissions", () => {
  it("should handle empty inputs", () => {
    expect(expandPermissions([])).toEqual([]);
  });

  it("should pass through exact matches unchanged", () => {
    const permissions = ["auth:sso:read", "auth:idp:create"];
    const result = expandPermissions(permissions);

    expect(result).toHaveLength(2);
    expect(result).toContain("auth:sso:read");
    expect(result).toContain("auth:idp:create");
  });

  it("should expand the full wildcard '*' to all atomic permissions", () => {
    const result = expandPermissions(["*"]);

    // '*' expands to all catalog atoms, but not '*' itself
    expect(result).toHaveLength(ALL_ATOMIC_PERMISSIONS.length);
    ALL_ATOMIC_PERMISSIONS.forEach(atom => {
      expect(result).toContain(atom);
    });
    expect(result).not.toContain("*");
  });

  it("should expand prefix wildcards correctly and retain the wildcard string", () => {
    const result = expandPermissions(["auth:sso:*"]);

    const expectedAtoms = ALL_ATOMIC_PERMISSIONS.filter(atom => atom.startsWith("auth:sso:"));

    // Check that we found some expected atoms to make the test meaningful
    expect(expectedAtoms.length).toBeGreaterThan(0);

    // Length should be expected matching atoms + 1 for the wildcard string itself
    expect(result).toHaveLength(expectedAtoms.length + 1);

    expectedAtoms.forEach(atom => {
      expect(result).toContain(atom);
    });
    expect(result).toContain("auth:sso:*");
  });

  it("should handle multiple prefix wildcards", () => {
    const result = expandPermissions(["auth:sso:*", "theme:tokens:*"]);

    const expectedSsoAtoms = ALL_ATOMIC_PERMISSIONS.filter(atom => atom.startsWith("auth:sso:"));
    const expectedTokensAtoms = ALL_ATOMIC_PERMISSIONS.filter(atom => atom.startsWith("theme:tokens:"));

    expect(result).toContain("auth:sso:*");
    expect(result).toContain("theme:tokens:*");

    expectedSsoAtoms.forEach(atom => expect(result).toContain(atom));
    expectedTokensAtoms.forEach(atom => expect(result).toContain(atom));
  });

  it("should deduplicate resulting permissions", () => {
    // Both inputs will yield 'auth:sso:read' and 'auth:sso:*' (from the wildcard)
    const permissions = ["auth:sso:read", "auth:sso:*", "auth:sso:read"];
    const result = expandPermissions(permissions);

    const ssoAtoms = ALL_ATOMIC_PERMISSIONS.filter(atom => atom.startsWith("auth:sso:"));
    expect(result).toHaveLength(ssoAtoms.length + 1); // atoms + 'auth:sso:*'

    // The exact match shouldn't result in duplicates
    const readCount = result.filter(p => p === "auth:sso:read").length;
    expect(readCount).toBe(1);
  });

  it("should pass through unknown or invalid strings unchanged", () => {
    const permissions = ["unknown:permission", "invalid-format"];
    const result = expandPermissions(permissions);

    expect(result).toHaveLength(2);
    expect(result).toContain("unknown:permission");
    expect(result).toContain("invalid-format");
  });

  it("should respect a custom catalog if provided", () => {
    const customCatalog = ["custom:read", "custom:write", "other:read"];

    const resultAll = expandPermissions(["*"], customCatalog);
    expect(resultAll).toHaveLength(3);
    expect(resultAll).toEqual(expect.arrayContaining(customCatalog));

    const resultPrefix = expandPermissions(["custom:*"], customCatalog);
    expect(resultPrefix).toHaveLength(3); // 'custom:read', 'custom:write', 'custom:*'
    expect(resultPrefix).toContain("custom:read");
    expect(resultPrefix).toContain("custom:write");
    expect(resultPrefix).toContain("custom:*");
    expect(resultPrefix).not.toContain("other:read");
  });
});
