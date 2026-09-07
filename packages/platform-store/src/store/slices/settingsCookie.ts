/**
 * Settings cookie bridge.
 *
 * The settings the user picks (colour mode, skin, layout) live in the persisted
 * Zustand store, but two consumers need them *before* React — and before the
 * encrypted store has hydrated:
 *
 *  - the anti-flash inline script in `app/index.html`, which paints
 *    `html.dark` and the page background on first byte;
 *  - `getMode()` / `getSystemMode()` / `getSkin()` in
 *    `@cap/platform-core/utils/helper.ts`, which read the cookie synchronously.
 *
 * Both read a cookie that nothing used to write, so they always saw the
 * defaults: dark-mode users got a white flash on every load and `getMode()`
 * never reported anything but `light`. This module is the writer, and seeds the
 * store from the cookie so first paint and first render agree.
 *
 * These helpers are inlined rather than imported from `@cap/platform-core`
 * because that package depends on `@cap/theme`, which depends on this store —
 * importing across would close a require cycle. Same reason `defaultSettings`
 * mirrors `themeConfig` locally.
 */

/**
 * Must match `themeConfig.settingsCookieName` in
 * `packages/theme/src/config/themeConfig.ts` and `cookieName` in the anti-flash
 * script in `app/index.html`. `settingsCookieName.test.ts` in `@cap/layout`
 * fails the build if these drift apart.
 */
export const SETTINGS_COOKIE_NAME = "serafort-settings";

const COOKIE_MAX_AGE_DAYS = 365;

export function readSettingsCookie<T>(): Partial<T> {
  if (typeof document === "undefined") return {};

  for (const entry of document.cookie.split(";")) {
    const [name, ...rest] = entry.trim().split("=");
    if (name !== SETTINGS_COOKIE_NAME) continue;
    try {
      return JSON.parse(decodeURIComponent(rest.join("="))) as Partial<T>;
    } catch {
      return {};
    }
  }
  return {};
}

export function writeSettingsCookie(value: unknown): void {
  if (typeof document === "undefined") return;

  const expires = new Date(
    Date.now() + COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
  ).toUTCString();

  // No `Secure` flag: the dev server runs over plain http by default, and a
  // Secure cookie would silently fail to set there. The cookie carries UI
  // preferences only - no credentials, no PII.
  document.cookie =
    `${SETTINGS_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(value))};` +
    `expires=${expires};path=/;SameSite=Lax`;
}
