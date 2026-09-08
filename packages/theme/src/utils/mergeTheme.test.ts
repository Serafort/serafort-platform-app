import { describe, it, expect } from "vitest";
import {
  mergeDeep,
  applyPreset,
  getPresetMode,
  mergeThemeWithPreset,
  validateTheme,
  createThemeFromPartial,
} from "./mergeTheme";
import { THEME_PRESETS } from "../types/presets";
import { DEFAULT_THEME_CONFIG } from "../types";
import type { TenantThemeConfig } from "../types";

describe("mergeDeep", () => {
  it("should return target when no sources provided", () => {
    const target = { a: 1, b: 2 };
    const result = mergeDeep(target);
    expect(result).toEqual(target);
  });

  it("should merge simple properties", () => {
    const target = { a: 1 };
    const source = { b: 2 };
    const result = mergeDeep(target, source);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("should deep merge nested objects", () => {
    const target = { a: { x: 1 } };
    const source = { a: { y: 2 } };
    const result = mergeDeep(target, source);
    expect(result).toEqual({ a: { x: 1, y: 2 } });
  });

  it("should overwrite non-object values", () => {
    const target = { a: 1 };
    const source = { a: 2 };
    const result = mergeDeep(target, source);
    expect(result).toEqual({ a: 2 });
  });

  it("should handle multiple sources", () => {
    const target = { a: 1 };
    const source1 = { b: 2 };
    const source2 = { c: 3 };
    const result = mergeDeep(target, source1, source2);
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  it("should not merge arrays", () => {
    const target = { arr: [1, 2] };
    const source = { arr: [3, 4] };
    const result = mergeDeep(target, source);
    expect(result).toEqual({ arr: [3, 4] });
  });

  it("terminates on a self-referential source instead of overflowing the stack", () => {
    const source: Record<string, unknown> = { a: { x: 1 } };
    source.self = source;
    (source.a as Record<string, unknown>).back = source;

    const result = mergeDeep<Record<string, unknown>>({}, source);

    expect((result.a as Record<string, number>).x).toBe(1);
  });

  it("ignores prototype-polluting keys", () => {
    const result = mergeDeep<Record<string, unknown>>(
      {},
      JSON.parse('{"__proto__":{"polluted":true},"safe":1}'),
    );

    expect(result.safe).toBe(1);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect((Object.prototype as Record<string, unknown>).polluted).toBeUndefined();
  });
});

describe("applyPreset", () => {
  it("should return default config for invalid preset", () => {
    const result = applyPreset("invalid-preset" as any);
    expect(result).toBeDefined();
    expect(result.preset).toBeUndefined();
  });

  it("should apply valid preset", () => {
    const presetIds = Object.keys(THEME_PRESETS) as Array<
      keyof typeof THEME_PRESETS
    >;
    if (presetIds.length > 0) {
      const firstPreset = presetIds[0];
      const result = applyPreset(firstPreset);
      expect(result).toBeDefined();
      expect(result.preset).toBe(firstPreset);
    }
  });

  it("should include preset tokens", () => {
    const presetIds = Object.keys(THEME_PRESETS) as Array<
      keyof typeof THEME_PRESETS
    >;
    if (presetIds.length > 0) {
      const firstPreset = presetIds[0];
      const preset = THEME_PRESETS[firstPreset];
      const result = applyPreset(firstPreset);

      if (preset.tokens?.colors) {
        expect(result.tokens.colors).toBeDefined();
      }
    }
  });
});

describe("validateTheme", () => {
  it("should return error when organizationId is missing", () => {
    const result = validateTheme({});
    expect(result).toContain("Organization ID is required");
  });

  it("should return no errors for valid theme", () => {
    const result = validateTheme({
      organizationId: "org-123",
      tokens: {
        colors: {
          primary: { value: "#1976d2" },
        },
      },
    });
    expect(result).toEqual([]);
  });

  it("should validate color format", () => {
    const result = validateTheme({
      organizationId: "org-123",
      tokens: {
        colors: {
          primary: { value: "invalid-color" },
        },
      },
    });
    expect(result.some((e) => e.includes("Invalid color value"))).toBe(true);
  });

  it("should accept hex colors", () => {
    const result = validateTheme({
      organizationId: "org-123",
      tokens: {
        colors: {
          primary: { value: "#ff5722" },
          secondary: { value: "#f00" },
        },
      },
    });
    expect(result.some((e) => e.includes("Invalid color value"))).toBe(false);
  });

  it("should accept rgba colors", () => {
    const result = validateTheme({
      organizationId: "org-123",
      tokens: {
        colors: {
          primary: { value: "rgba(255, 0, 0, 0.5)" },
        },
      },
    });
    expect(result.some((e) => e.includes("Invalid color value"))).toBe(false);
  });

  it("should validate neumorphism intensity", () => {
    const result = validateTheme({
      organizationId: "org-123",
      effects: {
        neumorphism: {
          intensity: 1.5,
        },
      },
    });
    expect(result.some((e) => e.includes("Neumorphism intensity"))).toBe(true);
  });

  it("should validate neumorphism distance", () => {
    const result = validateTheme({
      organizationId: "org-123",
      effects: {
        neumorphism: {
          distance: 25,
        },
      },
    });
    expect(result.some((e) => e.includes("Neumorphism distance"))).toBe(true);
  });

  it("should validate neumorphism altitude", () => {
    const result = validateTheme({
      organizationId: "org-123",
      effects: {
        neumorphism: {
          altitude: 100,
        },
      },
    });
    expect(result.some((e) => e.includes("Neumorphism altitude"))).toBe(true);
  });

  it("accepts a light angle anywhere in the quadrant", () => {
    // `altitude` is the light's elevation above the horizon, so the whole
    // 0-90 quadrant is meaningful. It was capped at 45 while the geometry
    // underneath was measuring from somewhere else entirely.
    for (const altitude of [0, 45, 60, 90]) {
      const result = validateTheme({
        organizationId: "org-123",
        effects: { neumorphism: { altitude } },
      });
      expect(result.some((e) => e.includes("Neumorphism altitude"))).toBe(false);
    }
  });
});

describe("createThemeFromPartial", () => {
  it("should create theme with organization ID", () => {
    const result = createThemeFromPartial({}, "org-123");
    expect(result.organizationId).toBe("org-123");
  });

  it("should apply partial name", () => {
    const result = createThemeFromPartial({ name: "My Theme" }, "org-123");
    expect(result.name).toBe("My Theme");
  });

  it("should apply partial preset", () => {
    const result = createThemeFromPartial({ preset: "minimal" }, "org-123");
    expect(result.preset).toBe("minimal");
  });

  it("should merge partial colors", () => {
    const result = createThemeFromPartial(
      {
        tokens: {
          colors: {
            primary: { value: "#ff5722" },
          },
        },
      },
      "org-123",
    );
    expect(result.tokens.colors.primary).toBeDefined();
  });

  it("carries a partial navigation layout onto the config", () => {
    const result = createThemeFromPartial({ layout: "horizontal" }, "org-123");
    expect(result.layout).toBe("horizontal");
  });

  it("defaults the navigation layout to vertical", () => {
    expect(createThemeFromPartial({}, "org-123").layout).toBe("vertical");
    expect(DEFAULT_THEME_CONFIG.layout).toBe("vertical");
  });
});

describe("mergeThemeWithPreset - navigation layout", () => {
  it("keeps the tenant's chosen layout when a preset is applied", () => {
    // Presets do not define a layout, so switching preset must not silently
    // move a tenant off the sidebar/topbar choice they made.
    const previous = {
      ...DEFAULT_THEME_CONFIG,
      layout: "horizontal",
    } as TenantThemeConfig;

    expect(mergeThemeWithPreset(previous, "dark-ui").layout).toBe("horizontal");
  });
});

describe("mergeThemeWithPreset", () => {
  it("applies a preset onto an incomplete config instead of throwing", () => {
    // The theme editor opens with an empty draft and only fills it in on the
    // first edit, so selecting a preset as the very first action used to
    // arrive here as `{}` and throw on `draft.tokens.colors` - which the user
    // saw as the preset card doing nothing at all.
    const result = mergeThemeWithPreset({} as TenantThemeConfig, "dark-ui");

    expect(result.preset).toBe("dark-ui");
    expect(result.tokens.colors.primary.value).toBe(
      THEME_PRESETS["dark-ui"].tokens.colors!.primary!.value,
    );
    expect(result.tokens.colors.background.value).toBe(
      THEME_PRESETS["dark-ui"].tokens.colors!.background!.value,
    );
  });

  it("drops per-mode overrides the previous theme had for a chrome colour", () => {
    // An explicit `.light`/`.dark` beats `.value` in resolveChromeColor, so a
    // leftover one would keep painting the old surface under the new preset.
    const previous = {
      ...DEFAULT_THEME_CONFIG,
      tokens: {
        ...DEFAULT_THEME_CONFIG.tokens,
        colors: {
          ...DEFAULT_THEME_CONFIG.tokens.colors,
          background: { value: "#ffffff", light: "#ffffff", dark: "#031433" },
        },
      },
    } as TenantThemeConfig;

    const result = mergeThemeWithPreset(previous, "dark-ui");

    expect(result.tokens.colors.background.value).toBe("#09090b");
    expect(result.tokens.colors.background.dark).toBeUndefined();
    expect(result.tokens.colors.background.light).toBeUndefined();
  });
});

describe("getPresetMode", () => {
  it("reads dark from a preset previewed on a dark background", () => {
    expect(getPresetMode("dark-ui")).toBe("dark");
    expect(getPresetMode("serafort-dark")).toBe("dark");
  });

  it("reads light from a preset previewed on a light background", () => {
    expect(getPresetMode("serafort")).toBe("light");
    expect(getPresetMode("default")).toBe("light");
  });

  it("records the mode on the config a preset produces", () => {
    expect(applyPreset("dark-ui").metadata?.mode).toBe("dark");
    expect(applyPreset("serafort").metadata?.mode).toBe("light");
  });
});
