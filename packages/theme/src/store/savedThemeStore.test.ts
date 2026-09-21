import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { DEFAULT_THEME_CONFIG } from "../types";
import { PRESET_LIST } from "../types/presets";
import { applyPreset } from "../utils/mergeTheme";
import { generateThemeVariables } from "../utils/applyThemeVariables";
import type { TenantThemeConfig } from "../types";

/**
 * Pressing Save used to be the one action that reliably *undid* the theme: the
 * draft was discarded, the tenant record carries branding fields but never a
 * full theme, and so the app fell back to the defaults - and a reload had
 * nothing to restore. These cover the store that holds the saved theme.
 */

const STORAGE_KEY = "serafort-theme-config";

/** Re-imports the module so it re-hydrates from storage, as a reload would. */
const freshStore = async () => {
  vi.resetModules();
  return (await import("./savedThemeStore")).savedThemeStore;
};

describe("savedThemeStore", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("has no theme before anything is saved", async () => {
    const store = await freshStore();
    expect(store.get()).toBeNull();
  });

  it("survives a reload", async () => {
    const glass = applyPreset("glassmorphism");
    (await freshStore()).save(glass);

    // A second module instance stands in for the next page load.
    const reloaded = await freshStore();
    expect(reloaded.get()?.effects?.globalType).toBe(
      glass.effects.globalType,
    );
    expect(reloaded.get()?.tokens?.colors?.primary?.value).toBe(
      glass.tokens.colors.primary.value,
    );
  });

  it("keeps every preset it is handed intact", async () => {
    for (const id of ["neumorphism", "pure-brutalism", "cyberpunk-hud"] as const) {
      window.localStorage.clear();
      const config = applyPreset(id);
      (await freshStore()).save(config);
      const reloaded = await freshStore();
      expect(reloaded.get()).toEqual(config);
    }
  });

  it.each(PRESET_LIST.map((p) => ({ id: p.id, name: p.name })))(
    "$name comes back off a reload painting exactly what it painted",
    async ({ id }) => {
      // Round-trips the whole config through storage and compares the CSS
      // custom properties either side. Comparing the emitted variables rather
      // than the object catches anything JSON cannot carry - the effects
      // block in particular, which is what actually reaches the surfaces.
      const config = applyPreset(id);
      const expected = generateThemeVariables(config);

      window.localStorage.clear();
      (await freshStore()).save(config);
      const restored = (await freshStore()).get();

      expect(restored).not.toBeNull();
      expect(generateThemeVariables(restored!)).toEqual(expected);
    },
  );

  it("clears back to nothing", async () => {
    const store = await freshStore();
    store.save(applyPreset("glassmorphism"));
    store.clear();
    expect(store.get()).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect((await freshStore()).get()).toBeNull();
  });

  it("ignores an entry written by an older version", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 0, config: DEFAULT_THEME_CONFIG }),
    );
    expect((await freshStore()).get()).toBeNull();
  });

  it("ignores a config with no tokens rather than handing on half an object", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, config: { organizationId: "x" } }),
    );
    expect((await freshStore()).get()).toBeNull();
  });

  it("survives unparseable storage", async () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");
    const store = await freshStore();
    expect(store.get()).toBeNull();
  });

  it("still applies the theme for this session when storage refuses the write", async () => {
    const store = await freshStore();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });

    const config = applyPreset("neumorphism");
    // Reported as not persisted, so the editor can say so - but the theme is
    // live either way, because a storage failure must not look like a save
    // that silently did nothing.
    expect(store.save(config)).toBe(false);
    expect(store.get()).toEqual(config);
  });

  it("notifies subscribers so the app re-themes without a reload", async () => {
    const store = await freshStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.save(applyPreset("glassmorphism") as TenantThemeConfig);
    expect(listener).toHaveBeenCalledTimes(1);

    store.clear();
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    store.save(DEFAULT_THEME_CONFIG);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
