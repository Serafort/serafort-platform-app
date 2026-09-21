import { describe, it, expect } from "vitest";
import { createBaseMuiTheme } from "./createBaseMuiTheme";
import type { Settings, SystemMode, Direction } from "@cap/shared-types";

const defaultSettings: Settings = {
  mode: "light",
  skin: "default",
  semiDark: false,
  layout: "vertical",
  contentWidth: "compact",
  navbarContentWidth: "compact",
  footerContentWidth: "compact",
  effect: "standard",
};

describe("createBaseMuiTheme", () => {
  describe("basic theme creation", () => {
    it("should create a light theme options object", () => {
      const theme = createBaseMuiTheme(
        defaultSettings,
        "light" as SystemMode,
        "ltr" as Direction,
      );

      expect(theme.direction).toBe("ltr");
      expect(theme.shape?.borderRadius).toBe(6);
    });

    it("should create a dark theme options object", () => {
      const theme = createBaseMuiTheme(
        defaultSettings,
        "dark" as SystemMode,
        "ltr" as Direction,
      );

      expect(theme.direction).toBe("ltr");
      expect(theme.shadows).toBeDefined();
    });

    it("should set RTL direction", () => {
      const theme = createBaseMuiTheme(
        defaultSettings,
        "light" as SystemMode,
        "rtl" as Direction,
      );

      expect(theme.direction).toBe("rtl");
    });
  });

  describe("coloured elevation rings (customShadows)", () => {
    it("keeps legacy hues when no brand colours are passed", () => {
      const theme = createBaseMuiTheme(
        defaultSettings,
        "light" as SystemMode,
        "ltr" as Direction,
      );

      const primary = theme.customShadows?.primary as { md: string };
      expect(primary.md).toBe("rgba(115, 103, 240, 0.4) 0px 4px 16px");
    });

    it("projects the coloured rings from the tenant's brand + status colours", () => {
      const theme = createBaseMuiTheme(
        defaultSettings,
        "light" as SystemMode,
        "ltr" as Direction,
        {
          primary: "#047BFA",
          error: "#FF0000",
        },
      );

      const primary = theme.customShadows?.primary as {
        sm: string;
        md: string;
        lg: string;
      };
      expect(primary.sm).toBe("rgba(4, 123, 250, 0.3) 0px 2px 6px");
      expect(primary.md).toBe("rgba(4, 123, 250, 0.4) 0px 4px 16px");
      expect(primary.lg).toBe("rgba(4, 123, 250, 0.5) 0px 6px 20px");

      const error = theme.customShadows?.error as { md: string };
      expect(error.md).toBe("rgba(255, 0, 0, 0.4) 0px 4px 16px");

      // A slot with no colour supplied still falls back to its legacy hue.
      const success = theme.customShadows?.success as { md: string };
      expect(success.md).toBe("rgba(40, 199, 111, 0.4) 0px 4px 16px");
    });

    it("falls back to the legacy hue when a brand colour is unparseable", () => {
      const theme = createBaseMuiTheme(
        defaultSettings,
        "light" as SystemMode,
        "ltr" as Direction,
        { primary: "not-a-color" },
      );

      const primary = theme.customShadows?.primary as { md: string };
      expect(primary.md).toBe("rgba(115, 103, 240, 0.4) 0px 4px 16px");
    });

    it("uses settings.primaryColor for the primary ring when no explicit primary is given", () => {
      const theme = createBaseMuiTheme(
        { ...defaultSettings, primaryColor: "#047BFA" },
        "light" as SystemMode,
        "ltr" as Direction,
      );

      const primary = theme.customShadows?.primary as { md: string };
      expect(primary.md).toBe("rgba(4, 123, 250, 0.4) 0px 4px 16px");
    });
  });

  describe("typography and shape", () => {
    it("should include shape configuration", () => {
      const theme = createBaseMuiTheme(
        defaultSettings,
        "light" as SystemMode,
        "ltr" as Direction,
      );

      expect(theme.shape).toBeDefined();
      expect(theme.shape?.borderRadius).toBe(6);
    });

    it("should include shadows", () => {
      const theme = createBaseMuiTheme(
        defaultSettings,
        "light" as SystemMode,
        "ltr" as Direction,
      );

      expect(theme.shadows).toBeDefined();
      expect(Array.isArray(theme.shadows)).toBe(true);
    });
  });
});
