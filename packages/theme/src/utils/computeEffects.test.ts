import { describe, it, expect } from "vitest";
import { createTheme } from "@mui/material/styles";
import {
  // Neumorphism
  computeNeumorphismShadows,
  computeNeumorphismBoxShadow,
  computeNeumorphismBackground,
  computeNeumorphismBorderRadius,
  // Glassmorphism
  computeGlassBackdropFilter,
  computeGlassBackground,
  computeGlassBorder,
  getGlassmorphismStyles,
  // Liquid Glass
  computeLiquidGlassBackdrop,
  computeLiquidGlassBackground,
  computeLiquidGlassBorder,
  computeLiquidGlassInnerShadow,
  computeLiquidGlassSpecularHighlight,
  computeLiquidGlassShadow,
  getLiquidGlassStyles,
  // Brutalism
  computeBrutalismBorder,
  computeBrutalismShadow,
  computeBrutalismBackground,
  getBrutalismStyles,
  // Bento
  computeBentoRadius,
  computeBentoBackground,
  computeBentoBorder,
  computeBentoShadow,
  getBentoStyles,
  // Organic
  computeOrganicRadius,
  computeOrganicFilter,
  computeOrganicBorder,
  computeOrganicBackground,
  getOrganicStyles,
  // Immersive
  computeImmersivePerspective,
  computeImmersiveTransform,
  computeImmersiveShadow,
  computeImmersiveBackground,
  getImmersiveStyles,
  // Color & RGBA
  clampAlpha,
  toRgbaString,
  parseColor,
  hexToRgba,
  rgbaToHex,
  alphaColor,
  interpolateColor,
  lightenColor,
  darkenColor,
} from "./computeEffects";

