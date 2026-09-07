import { describe, it, expect } from "vitest";
import { AppPaths, compilePath, resolveDynamicPath } from "../routes";

describe("Routes Registry & Path Helpers (Tier 0 SSOT)", () => {
  it("should provide canonical AppPaths across all modules", () => {
    expect(AppPaths.landing.home).toBe("/");
    expect(AppPaths.landing.about).toBe("/about");
    expect(AppPaths.landing.pricing).toBe("/pricing");
    expect(AppPaths.landing.contact).toBe("/contact");
    expect(AppPaths.auth.login).toBe("/auth/sign-in");
    expect(AppPaths.auth.signin).toBe("/auth/sign-in");
    expect(AppPaths.auth.signup).toBe("/auth/sign-up");
    // Reconciled to the route the auth module actually registers.
    expect(AppPaths.account.overview).toBe("/auth/account");
    expect(AppPaths.admin.users).toBe("/admin/users");
    expect(AppPaths.admin.dashboard).toBe("/admin/dashboard");
    expect(AppPaths.theme.theme).toBe("/theme");
    expect(AppPaths.dashboard.dashboard).toBe("/dashboard");
  });

  it("compilePath should substitute route parameters correctly", () => {
    const userProfileRoute = AppPaths.admin.userProfile; // '/admin/user/:id'
    const compiled = compilePath(userProfileRoute, { id: "usr_456" });
    expect(compiled).toBe("/admin/user/usr_456");

    // samlMetadataDisplay carries no :id once reconciled to the registered
    // route, so use a role route to exercise substitution instead.
    const roleRoute = AppPaths.admin.roleDetail; // '/admin/roles/:id'
    expect(compilePath(roleRoute, { id: "role_99" })).toBe("/admin/roles/role_99");

    const multiParamTemplate = "/org/:orgId/user/:userId";
    expect(
      compilePath(multiParamTemplate, { orgId: "org_1", userId: "usr_2" }),
    ).toBe("/org/org_1/user/usr_2");
  });

  it("resolveDynamicPath should fallback to default path when item is not registered", () => {
    const registered = [{ id: "dashboard", path: "/custom-dashboard" }];

    // Matched item
    expect(
      resolveDynamicPath(registered, "dashboard", "/fallback-dashboard"),
    ).toBe("/custom-dashboard");

    // Unmatched item
    expect(
      resolveDynamicPath(registered, "non-existent", AppPaths.landing.home),
    ).toBe("/");
  });
});
