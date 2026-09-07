import { describe, it, expect } from "vitest";
import { createTheme } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import card from "./card";
import paper from "./paper";
import dialog from "./dialog";

/**
 * The component overrides are the consumer half of the effect layer: whatever
 * `generateThemeVariables` emits only reaches a surface if one of these reads
 * it. These assertions pin the variable each surface reads and, just as
 * importantly, its position in the fallback chain - `var()` takes the first
 * name that is *defined*, so ordering is the whole behaviour.
 */
const theme = createTheme({
  palette: { background: { paper: "#ffffff" }, divider: "#e2e8f0" },
}) as Theme;
(theme as Theme & { customShadows: Record<string, string> }).customShadows = {
  md: "0 4px 6px rgba(0,0,0,0.1)",
  lg: "0 10px 15px rgba(0,0,0,0.1)",
};

const cardRoot = () => {
  const overrides = card("default") as any;
  return overrides.MuiCard.styleOverrides.root({ ownerState: {}, theme });
};

describe("surface overrides read the active effect", () => {
  it("lets the active effect win over the static surface token on cards", () => {
    // --surface-paper is a fixed design token; --effect-bg is the effect the
    // user chose. With the token first in the chain, any build that defined it
    // would pin every card opaque and no effect could show on one again.
    const { backgroundColor } = cardRoot();
    expect(backgroundColor.indexOf("--effect-bg")).toBeLessThan(
      backgroundColor.indexOf("--surface-paper"),
    );
  });

  it("takes the card radius from the active effect, not from bento alone", () => {
    // --bento-radius used to head this chain, from when bento was the only
    // effect with a radius of its own - so a neumorphic or brutalist card
    // ignored the radius its own effect had just set.
    const { borderRadius } = cardRoot();
    expect(borderRadius).toContain("--effect-radius");
    expect(borderRadius.indexOf("--comp-card-border-radius")).toBeLessThan(
      borderRadius.indexOf("--effect-radius"),
    );
  });

  it("reads a ready-made filter function for the backdrop", () => {
    // --glass-blur is a raw length; handing it to backdrop-filter drops the
    // declaration outright, which is what stopped glass cards frosting.
    const { backdropFilter } = cardRoot();
    expect(backdropFilter).toBe("var(--effect-backdrop, none)");
    expect(backdropFilter).not.toContain("--glass-blur");
  });

  it("falls back to a real theme value, never to a bare --mui-* name", () => {
    // This app builds its theme with a plain createTheme, so MUI's CSS
    // variable mode is off and no --mui-* name is ever defined; an invalid
    // var() resolves to the property's initial value, not to the theme.
    const root = cardRoot();
    for (const value of [root.backgroundColor, root.borderRadius]) {
      expect(value).not.toMatch(/--mui-[\w-]+\)\s*$/);
    }
    expect(root.backgroundColor).toContain(theme.palette.background.paper);
  });

  it("carries the effect background and backdrop onto Paper and Dialog", () => {
    const paperRoot = (paper as any).MuiPaper.styleOverrides.root({ theme });
    expect(paperRoot.backgroundColor).toContain("--effect-bg");
    expect(paperRoot.backdropFilter).toBe("var(--effect-backdrop, none)");

    const dialogPaper = (dialog("default") as any).MuiDialog.styleOverrides.paper(
      { theme },
    );
    expect(dialogPaper.backgroundColor.indexOf("--effect-bg")).toBeLessThan(
      dialogPaper.backgroundColor.indexOf("--surface-paper"),
    );
  });
});
