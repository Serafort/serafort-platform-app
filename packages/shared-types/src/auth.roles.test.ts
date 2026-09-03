/**
 * Role resolution against the shapes the backend actually sends.
 *
 * The legacy `/api/auth/*` controllers send a single role — a string, an id, or
 * a role object. The `/api/v1/auth/*` controllers send `roles: string[]`
 * instead, built from the user's own role plus one per organization
 * membership. Before the array branch existed, `normalizeRole` fell through to
 * its object branch, probed `.slug`/`.name` on the array, found nothing, and
 * returned undefined — so `hasAdminRole` answered `false` for an admin signing
 * in through the v1 login route, and the UI hid every admin surface from them.
 */

import { describe, it, expect } from "vitest";

import { normalizeRole, hasAdminRole, getRoleRank } from "./auth";

describe("normalizeRole", () => {
  it("resolves the single-role shapes the legacy routes send", () => {
    expect(normalizeRole("admin")).toBe("admin");
    expect(normalizeRole("Admin")).toBe("admin");
    expect(normalizeRole({ name: "Admin" })).toBe("admin");
  });

  it("resolves a roles array to its strongest entry, whatever the order", () => {
    expect(normalizeRole(["User", "Admin"])).toBe("admin");
    expect(normalizeRole(["Admin", "User"])).toBe("admin");
  });

  it("ignores entries it cannot resolve rather than failing the whole array", () => {
    expect(normalizeRole(["not_a_real_role", "Admin"])).toBe("admin");
  });

  it("returns undefined for an empty or wholly unresolvable array", () => {
    expect(normalizeRole([])).toBeUndefined();
    expect(normalizeRole(["not_a_real_role"])).toBeUndefined();
  });
});

describe("hasAdminRole", () => {
  it("recognizes an admin arriving as a v1 roles array", () => {
    expect(hasAdminRole(["User", "Admin"])).toBe(true);
  });

  it("does not promote a non-admin array", () => {
    expect(hasAdminRole(["User"])).toBe(false);
    expect(hasAdminRole([])).toBe(false);
  });

  it("still recognizes the legacy single-role shapes", () => {
    expect(hasAdminRole("admin")).toBe(true);
    expect(hasAdminRole("user")).toBe(false);
  });
});

describe("getRoleRank", () => {
  it("ranks a roles array by its strongest entry", () => {
    expect(getRoleRank(["User", "Admin"])).toBe(getRoleRank("Admin"));
    expect(getRoleRank(["User", "Admin"])).toBeGreaterThan(getRoleRank("User"));
  });
});
