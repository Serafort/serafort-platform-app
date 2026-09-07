import { describe, it, expect } from "vitest";
import { AppPaths, compilePath, resolveDynamicPath } from "../routes";

describe("Routes Registry & Path Helpers (Tier 0 SSOT)", () => {
  it("should provide canonical AppPaths across all modules", () => {
    expect(AppPaths.landing.home).toBe("/");
    expect(AppPaths.landing.about).toBe("/about");
    expect(AppPaths.landing.pricing).toBe("/pricing");
    expect(AppPaths.landing.contact).toBe("/contact");
    expect(AppPaths.auth.login).toBe("/auth/login");
    expect(AppPaths.auth.signup).toBe("/auth/register");
    expect(AppPaths.account.overview).toBe("/account/overview");
    expect(AppPaths.admin.users).toBe("/admin/users");
    expect(AppPaths.admin.dashboard).toBe("/admin/dashboard");
    expect(AppPaths.theme.theme).toBe("/theme");
    expect(AppPaths.dashboard.dashboard).toBe("/dashboard");
  });

  it("compilePath should substitute route parameters correctly", () => {
    const userProfileRoute = AppPaths.admin.userProfile; // '/admin/users/:id'
    const compiled = compilePath(userProfileRoute, { id: "usr_456" });
    expect(compiled).toBe("/admin/users/usr_456");

    const samlRoute = AppPaths.admin.samlMetadataDisplay; // '/admin/sso/saml-metadata/:id'
    expect(compilePath(samlRoute, { id: "saml_99" })).toBe(
      "/admin/sso/saml-metadata/saml_99",
    );

    const multiParamTemplate = "/org/:orgId/user/:userId";
    expect(
      compilePath(multiParamTemplate, { orgId: "org_1", userId: "usr_2" }),
    ).toBe("/org/org_1/user/usr_2");
  });

  describe("resolveDynamicPath", () => {
    it("should return the path of the item matching the targetId", () => {
      const registered = [{ id: "dashboard", path: "/custom-dashboard" }];
      expect(
        resolveDynamicPath(registered, "dashboard", "/fallback"),
      ).toBe("/custom-dashboard");
    });

    it("should fallback to defaultPath if no item matches targetId or defaultPath", () => {
      const registered = [{ id: "dashboard", path: "/custom-dashboard" }];
      expect(
        resolveDynamicPath(registered, "settings", "/fallback"),
      ).toBe("/fallback");
    });

    it("should match an item by defaultPath if targetId is not found", () => {
      const registered = [
        { id: "dashboard", path: "/custom-dashboard" },
        { id: "settings", path: "/custom-settings" }
      ];
      expect(
        resolveDynamicPath(registered, "unknown", "/custom-settings"),
      ).toBe("/custom-settings");
    });

    it("should fallback to defaultPath if the matched item has no path", () => {
      const registered = [{ id: "dashboard" }];
      expect(
        resolveDynamicPath(registered, "dashboard", "/fallback"),
      ).toBe("/fallback");
    });

    it("should return defaultPath when registeredItems is empty", () => {
      expect(
        resolveDynamicPath([], "dashboard", "/fallback"),
      ).toBe("/fallback");
    });

    it("should return the first match when multiple items match", () => {
      const registered = [
        { id: "dashboard", path: "/first-match" },
        { id: "dashboard", path: "/second-match" }
      ];
      expect(
        resolveDynamicPath(registered, "dashboard", "/fallback"),
      ).toBe("/first-match");
    });
  });
});
