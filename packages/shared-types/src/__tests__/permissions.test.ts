import { describe, it, expect } from "vitest";
import { expandPermissions, ALL_ATOMIC_PERMISSIONS } from "../permissions";

describe("expandPermissions", () => {
  it("should return an empty array when given an empty array", () => {
    expect(expandPermissions([])).toEqual([]);
  });

  it("should return exact matches unchanged", () => {
    const input = ["auth:sso:read", "tenant:roles:write"];
    expect(expandPermissions(input)).toEqual(["auth:sso:read", "tenant:roles:write"]);
  });

  it("should return all atoms when given a full wildcard '*'", () => {
    const input = ["*"];
    const result = expandPermissions(input);
    expect(result).toEqual(ALL_ATOMIC_PERMISSIONS);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should expand prefix wildcards correctly", () => {
    const catalog = [
      "auth:sso:read",
      "auth:sso:write",
      "auth:scim:read",
      "tenant:roles:read"
    ];

    const input = ["auth:sso:*"];
    const result = expandPermissions(input, catalog);

    // It should include the matching atoms plus the wildcard itself
    expect(result).toEqual([
      "auth:sso:read",
      "auth:sso:write",
      "auth:sso:*"
    ]);
  });

  it("should deduplicate resulting permissions", () => {
    const catalog = ["auth:sso:read", "auth:sso:write"];
    const input = ["auth:sso:read", "auth:sso:read", "auth:sso:*", "auth:sso:*"];

    const result = expandPermissions(input, catalog);

    // Expected to have "auth:sso:read", "auth:sso:write", and "auth:sso:*" exactly once
    expect(result).toHaveLength(3);
    expect(result).toContain("auth:sso:read");
    expect(result).toContain("auth:sso:write");
    expect(result).toContain("auth:sso:*");
  });

  it("should handle mixed inputs properly", () => {
    const catalog = [
      "auth:sso:read",
      "auth:sso:write",
      "auth:scim:read",
      "tenant:roles:read",
      "tenant:users:write"
    ];

    const input = ["auth:sso:read", "tenant:*", "auth:scim:*", "*"];

    const result = expandPermissions(input, catalog);

    // Since '*' is in the input, all atoms in the catalog will be included
    // plus any wildcards like "tenant:*" and "auth:scim:*"

    for (const atom of catalog) {
      expect(result).toContain(atom);
    }
    expect(result).toContain("tenant:*");
    expect(result).toContain("auth:scim:*");

    // Total count = catalog.length (5) + 2 wildcards = 7
    expect(result).toHaveLength(7);
  });
});
