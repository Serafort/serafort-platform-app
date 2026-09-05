import { describe, it, expect } from "vitest";
import { composeMuiTheme } from "./composeMuiTheme";
import type { SystemMode, Direction } from "@cap/shared-types";

describe("composeMuiTheme", () => {
  const baseSettings = {
    skin: "default" as const,
    primaryColor: "#1976d2",
    direction: "ltr" as Direction,
    theme: "light" as const,
    layout: {
      type: "vertical" as const,
    },
    footer: {
      type: "fixed" as const,
    },
    navbar: {
      type: "fixed" as const,
    },
    i18n: {
      lang: "en",
    },
  };

  describe("basic theme generation", () => {
    it("should create a theme for light mode", () => {
      const theme = composeMuiTheme({
        currentMode: "light" as SystemMode,
        settings: baseSettings,
        direction: "ltr",
      });

      expect(theme.palette.mode).toBe("light");
      expect(theme.direction).toBe("ltr");
    });

    it("should create a theme for dark mode", () => {
      const theme = composeMuiTheme({
        currentMode: "dark" as SystemMode,
        settings: baseSettings,
        direction: "ltr",
      });

      expect(theme.palette.mode).toBe("dark");
    });

    it("should apply custom primary color from settings", () => {
      const customSettings = {
        ...baseSettings,
        primaryColor: "#ff5722",
      };

      const theme = composeMuiTheme({
        currentMode: "light" as SystemMode,
        settings: customSettings,
        direction: "ltr",
      });

      expect(theme.palette.primary.main).toBe("#ff5722");
    });

    it("should apply custom direction", () => {
      const theme = composeMuiTheme({
        currentMode: "light" as SystemMode,
        settings: baseSettings,
        direction: "rtl",
      });

      expect(theme.direction).toBe("rtl");
    });
  });

  describe("tenant theme integration", () => {
    it("should apply tenant theme colors when provided", () => {
      const tenantTheme = {
        mode: "dark" as const,
        skin: "bordered" as const,
        semiDark: false,
        primaryColor: "#00acc1",
        secondaryColor: "#ffb300",
        tokens: {
          colors: {
            primary: { value: "#00bcd4" },
            secondary: { value: "#ffc107" },
            error: { value: "#f44336" },
            success: { value: "#4caf50" },
            warning: { value: "#ff9800" },
            info: { value: "#2196f3" },
            textMuted: { value: "#9e9e9e" },
            background: { value: "#121212" },
          },
          spacing: {},
          borderRadius: {},
          typography: {},
          shadows: {},
        },
      };

      const theme = composeMuiTheme({
        currentMode: "dark" as SystemMode,
        settings: baseSettings,
        tenantTheme: tenantTheme as any,
      });

      expect(theme.palette.primary.main).toBe("#00bcd4");
      expect(theme.palette.secondary.main).toBe("#ffc107");
      expect(theme.palette.error.main).toBe("#f44336");
      expect(theme.palette.success.main).toBe("#4caf50");
    });

    it("should fall back to default theme when tenant theme is null", () => {
      const theme = composeMuiTheme({
        currentMode: "light" as SystemMode,
        settings: baseSettings,
        tenantTheme: null,
      });

      expect(theme).toBeDefined();
      expect(theme.palette.mode).toBe("light");
    });

    it("should fall back to settings primary color when tenant colors are missing", () => {
      const tenantTheme = {
        mode: "light" as const,
        skin: "default" as const,
        semiDark: false,
        primaryColor: "#1976d2",
        secondaryColor: "#ffb300",
        tokens: {
          colors: {},
          spacing: {},
          borderRadius: {},
          typography: {},
          shadows: {},
        },
      };

      const theme = composeMuiTheme({
        currentMode: "light" as SystemMode,
        settings: { ...baseSettings, primaryColor: "#9c27b0" },
        tenantTheme: tenantTheme as any,
      });

      expect(theme.palette.primary.main).toBe("#9c27b0");
    });

    it("should apply tenant typography when provided", () => {
      const tenantTheme = {
        mode: "light" as const,
        skin: "default" as const,
        semiDark: false,
        primaryColor: "#1976d2",
        secondaryColor: "#ffb300",
        tokens: {
          colors: {},
          spacing: {},
          borderRadius: {},
          typography: {
            fontFamily: { sans: "Roboto, sans-serif" },
            fontSize: { "4xl": "3rem" },
            fontWeight: { bold: 800 },
            lineHeight: { tight: 1.1 },
          },
          shadows: {},
        },
      };

      const theme = composeMuiTheme({
        currentMode: "light" as SystemMode,
        settings: baseSettings,
        tenantTheme: tenantTheme as any,
      });

      expect(theme.typography.h1.fontSize).toBe("3rem");
      expect(theme.typography.h1.fontWeight).toBe(800);
    });

    it("should apply tenant border radius when provided", () => {
      const tenantTheme = {
        mode: "light" as const,
        skin: "default" as const,
        semiDark: false,
        primaryColor: "#1976d2",
        secondaryColor: "#ffb300",
        tokens: {
          colors: {},
          spacing: {},
          borderRadius: {
            md: "12px",
            lg: "16px",
          },
          typography: {},
          shadows: {},
        },
      };

      const theme = composeMuiTheme({
        currentMode: "light" as SystemMode,
        settings: baseSettings,
        tenantTheme: tenantTheme as any,
      });

      expect(theme.shape.borderRadius).toBe(12);
      expect(theme.shape.customBorderRadius?.md).toBe(12);
      expect(theme.shape.customBorderRadius?.lg).toBe(16);
    });
  });

  describe("color variations", () => {
    it("should generate color variations (opacity tokens)", () => {
      const theme = composeMuiTheme({
        currentMode: "light" as SystemMode,
        settings: { ...baseSettings, primaryColor: "#1976d2" },
        direction: "ltr",
      });

      expect(theme.palette.primary.lighterOpacity).toBeDefined();
      expect(theme.palette.primary.lightOpacity).toBeDefined();
      expect(theme.palette.primary.mainOpacity).toBeDefined();
      expect(theme.palette.primary.darkOpacity).toBeDefined();
      expect(theme.palette.primary.darkerOpacity).toBeDefined();
    });

    it("should generate lighter color variant", () => {
      const theme = composeMuiTheme({
        currentMode: "light" as SystemMode,
        settings: { ...baseSettings, primaryColor: "#1976d2" },
        direction: "ltr",
      });

      expect(theme.palette.primary.light).not.toBe(theme.palette.primary.main);
    });

    it("should generate darker color variant", () => {
      const theme = composeMuiTheme({
        currentMode: "light" as SystemMode,
        settings: { ...baseSettings, primaryColor: "#1976d2" },
        direction: "ltr",
      });

      expect(theme.palette.primary.dark).not.toBe(theme.palette.primary.main);
    });
  });

  describe("custom colors", () => {
    it("should set customColors with background colors", () => {
      const theme = composeMuiTheme({
        currentMode: "light" as SystemMode,
        settings: baseSettings,
        direction: "ltr",
      });

      expect(theme.palette.customColors).toBeDefined();
      expect(theme.palette.customColors.bodyBg).toBeDefined();
      expect(theme.palette.customColors.chatBg).toBeDefined();
      expect(theme.palette.customColors.greyLightBg).toBeDefined();
    });

    it("should set customColors with input and table colors", () => {
      const theme = composeMuiTheme({
        currentMode: "light" as SystemMode,
        settings: baseSettings,
        direction: "ltr",
      });

      expect(theme.palette.customColors.inputBorder).toBeDefined();
      expect(theme.palette.customColors.tableHeaderBg).toBeDefined();
    });

    it("should use brand colors from primary and secondary", () => {
      const theme = composeMuiTheme({
        currentMode: "light" as SystemMode,
        settings: { ...baseSettings, primaryColor: "#1976d2" },
        direction: "ltr",
      });

      expect(theme.palette.customColors.brandGold).toBe("#1976d2");
    });
  });

  describe("component overrides", () => {
    it("should include component overrides", () => {
      const theme = composeMuiTheme({
        currentMode: "light" as SystemMode,
        settings: { ...baseSettings, skin: "default" },
        direction: "ltr",
      });

      expect(theme.components).toBeDefined();
      expect(typeof theme.components).toBe("object");
    });

    it("should apply skin-based overrides", () => {
      const defaultTheme = composeMuiTheme({
        currentMode: "light" as SystemMode,
        settings: { ...baseSettings, skin: "default" },
        direction: "ltr",
      });

      const borderedTheme = composeMuiTheme({
        currentMode: "light" as SystemMode,
        settings: { ...baseSettings, skin: "bordered" },
        direction: "ltr",
      });

      expect(defaultTheme).not.toBe(borderedTheme);
    });
  });

  describe("tenant theme attachment", () => {
    it("should attach tenant theme to the generated theme", () => {
      const tenantTheme = {
        mode: "light" as const,
        skin: "default" as const,
        semiDark: false,
        primaryColor: "#1976d2",
        secondaryColor: "#ffb300",
        tokens: {
          colors: {},
          spacing: {},
          borderRadius: {},
          typography: {},
          shadows: {},
        },
      };

      const theme = composeMuiTheme({
        currentMode: "light" as SystemMode,
        settings: baseSettings,
        tenantTheme: tenantTheme as any,
      });

      expect((theme as any).tenantTheme).toBeDefined();
    });
  });

  describe("per-mode chrome tokens", () => {
    // Regression coverage for the "dark mode never reaches the app shell" bug:
    // ColorToken.light/.dark were declared but never consumed, so a chrome
    // colour authored for light mode leaked into dark mode verbatim.
    const chromeTenantTheme = {
      mode: "light" as const,
      skin: "default" as const,
      semiDark: false,
      primaryColor: "#1976d2",
      secondaryColor: "#ffb300",
      tokens: {
        colors: {
          background: { value: "#FFFFFF", light: "#FFFFFF", dark: "#0B1220" },
          surface: { value: "#F5F5F5", light: "#F5F5F5", dark: "#151C2C" },
          text: { value: "#111111", light: "#111111", dark: "#F5F5F5" },
        },
        spacing: {},
        borderRadius: {},
        typography: {},
        shadows: {},
      },
    };

    it("prefers the explicit per-mode token over `.value` in light mode", () => {
      const theme = composeMuiTheme({
        currentMode: "light" as SystemMode,
        settings: baseSettings,
        tenantTheme: chromeTenantTheme as any,
      });

      expect(theme.palette.background.default).toBe("#FFFFFF");
      expect(theme.palette.background.paper).toBe("#F5F5F5");
      expect(theme.palette.text.primary).toBe("#111111");
    });

    it("prefers the explicit per-mode token over `.value` in dark mode", () => {
      const theme = composeMuiTheme({
        currentMode: "dark" as SystemMode,
        settings: baseSettings,
        tenantTheme: chromeTenantTheme as any,
      });

      // Not "#FFFFFF" (the light `.value`) and not light-heuristic-filtered
      // away either - the authored dark override wins outright.
      expect(theme.palette.background.default).toBe("#0B1220");
      expect(theme.palette.background.paper).toBe("#151C2C");
      expect(theme.palette.text.primary).toBe("#F5F5F5");
    });

    it("falls back to the lightness heuristic when only `.value` is set", () => {
      const legacyTenantTheme = {
        mode: "light" as const,
        skin: "default" as const,
        semiDark: false,
        primaryColor: "#1976d2",
        secondaryColor: "#ffb300",
        tokens: {
          // Every config authored before per-mode tokens existed looks like
          // this: no `.light`/`.dark`, `.value` only.
          colors: { background: { value: "#FFFFFF" } },
          spacing: {},
          borderRadius: {},
          typography: {},
          shadows: {},
        },
      };

      const light = composeMuiTheme({
        currentMode: "light" as SystemMode,
        settings: baseSettings,
        tenantTheme: legacyTenantTheme as any,
      });
      const dark = composeMuiTheme({
        currentMode: "dark" as SystemMode,
        settings: baseSettings,
        tenantTheme: legacyTenantTheme as any,
      });

      // Light: "#FFFFFF" fits light mode, so the tenant's value is honoured.
      expect(light.palette.background.default).toBe("#FFFFFF");
      // Dark: "#FFFFFF" does not fit dark mode, so the mode's own static
      // background wins instead of a white page in dark mode.
      expect(dark.palette.background.default).not.toBe("#FFFFFF");
    });

    it("resolves DEFAULT_THEME_CONFIG's own chrome tokens correctly in both modes", () => {
      const light = composeMuiTheme({
        currentMode: "light" as SystemMode,
        settings: baseSettings,
        tenantTheme: null,
      });
      const dark = composeMuiTheme({
        currentMode: "dark" as SystemMode,
        settings: baseSettings,
        tenantTheme: null,
      });

      expect(light.palette.background.default).toBe("#F6F8FC");
      expect(light.palette.text.primary).toBe("#031433");
      expect(dark.palette.background.default).toBe("#031433");
      expect(dark.palette.text.primary).toBe("#FFFFFF");
    });
  });
});
