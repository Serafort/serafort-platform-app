import { describe, it, expect } from "vitest";
import {
  mergeDeep,
  applyPreset,
  validateTheme,
  createThemeFromPartial,
} from "./mergeTheme";
import { THEME_PRESETS } from "../types/presets";

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
          altitude: 50,
        },
      },
    });
    expect(result.some((e) => e.includes("Neumorphism altitude"))).toBe(true);
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
});
