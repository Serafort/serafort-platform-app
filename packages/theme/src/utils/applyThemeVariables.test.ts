import { describe, it, expect } from "vitest";
import { generateThemeVariables } from "./applyThemeVariables";
import { applyPreset } from "./mergeTheme";

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
