import { describe, it, expect, beforeEach } from "vitest";
import { themeEditorStore } from "./themeEditorStore";
import { applyPreset } from "../utils/mergeTheme";
import type { TenantThemeConfig } from "../types";

const root = () => document.documentElement;

describe("themeEditorStore live preview variables", () => {
  beforeEach(() => {
    themeEditorStore.discardDraft();
    root().removeAttribute("style");
  });

  it("previews the draft's colours on the document", () => {
    const draft = applyPreset("cyberpunk-hud");
    themeEditorStore.startEditing(draft);

    expect(root().style.getPropertyValue("--mui-palette-primary-main")).toBe(
      draft.tokens.colors.primary.value,
    );
    expect(
      root().style.getPropertyValue("--mui-palette-background-default"),
    ).toBe(draft.tokens.colors.background.value);
  });

  it("writes a radius token through with its own unit", () => {
    // `${md}px` on a token that already reads "2px" produced "2pxpx", which
    // the browser drops - the radius preview did nothing at all.
    themeEditorStore.startEditing(applyPreset("cyberpunk-hud"));
    const radius = root().style.getPropertyValue("--border-radius");
    expect(radius).not.toContain("pxpx");
    expect(radius).toMatch(/^\d+(\.\d+)?px$/);
  });

  it("takes its variables back off the document when the draft is discarded", () => {
    // These are inline declarations on <html>, so they outrank the stylesheet
    // ThemeBridge injects. Left behind, a cancelled edit kept painting over
    // the real theme until the next reload.
    themeEditorStore.startEditing(applyPreset("neo-brutalism"));
    expect(root().style.getPropertyValue("--border-color")).not.toBe("");

    themeEditorStore.discardDraft();

    for (const name of [
      "--mui-palette-primary-main",
      "--mui-palette-secondary-main",
      "--mui-palette-background-default",
      "--mui-palette-background-paper",
      "--border-color",
      "--border-radius",
    ]) {
      expect(root().style.getPropertyValue(name), name).toBe("");
    }
  });

  it("treats a config with no tokens as no draft at all", () => {
    themeEditorStore.startEditing({} as TenantThemeConfig);
    expect(themeEditorStore.getState().isEditing).toBe(true);
    expect(themeEditorStore.getState().draftConfig).toBeNull();
    expect(root().style.getPropertyValue("--border-color")).toBe("");
  });
});
