// @vitest-environment jsdom
// The cookie mirror is a DOM side effect; the rest of this package tests
// under node, so this file opts into jsdom locally.
import {
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
  vi,
} from "vitest";
import { useAppStore } from "../index";
import { SETTINGS_COOKIE_NAME } from "./settingsCookie";

/**
 * Regressions behind "dark mode never reaches the app shell".
 *
 * `tenantContext.applyTenantConfig` builds its update with optional chaining:
 *
 *   updateSettings({ mode: normalized.theme?.mode, skin: ..., semiDark: ... })
 *
 * A tenant config without a `theme.mode` therefore passed `mode: undefined`,
 * and the old spread wrote that straight over the user's setting. ThemeBridge
 * then read `settings.mode === undefined`, fell back to its `'light'` default
 * parameter, and the whole shell snapped back to light on every tenant load.
 */
describe("updateSettings", () => {
  // Under jsdom the persist layer sees a real localStorage and tries to encrypt
  // every write, which throws without a key. Supply a dummy one so the store's
  // own persistence does not raise unhandled rejections during these tests.
  beforeAll(() => {
    vi.stubEnv("VITE_STORAGE_ENCRYPTION_KEY", "0".repeat(64));
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  beforeEach(() => {
    useAppStore.getState().resetSettings();
  });

  it("ignores keys whose value is undefined instead of clobbering them", () => {
    useAppStore.getState().updateSettings({ mode: "dark", skin: "bordered" });
    expect(useAppStore.getState().settings.mode).toBe("dark");

    // Exactly the shape applyTenantConfig sends for a tenant with no theme.
    useAppStore.getState().updateSettings({
      mode: undefined,
      skin: undefined,
      semiDark: undefined,
      primaryColor: "#1976d2",
    });

    expect(useAppStore.getState().settings.mode).toBe("dark");
    expect(useAppStore.getState().settings.skin).toBe("bordered");
    expect(useAppStore.getState().settings.primaryColor).toBe("#1976d2");
  });

  it("keeps the root mode mirror in sync", () => {
    useAppStore.getState().updateSettings({ mode: "dark" });
    expect(useAppStore.getState().mode).toBe("dark");
  });

  it("mirrors settings to the cookie the pre-React readers use", () => {
    useAppStore.getState().updateSettings({ mode: "dark" });

    const raw = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${SETTINGS_COOKIE_NAME}=`));

    expect(raw, "settings cookie was written").toBeDefined();
    const parsed = JSON.parse(
      decodeURIComponent(raw!.slice(SETTINGS_COOKIE_NAME.length + 1)),
    );
    expect(parsed.mode).toBe("dark");
  });
});