describe("computeEffects atomic and composite utilities", () => {
  const lightTheme = createTheme({
    palette: {
      mode: "light",
      background: { paper: "#ffffff" },
      text: { primary: "#111827" },
      divider: "rgba(0, 0, 0, 0.12)",
    },
    shape: { borderRadius: 8 },
  });

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
      background: { paper: "#1e293b" },
      text: { primary: "#f8fafc" },
      divider: "rgba(255, 255, 255, 0.12)",
    },
    shape: { borderRadius: 8 },
  });

  describe("Neumorphism Atomics & Composites", () => {
    it("computes light and dark shadow strings accurately", () => {
      const result = computeNeumorphismShadows({
        enabled: true,
        intensity: 0.2,
        distance: 6,
        altitude: 15,
      });
      expect(result.lightShadow).toContain("rgba(255, 255, 255, 0.2)");
      expect(result.darkShadow).toContain("rgba(0, 0, 0, 0.08)");
    });

    it("computes box shadows for normal, pressed and disabled states", () => {
      const disabled = computeNeumorphismBoxShadow({ enabled: false });
      expect(disabled).toBe("0 2px 8px rgba(0, 0, 0, 0.1)");

      const normal = computeNeumorphismBoxShadow({
        enabled: true,
        distance: 4,
      });
      expect(normal).not.toContain("inset");

      const pressed = computeNeumorphismBoxShadow(
        { enabled: true, distance: 4 },
        true,
      );
      expect(pressed).toContain("inset");
    });

    it("computes neumorphism background with fallbacks", () => {
      expect(computeNeumorphismBackground("#custom")).toBe("#custom");
      expect(computeNeumorphismBackground(undefined, lightTheme)).toBe(
        "#ffffff",
      );
      expect(computeNeumorphismBackground()).toBe("#e0e0e0");
    });

    it("computes neumorphism border radius with fallbacks", () => {
      expect(computeNeumorphismBorderRadius("16px")).toBe("16px");
      expect(computeNeumorphismBorderRadius(undefined, lightTheme)).toBe("8px");
      expect(computeNeumorphismBorderRadius()).toBe("12px");
    });
  });

  describe("Glassmorphism Atomics & Composites", () => {
    it("computes glass backdrop filter", () => {
      expect(computeGlassBackdropFilter()).toBe("blur(16px)");
      expect(computeGlassBackdropFilter("20px")).toBe("blur(20px)");
    });

    it("computes glass background with theme, hex parsing, and fallback", () => {
      expect(computeGlassBackground("rgba(0,0,0,0.5)")).toBe("rgba(0,0,0,0.5)");
      expect(computeGlassBackground("#ff0000", 0.5)).toBe(
        "rgba(255, 0, 0, 0.5)",
      );
      expect(computeGlassBackground(undefined, 0.6, lightTheme)).toContain(
        "rgba(255, 255, 255, 0.6)",
      );
      expect(computeGlassBackground(undefined, 0.8)).toBe(
        "rgba(255, 255, 255, 0.1)",
      );
    });

    it("computes glass border", () => {
      expect(computeGlassBorder("2px", "red")).toBe("2px solid red");
      expect(computeGlassBorder("1px", undefined, lightTheme)).toBe(
        "1px solid rgba(0, 0, 0, 0.12)",
      );
      expect(computeGlassBorder()).toBe("1px solid rgba(255, 255, 255, 0.2)");
    });

    it("composes getGlassmorphismStyles correctly", () => {
      const styles = getGlassmorphismStyles(
        { blur: "12px", opacity: 0.7 },
        lightTheme,
      );
      expect(styles.backdropFilter).toBe("blur(12px)");
      expect(styles.WebkitBackdropFilter).toBe("blur(12px)");
      expect(styles.opacity).toBe(0.7);
      expect(styles.border).toBe("1px solid rgba(0, 0, 0, 0.12)");
    });
  });

  describe("Liquid Glass Atomics & Composites", () => {
    it("computes liquid glass backdrop", () => {
      expect(computeLiquidGlassBackdrop()).toBe("blur(24px) saturate(180%)");
      expect(computeLiquidGlassBackdrop("30px")).toBe(
        "blur(30px) saturate(180%)",
      );
    });

    it("computes liquid glass background for light, dark, hex, and theme", () => {
      expect(computeLiquidGlassBackground("custom-bg")).toBe("custom-bg");
      expect(computeLiquidGlassBackground("#00ff00", 0.5)).toBe(
        "rgba(0, 255, 0, 0.5)",
      );
      expect(
        computeLiquidGlassBackground(undefined, 0.8, true, lightTheme),
      ).toContain("rgba(255, 255, 255, 0.8)");
      expect(computeLiquidGlassBackground(undefined, undefined, true)).toBe(
        "rgba(255, 255, 255, 0.82)",
      );
      expect(computeLiquidGlassBackground(undefined, undefined, false)).toBe(
        "rgba(23, 23, 31, 0.75)",
      );
    });

    it("computes liquid glass border, inner shadow, specular highlight, and combined shadow", () => {
      expect(computeLiquidGlassBorder("1px", undefined, true)).toBe(
        "1px solid rgba(255, 255, 255, 0.5)",
      );
      expect(computeLiquidGlassBorder("1px", undefined, false)).toBe(
        "1px solid rgba(255, 255, 255, 0.12)",
      );
      expect(computeLiquidGlassInnerShadow(undefined, true)).toContain(
        "inset 0 1px 1px 0 rgba(255, 255, 255, 0.8)",
      );
      expect(computeLiquidGlassSpecularHighlight(undefined, true)).toContain(
        "0 12px 36px 0 rgba(31, 38, 135, 0.14)",
      );

      const shadow = computeLiquidGlassShadow(undefined, undefined, true);
      expect(shadow).toContain("inset");
      expect(shadow).toContain("0 12px 36px");
    });

    it("composes getLiquidGlassStyles correctly", () => {
      const styles = getLiquidGlassStyles({ blur: "20px" }, darkTheme);
      expect(styles.backdropFilter).toBe("blur(20px) saturate(180%)");
      expect(styles.border).toBe("1px solid rgba(255, 255, 255, 0.12)");
      expect(styles.boxShadow).toBeDefined();
    });
  });

  describe("Brutalism Atomics & Composites", () => {
    it("computes brutalism border, shadow, and background", () => {
      expect(computeBrutalismBorder("3px", "#ff0000")).toBe(
        "3px solid #ff0000",
      );
      expect(computeBrutalismBorder("2px", undefined, lightTheme)).toBe(
        "2px solid #111827",
      );
      expect(computeBrutalismBorder()).toBe("2px solid #000000");

      expect(computeBrutalismShadow("6px", "#333333")).toBe(
        "6px 6px 0px 0px #333333",
      );
      expect(computeBrutalismShadow("4px", undefined, darkTheme)).toBe(
        "4px 4px 0px 0px #f8fafc",
      );

      expect(computeBrutalismBackground("#fafafa")).toBe("#fafafa");
      expect(computeBrutalismBackground(undefined, lightTheme)).toBe("#ffffff");
      expect(computeBrutalismBackground()).toBe("#ffffff");
    });

    it("composes getBrutalismStyles correctly", () => {
      const styles = getBrutalismStyles(
        { borderWidth: "3px", shadowOffset: "5px" },
        lightTheme,
      );
      expect(styles.border).toBe("3px solid #111827");
      expect(styles.boxShadow).toBe("5px 5px 0px 0px #111827");
      expect(styles.backgroundColor).toBe("#ffffff");
    });
  });

  describe("Bento Atomics & Composites", () => {
    it("computes bento radius, background, border, and shadow", () => {
      expect(computeBentoRadius("16px")).toBe("16px");
      expect(computeBentoRadius(undefined, lightTheme)).toBe("16px");
      expect(computeBentoRadius()).toBe("24px");

      expect(computeBentoBackground("#bento-bg")).toBe("#bento-bg");
      expect(computeBentoBackground(undefined, lightTheme)).toBe("#ffffff");

      expect(computeBentoBorder("2px", "green")).toBe("2px solid green");
      expect(computeBentoBorder("1px", undefined, lightTheme)).toBe(
        "1px solid rgba(0, 0, 0, 0.12)",
      );

      expect(computeBentoShadow("custom-shadow")).toBe("custom-shadow");
      expect(computeBentoShadow(undefined, lightTheme)).toBe(
        lightTheme.shadows[4],
      );
      expect(computeBentoShadow()).toBe("0 4px 12px rgba(0, 0, 0, 0.05)");
    });

    it("composes getBentoStyles correctly", () => {
      const styles = getBentoStyles({ borderRadius: "32px" }, lightTheme);
      expect(styles.borderRadius).toBe("32px");
      expect(styles.background).toBe("#ffffff");
      expect(styles.border).toBe("1px solid rgba(0, 0, 0, 0.12)");
      expect(styles.boxShadow).toBe(lightTheme.shadows[4]);
    });
  });

  describe("Organic Atomics & Composites", () => {
    it("computes organic radius based on curvature threshold", () => {
      expect(computeOrganicRadius(40)).toBe("40px");
      expect(computeOrganicRadius(80)).toBe("80% 20%");
    });

    it("computes organic filter based on fluidity", () => {
      expect(computeOrganicFilter(0)).toBe("none");
      expect(computeOrganicFilter(50)).toBe("blur(1px)");
      expect(computeOrganicFilter(100)).toBe("blur(2px)");
    });

    it("computes organic border and background", () => {
      expect(computeOrganicBorder("1px", "#ccc")).toBe("1px solid #ccc");
      expect(computeOrganicBackground(undefined, lightTheme)).toBe("#ffffff");
      expect(computeOrganicBackground()).toBe("#ffffff");
    });

    it("composes getOrganicStyles correctly", () => {
      const styles = getOrganicStyles(
        { curvature: 70, fluidity: 50 },
        lightTheme,
      );
      expect(styles.borderRadius).toBe("70% 30%");
      expect(styles.background).toBe("#ffffff");
      expect(styles.filter).toBe("blur(1px)");
      expect(styles.transition).toBe("all 0.4s cubic-bezier(0.4, 0, 0.2, 1)");
    });
  });

  describe("Immersive Atomics & Composites", () => {
    it("computes immersive perspective, transform, shadow, and background", () => {
      expect(computeImmersivePerspective("800px")).toBe("800px");
      expect(computeImmersivePerspective()).toBe("1000px");

      expect(computeImmersiveTransform("5deg", "10deg")).toBe(
        "rotateX(5deg) rotateY(10deg)",
      );
      expect(computeImmersiveTransform()).toBe("rotateX(0deg) rotateY(0deg)");

      const shadow = computeImmersiveShadow(30, "rgba(0,0,0,0.5)");
      expect(shadow).toBe(
        "0 7.5px 15px rgba(0,0,0,0.5), 0 30px 45px rgba(0,0,0,0.5)",
      );

      const hexShadow = computeImmersiveShadow(20, "#000000");
      expect(hexShadow).toContain("rgba(0, 0, 0, 0.2)");

      expect(computeImmersiveBackground(undefined, lightTheme)).toBe("#ffffff");
      expect(computeImmersiveBackground()).toBe("#ffffff");
    });

    it("composes getImmersiveStyles correctly", () => {
      const styles = getImmersiveStyles(
        { rotationX: "15deg", rotationY: "-10deg", depth: 20 },
        lightTheme,
      );
      expect(styles.perspective).toBe("1000px");
      expect(styles.transform).toBe("rotateX(15deg) rotateY(-10deg)");
      expect(styles.boxShadow).toContain("0 5px 10px");
      expect(styles.transition).toBe(
        "transform 0.3s ease-out, box-shadow 0.3s ease-out",
      );
    });
  });

  describe("Color & RGBA Utilities", () => {
    it("clamps alpha values strictly between 0 and 1", () => {
      expect(clampAlpha(-0.5)).toBe(0);
      expect(clampAlpha(1.5)).toBe(1);
      expect(clampAlpha(0.654321)).toBe(0.6543);
      expect(clampAlpha(NaN)).toBe(1);
    });

    it("formats rgba strings accurately", () => {
      expect(toRgbaString(255, 0, 128, 0.5)).toBe("rgba(255, 0, 128, 0.5)");
      expect(toRgbaString(300, -10, 50, 2)).toBe("rgba(255, 0, 50, 1)");
    });

    it("parses 3, 4, 6, and 8-digit hex colors", () => {
      expect(parseColor("#f00")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
      expect(parseColor("#f008")).toEqual({ r: 255, g: 0, b: 0, a: 0.5333 });
      expect(parseColor("#00ff00")).toEqual({ r: 0, g: 255, b: 0, a: 1 });
      expect(parseColor("#0000ff80")).toEqual({ r: 0, g: 0, b: 255, a: 0.502 });
      expect(parseColor("invalid")).toBeNull();
    });

    it("parses rgb and rgba strings", () => {
      expect(parseColor("rgb(10, 20, 30)")).toEqual({
        r: 10,
        g: 20,
        b: 30,
        a: 1,
      });
      expect(parseColor("rgba(10, 20, 30, 0.4)")).toEqual({
        r: 10,
        g: 20,
        b: 30,
        a: 0.4,
      });
    });

    it("converts hex to rgba strings with and without alpha override", () => {
      expect(hexToRgba("#fff")).toBe("rgba(255, 255, 255, 1)");
      expect(hexToRgba("#ff0000", 0.4)).toBe("rgba(255, 0, 0, 0.4)");
      expect(hexToRgba("invalid", 0.5)).toBe("rgba(0, 0, 0, 0.5)");
    });

    it("converts rgba to hex strings", () => {
      expect(rgbaToHex("rgba(255, 255, 255, 1)")).toBe("#ffffff");
      expect(rgbaToHex("rgba(0, 0, 0, 0.5)", true)).toBe("#00000080");
      expect(rgbaToHex("invalid")).toBe("#000000");
    });

    it("applies alphaColor across various color inputs and clamps alpha", () => {
      expect(alphaColor("#000000", 0.5)).toBe("rgba(0, 0, 0, 0.5)");
      expect(alphaColor("rgb(255, 255, 255)", 0.8)).toBe(
        "rgba(255, 255, 255, 0.8)",
      );
      expect(alphaColor("rgba(255, 0, 0, 0.2)", 0.9)).toBe(
        "rgba(255, 0, 0, 0.9)",
      );
      expect(alphaColor("invalid", 0.5)).toBe("rgba(0, 0, 0, 0.5)");
    });

    it("interpolates colors correctly between two hex values", () => {
      const mid = interpolateColor("#000000", "#ffffff", 0.5);
      expect(mid).toBe("#808080");
    });

    it("lightens colors accurately", () => {
      const lightened = lightenColor("#000000", 50);
      expect(lightened).toBe("#808080");
    });

    it("darkens colors accurately", () => {
      const darkened = darkenColor("#ffffff", 50);
      expect(darkened).toBe("#808080");
    });
  });
});
