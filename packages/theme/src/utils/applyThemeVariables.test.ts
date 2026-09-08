import { describe, it, expect } from "vitest";
import { generateThemeVariables } from "./applyThemeVariables";
import { applyPreset } from "./mergeTheme";
import { DEFAULT_THEME_CONFIG } from "../types";

/**
 * The glass look reaches real surfaces through CSS custom properties:
 * generateThemeVariables emits them here, and the MuiPaper/MuiCard/MuiDialog
 * overrides read them. These assertions pin the producer half of that contract
 * - in particular that --effect-backdrop is a ready-made filter function,
 * since a bare length is silently discarded by backdrop-filter.
 */
describe("generateThemeVariables - glass effect", () => {
  it("emits a usable backdrop filter for the glassmorphism preset", () => {
    const { effects } = generateThemeVariables(applyPreset("glassmorphism"));

    expect(effects["--glass-enabled"]).toBe("1");
    expect(effects["--effect-backdrop"]).toBe("blur(16px)");
    expect(effects["--effect-bg"]).toBe("rgba(255, 255, 255, 0.05)");
    expect(effects["--effect-border"]).toBe(
      "1px solid rgba(255, 255, 255, 0.1)",
    );
  });

  it("keeps --glass-blur a raw length, for per-component opt-in glass", () => {
    const { effects } = generateThemeVariables(applyPreset("glassmorphism"));

    // Consumers must wrap this one in blur() themselves - reading it straight
    // into backdrop-filter is what stopped glass cards from frosting.
    expect(effects["--glass-blur"]).toBe("16px");
  });

  it("does not stamp a shadow on every surface when no effect is active", () => {
    // --effect-shadow used to be set unconditionally - to the neumorphism
    // shadow whenever neumorphism was merely enabled, and otherwise to a
    // hardcoded `0 2px 8px rgba(0,0,0,0.1)` - so it overrode the theme's own
    // elevation on every card and dialog regardless of the chosen style.
    const { effects } = generateThemeVariables(applyPreset("glassmorphism"));
    expect(effects["--effect-shadow"]).toBeUndefined();

    const neu = generateThemeVariables(applyPreset("neumorphism"));
    expect(neu.effects["--effect-shadow"]).toBe(neu.effects["--neu-shadow"]);
  });

  it("leaves surfaces alone for a preset with no global effect", () => {
    const { effects } = generateThemeVariables(applyPreset("flat-design"));

    expect(effects["--glass-enabled"]).toBe("0");
    expect(effects["--effect-backdrop"]).toBeUndefined();
    expect(effects["--effect-bg"]).toBeUndefined();
  });
});

/**
 * Every effect has to reach the surfaces, not just the two that were wired by
 * hand. `--effect-*` is what the Paper/Card/Dialog overrides and the layout
 * chrome all read, so an effect that emits none of it is an effect the user
 * selects and never sees.
 */
describe("generateThemeVariables - every effect reaches the surfaces", () => {
  // `prefix` is the effect's own CSS-variable namespace, which is not always
  // its UIEffect name (brutalism writes --brutal-*).
  const presetsByEffect = [
    { preset: "pure-brutalism", effect: "brutalism", prefix: "brutal" },
    { preset: "neo-brutalism", effect: "brutalism", prefix: "brutal" },
    { preset: "liquid-organic", effect: "organic", prefix: "organic" },
    { preset: "immersive-3d", effect: "immersive", prefix: "immersive" },
    { preset: "modern-skeuomorphic", effect: "neu", prefix: "neu" },
    { preset: "godlio-premium", effect: "glass", prefix: "glass" },
  ] as const;

  it.each(presetsByEffect)(
    "$preset applies its $effect config, not just its name",
    ({ preset, effect, prefix }) => {
      const config = applyPreset(preset);
      expect(config.effects.globalType).toBe(effect);

      const { effects } = generateThemeVariables(config);

      // The preset's own sub-config has to survive the merge. It used not to:
      // applyPreset merged only glassmorphism and neumorphism, so these
      // presets set globalType and dropped everything behind it.
      expect(effects[`--${prefix}-enabled`]).toBe("1");

      // ... and the active-surface variables have to be emitted for it.
      const surfaceVars = Object.keys(effects).filter((key) =>
        key.startsWith("--effect-"),
      );
      expect(surfaceVars.length).toBeGreaterThan(1);
      expect(effects["--effect-type"]).toBe(effect);
    },
  );

  it("emits surface variables for liquid-glass", () => {
    // liquid-glass was in the UIEffect union and in SurfaceEffectFactory, but
    // generateThemeVariables had no branch for it at all - selecting it left
    // every --effect-* unset and changed nothing on screen.
    const { effects } = generateThemeVariables({
      ...applyPreset("glassmorphism"),
      effects: {
        ...applyPreset("glassmorphism").effects,
        globalType: "liquid-glass",
        liquidGlass: { enabled: true, blur: "24px", opacity: 0.85 },
      },
    });

    expect(effects["--effect-backdrop"]).toBe("blur(24px) saturate(180%)");
    expect(effects["--effect-bg"]).toBeDefined();
    expect(effects["--effect-shadow"]).toBeDefined();
  });

  it("gives blur-based effects an ambient canvas to blur", () => {
    // backdrop-filter over a flat page colour is invisible; the wash is what
    // makes a correctly applied glass preset actually read as glass.
    const glass = generateThemeVariables(applyPreset("glassmorphism"));
    expect(glass.effects["--effect-canvas-image"]).toContain("radial-gradient");

    const flat = generateThemeVariables(applyPreset("flat-design"));
    expect(flat.effects["--effect-canvas-image"]).toBeUndefined();
  });

  it("drops the chrome underlay only while an effect owns the surface", () => {
    expect(
      generateThemeVariables(applyPreset("glassmorphism")).effects[
        "--effect-underlay"
      ],
    ).toBe("transparent");
    expect(
      generateThemeVariables(applyPreset("flat-design")).effects[
        "--effect-underlay"
      ],
    ).toBeUndefined();
  });
});

