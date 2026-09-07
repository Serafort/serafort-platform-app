import { describe, it, expect } from "vitest";
import { expandPermissions, ALL_ATOMIC_PERMISSIONS } from "../permissions";

describe("Permissions - expandPermissions", () => {
  it("should expand full wildcard '*' to the entire catalog", () => {
    const result = expandPermissions(["*"]);
    expect(result).toHaveLength(ALL_ATOMIC_PERMISSIONS.length);
    expect(result).toEqual(expect.arrayContaining(ALL_ATOMIC_PERMISSIONS));
  });

  it("should expand prefix wildcard like 'auth:*' to correct matching atomic permissions", () => {
    const result = expandPermissions(["auth:*"]);

    // It should contain exact matches from catalog
    const expectedMatches = ALL_ATOMIC_PERMISSIONS.filter(p => p.startsWith("auth:"));
    expect(result).toEqual(expect.arrayContaining(expectedMatches));

    // It should also contain the wildcard string itself
    expect(result).toContain("auth:*");

    // Total length should be matches + 1 for the wildcard
    expect(result).toHaveLength(expectedMatches.length + 1);
  });

  it("should expand nested prefix wildcard like 'auth:sso:*'", () => {
    const result = expandPermissions(["auth:sso:*"]);

    const expectedMatches = ALL_ATOMIC_PERMISSIONS.filter(p => p.startsWith("auth:sso:"));
    expect(result).toEqual(expect.arrayContaining(expectedMatches));
    expect(result).toContain("auth:sso:*");
    expect(result).toHaveLength(expectedMatches.length + 1);
  });

  it("should handle exact strings, including both known and arbitrary permissions", () => {
    const result = expandPermissions(["auth:sso:read", "custom:permission:test"]);

    expect(result).toHaveLength(2);
    expect(result).toContain("auth:sso:read");
    expect(result).toContain("custom:permission:test");
  });

  it("should handle deduplication when overlapping globs or exact strings are passed", () => {
    const result = expandPermissions(["auth:*", "auth:sso:*", "auth:sso:read"]);

    const expectedAuthMatches = ALL_ATOMIC_PERMISSIONS.filter(p => p.startsWith("auth:"));

    expect(result).toEqual(expect.arrayContaining(expectedAuthMatches));
    expect(result).toContain("auth:*");
    expect(result).toContain("auth:sso:*");

    // Total length is all auth matches + 2 for the wildcards
    expect(result).toHaveLength(expectedAuthMatches.length + 2);

    // Ensure no duplicates exist in result
    const uniqueSet = new Set(result);
    expect(uniqueSet.size).toBe(result.length);
  });

  it("should expand permissions using a custom small catalog", () => {
    const customCatalog = ["foo:read", "foo:write", "bar:read"];

    const result = expandPermissions(["foo:*", "baz:read"], customCatalog);

    expect(result).toHaveLength(4);
    expect(result).toContain("foo:read");
    expect(result).toContain("foo:write");
    expect(result).toContain("foo:*");
    expect(result).toContain("baz:read");
    expect(result).not.toContain("bar:read");
  });
});
