import { describe, it, expect } from "vitest";
import { getContrastRatio } from "@mui/material/styles";
import { PRESET_LIST, THEME_PRESETS } from "./presets";
import type { ThemePresetId } from "./presets";
import { applyPreset, getPresetMode } from "../utils/mergeTheme";
import { generateThemeVariables } from "../utils/applyThemeVariables";
import { composeMuiTheme } from "../utils/composeMuiTheme";
import { buildSurfaceEffect } from "../utils/SurfaceEffectFactory";

/**
 * Every preset on the Presets tab has to produce a theme somebody can actually
 * use. These run over the whole list rather than a chosen few, so a preset
 * added later cannot ship half-wired the way several of these had.
 */

const composeFor = (id: ThemePresetId) => {
  const config = applyPreset(id);
  const mode = getPresetMode(id);
  return {
    config,
    mode,
    theme: composeMuiTheme({
      currentMode: mode,
      settings: { mode, skin: "default" } as never,
      tenantTheme: config,
    }),
  };
};

const cases = PRESET_LIST.map((preset) => ({
  id: preset.id,
  name: preset.name,
}));

describe("every theme preset", () => {
  it.each(cases)("$name puts legible text on its buttons", ({ id }) => {
    // `derivePaletteColorGroup` used to hard-code white as the contrast text
    // for every palette colour. White on Cyberpunk HUD's cyan is 1.25:1 and on
    // Neo-Brutalism's canary yellow 1.33:1 - button labels that are, in
    // practice, not there. 3:1 is MUI's own contrastThreshold and the WCAG
    // floor for large text, which is what a button label is.
    const { theme } = composeFor(id);
    for (const key of ["primary", "secondary", "error", "info"] as const) {
      const group = theme.palette[key];
      expect(
        getContrastRatio(group.main, group.contrastText),
        `${id}: ${key} ${group.main} on ${group.contrastText}`,
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it.each(cases)("$name keeps body text readable on its surfaces", ({ id }) => {
    const { theme } = composeFor(id);
    const { text, background } = theme.palette;
    // Glass presets deliberately carry a translucent paper colour, which has
    // no single contrast ratio to measure; their opaque page background does.
    expect(
      getContrastRatio(text.primary, background.default),
      `${id}: body text on page`,
    ).toBeGreaterThanOrEqual(4.5);
  });

  it.each(cases)("$name declares a full chrome palette", ({ id }) => {
    // A preset that names only a primary and a background inherits the rest
    // from the Serafort statics, so Cyberpunk HUD used to render on brand navy
    // panels and Immersive 3D on the same - both read as "Serafort dark with a
    // different accent" rather than as themselves.
    const preset = THEME_PRESETS[id];
    if (id === "default") return; // intentionally empty: it *is* the default
    const colors = preset.tokens.colors || {};
    for (const key of [
      "primary",
      "secondary",
      "background",
      "surface",
      "text",
      "textMuted",
      "border",
    ]) {
      expect(colors, `${id} is missing tokens.colors.${key}`).toHaveProperty(
        key,
      );
    }
  });

  it.each(cases)("$name shows the colours it will apply", ({ id }) => {
    // The swatches on the preset card are the only preview before applying it.
    const { theme } = composeFor(id);
    const { preview } = THEME_PRESETS[id];
    expect(preview.primaryColor.toLowerCase()).toBe(
      String(theme.palette.primary.main).toLowerCase(),
    );
    expect(preview.secondaryColor.toLowerCase()).toBe(
      String(theme.palette.secondary.main).toLowerCase(),
    );
    expect(preview.backgroundColor.toLowerCase()).toBe(
      String(theme.palette.background.default).toLowerCase(),
    );
  });

  it.each(cases)("$name emits the effect it names", ({ id }) => {
    const { config } = composeFor(id);
    const globalType = config.effects.globalType;
    const { effects } = generateThemeVariables(config);
    expect(effects["--effect-type"]).toBe(globalType);

    if (globalType === "standard") {
      expect(effects["--effect-bg"]).toBeUndefined();
      return;
    }
    // Anything other than `standard` has to actually paint something.
    const surfaceVars = Object.keys(effects).filter(
      (key) => key.startsWith("--effect-") && key !== "--effect-type",
    );
    expect(surfaceVars.length, `${id} emitted no surface variables`).toBeGreaterThan(1);
  });

  it.each(cases)("$name produces surface CSS that is safe to apply", ({ id }) => {
    const { config, theme } = composeFor(id);
    const surface = buildSurfaceEffect(config.effects, theme) as Record<
      string,
      unknown
    >;

    // `filter` blurs an element together with its own content: the Liquid
    // Organic preset used to put a 1px blur across every card's text.
    expect(surface, `${id} blurs its own content`).not.toHaveProperty("filter");

    // A rotation on a shared surface skews the whole shell and moves every hit
    // target away from where it is drawn.
    expect(surface, `${id} rotates the shell`).not.toHaveProperty("transform");

    // A percentage radius resolves per axis, so on anything wider than it is
    // tall it is an ellipse rather than a corner.
    if (typeof surface.borderRadius === "string") {
      expect(surface.borderRadius, `${id} radius`).not.toContain("%");
    }

    // A zero-offset hard shadow paints nothing while still overriding whatever
    // elevation the surface would otherwise have had.
    if (typeof surface.boxShadow === "string") {
      expect(surface.boxShadow, `${id} shadow`).not.toMatch(
        /^0px 0px 0px 0px/,
      );
    }
  });

  it.each(cases)("$name keeps a neumorphic panel on its own ground", ({ id }) => {
    // The relief is made entirely of two shadows, so a panel that contrasts
    // with the canvas behind it stops reading as extruded. Modern
    // Skeuomorphism used to set the page to #f9fafb with a relief built for
    // #f3f4f6.
    const { config, theme } = composeFor(id);
    if (config.effects.globalType !== "neu") return;
    const ground = config.effects.neumorphism?.backgroundColor;
    expect(ground).toBeDefined();
    expect(String(theme.palette.background.default).toLowerCase()).toBe(
      String(ground).toLowerCase(),
    );
    expect(String(theme.palette.background.paper).toLowerCase()).toBe(
      String(ground).toLowerCase(),
    );
  });
});