describe("applyPreset - one effect is live at a time", () => {
  it("disables the previous effect when another preset is applied", () => {
    // Both flags used to be able to sit `enabled` at once - the variable
    // emitter gates on `enabled`, so a stale one painted its effect over the
    // top of the selected one.
    const brutal = applyPreset("pure-brutalism");
    expect(brutal.effects.brutalism?.enabled).toBe(true);
    expect(brutal.effects.glassmorphism.enabled).toBe(false);
    expect(brutal.effects.neumorphism.enabled).toBe(false);

    const glass = applyPreset("glassmorphism");
    expect(glass.effects.glassmorphism.enabled).toBe(true);
    expect(glass.effects.brutalism?.enabled).toBe(false);
  });

  it("leaves every effect off for a preset with no surface effect", () => {
    const flat = applyPreset("flat-design");
    expect(flat.effects.globalType).toBe("standard");
    expect(flat.effects.glassmorphism.enabled).toBe(false);
    expect(flat.effects.neumorphism.enabled).toBe(false);
    expect(flat.effects.brutalism?.enabled).toBe(false);
  });
});

describe("generateThemeVariables - non-blur effects clear the chrome's blur", () => {
  it("sets --effect-backdrop to none for brutalism", () => {
    // The navbar defaults to its own 8px frosting behind
    // `var(--effect-backdrop, ...)`. An effect that emits nothing for this
    // variable inherits that frosting, which for brutalism is the opposite of
    // the intent.
    const { effects } = generateThemeVariables(applyPreset("pure-brutalism"));
    expect(effects["--effect-backdrop"]).toBe("none");
  });

  it("still emits a real filter for glass", () => {
    const { effects } = generateThemeVariables(applyPreset("glassmorphism"));
    expect(effects["--effect-backdrop"]).toBe("blur(16px)");
  });
});

describe("generateThemeVariables - fluid spacing", () => {
  it("emits kebab-cased --space-fluid-* from tokens.fluidSpacing", () => {
    const { spacing } = generateThemeVariables(DEFAULT_THEME_CONFIG);

    expect(spacing["--space-fluid-gutter-inline"]).toBe(
      "clamp(1rem, 0.6rem + 2vw, 2.5rem)",
    );
    expect(spacing["--space-fluid-section-gap"]).toBe(
      "clamp(2.5rem, 1.5rem + 5vw, 6rem)",
    );
  });

  it("passes a tenant override through verbatim", () => {
    const config = {
      ...DEFAULT_THEME_CONFIG,
      tokens: {
        ...DEFAULT_THEME_CONFIG.tokens,
        fluidSpacing: { sectionGap: "clamp(1rem, 4vw, 8rem)" },
      },
    };
    const { spacing } = generateThemeVariables(config);
    expect(spacing["--space-fluid-section-gap"]).toBe("clamp(1rem, 4vw, 8rem)");
  });

  it("emits nothing when fluidSpacing is absent", () => {
    const config = {
      ...DEFAULT_THEME_CONFIG,
      tokens: { ...DEFAULT_THEME_CONFIG.tokens, fluidSpacing: undefined },
    };
    const { spacing } = generateThemeVariables(config);
    expect(
      Object.keys(spacing).some((k) => k.startsWith("--space-fluid-")),
    ).toBe(false);
  });
});
