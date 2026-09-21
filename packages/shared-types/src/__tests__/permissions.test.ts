import { describe, it, expect } from "vitest";
import { expandPermissions, ALL_ATOMIC_PERMISSIONS } from "../permissions";

describe("expandPermissions", () => {
  it("returns empty array for empty input", () => {
    expect(expandPermissions([])).toEqual([]);
  });

  it("passes exact matches through unchanged", () => {
    expect(expandPermissions(["auth:sso:read"])).toEqual(["auth:sso:read"]);
    expect(expandPermissions(["auth:sso:read", "tenant:billing:read"])).toEqual([
      "auth:sso:read",
      "tenant:billing:read",
    ]);
  });

  it("expands full wildcard '*' to all catalog atoms", () => {
    const catalog = ["a:read", "b:write", "c:admin"];
    expect(expandPermissions(["*"], catalog)).toEqual(catalog);
  });

  it("expands prefix wildcards correctly", () => {
    const catalog = [
      "auth:sso:read",
      "auth:sso:write",
      "auth:scim:read",
      "tenant:billing:read",
    ];

    // Prefix wildcard auth:sso:*
    const resultSso = expandPermissions(["auth:sso:*"], catalog);
    expect(resultSso).toEqual([
      "auth:sso:read",
      "auth:sso:write",
      "auth:sso:*", // keeps the wildcard string itself
    ]);

    // Broader prefix wildcard auth:*
    const resultAuth = expandPermissions(["auth:*"], catalog);
    expect(resultAuth).toEqual([
      "auth:sso:read",
      "auth:sso:write",
      "auth:scim:read",
      "auth:*",
    ]);
  });

  it("deduplicates identical permissions", () => {
    expect(expandPermissions(["auth:sso:read", "auth:sso:read"])).toEqual([
      "auth:sso:read",
    ]);
  });

  it("deduplicates overlapping permissions from exact matches and wildcards", () => {
    const catalog = ["auth:sso:read", "auth:sso:write"];
    const result = expandPermissions(["auth:sso:read", "auth:sso:*"], catalog);

    // We expect auth:sso:read to only appear once
    expect(result).toEqual([
      "auth:sso:read",
      "auth:sso:write",
      "auth:sso:*",
    ]);
  });

  it("uses ALL_ATOMIC_PERMISSIONS as default catalog", () => {
    // If we expand "*", it should contain all atomic permissions from ALL_ATOMIC_PERMISSIONS
    const result = expandPermissions(["*"]);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain(ALL_ATOMIC_PERMISSIONS[0]);
    // It should have exactly ALL_ATOMIC_PERMISSIONS length
    expect(result.length).toEqual(ALL_ATOMIC_PERMISSIONS.length);
  });
});
