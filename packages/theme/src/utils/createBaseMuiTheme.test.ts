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
