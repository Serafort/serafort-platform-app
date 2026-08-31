import { describe, it, expect } from "vitest";
import {
  aiThemePromptService,
  CURATED_PROMPT_SUGGESTIONS,
} from "./aiThemePromptService";

describe("aiThemePromptService", () => {
  it("correctly analyzes a cyberpunk neon prompt", () => {
    const analysis = aiThemePromptService.analyzePrompt(
      "Cyberpunk dark HUD with neon cyan primary, magenta secondary, deep void background and glowing glass borders",
    );

    expect(analysis.isDark).toBe(true);
    expect(analysis.presetMatch).toBe("cyberpunk-hud");
    expect(analysis.effectType).toBe("glass");
    expect(analysis.primaryHex).toBe("#00f0ff");
    expect(analysis.secondaryHex).toBe("#ec4899");
  });

  it("correctly analyzes a luxury obsidian gold prompt", () => {
    const analysis = aiThemePromptService.analyzePrompt(
      "Ultra-luxurious obsidian dark theme with champagne gold primary, warm bronze secondary",
    );

    expect(analysis.isDark).toBe(true);
    expect(analysis.presetMatch).toBe("godlio-premium");
    expect(analysis.primaryHex).toBe("#D4AF37");
    expect(analysis.secondaryHex).toBe("#b45309");
  });

  it("correctly analyzes a neo-brutalist prompt with sharp edges", () => {
    const analysis = aiThemePromptService.analyzePrompt(
      "Retro neo-brutalist theme with electric canary yellow primary, hot coral secondary, and sharp square corners",
    );

    expect(analysis.presetMatch).toBe("neo-brutalism");
    expect(analysis.effectType).toBe("brutalism");
    expect(analysis.borderRadius).toBe("0px");
  });

  it("correctly synthesizes a complete TenantThemeConfig", () => {
    const theme = aiThemePromptService.generateThemeFromPrompt(
      "Minimalist slate fintech SaaS with deep sapphire blue primary and emerald green accents",
    );

    expect(theme.tokens.colors.primary.value).toBe("#0f62fe");
    expect(theme.tokens.colors.background.value).toBe("#f8fafc");
    expect(theme.tokens.colors.surface.value).toBe("#ffffff");
    expect(theme.name).toContain("AI Theme:");
    expect(theme.tokens.borderRadius.md).toBeDefined();
  });

  it("contains curated prompt suggestions across diverse categories", () => {
    expect(CURATED_PROMPT_SUGGESTIONS.length).toBeGreaterThanOrEqual(5);
    const categories = CURATED_PROMPT_SUGGESTIONS.map((s) => s.category);
    expect(categories).toContain("Modern Dark");
    expect(categories).toContain("Clean SaaS");
    expect(categories).toContain("Luxury & Boutique");
  });
});
