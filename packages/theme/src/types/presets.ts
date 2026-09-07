import type { PrimitiveTokens } from "./designTokens";
import type { EffectConfig } from "./effects";
import type { ComponentStyles } from "./componentStyles";

export type ThemePresetId =
  | "serafort"
  | "serafort-dark"
  | "flat-design"
  | "material-design"
  | "neumorphism"
  | "glassmorphism"
  | "pure-brutalism"
  | "minimalism"
  | "dark-ui"
  | "cyberpunk-hud"
  | "liquid-organic"
  | "retro-y2k"
  | "immersive-3d"
  | "neo-brutalism"
  | "modern-skeuomorphic"
  | "godlio-premium"
  | "default";

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  description: string;
  preview: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
  };
  tokens: {
    colors?: Partial<PrimitiveTokens["colors"]>;
    spacing?: Partial<PrimitiveTokens["spacing"]>;
    borderRadius?: Partial<PrimitiveTokens["borderRadius"]>;
    typography?: {
      fontFamily?: Partial<PrimitiveTokens["typography"]["fontFamily"]>;
      fontSize?: Partial<PrimitiveTokens["typography"]["fontSize"]>;
      fontWeight?: Partial<PrimitiveTokens["typography"]["fontWeight"]>;
      lineHeight?: Partial<PrimitiveTokens["typography"]["lineHeight"]>;
    };
  };
  effects: Partial<EffectConfig>;
  components: Partial<ComponentStyles>;
}

export const THEME_PRESETS: Record<ThemePresetId, ThemePreset> = {
  // ── Serafort house style (brand-kit aligned) ──────────────────────────────
  serafort: {
    id: "serafort",
    name: "Serafort",
    description:
      "Serafort house style: brand blue on blue-tinted fog, Space Grotesk headings",
    preview: {
      primaryColor: "#047BFA",
      secondaryColor: "#06CBFD",
      backgroundColor: "#F6F8FC",
    },
    tokens: {
      colors: {
        primary: { value: "#047BFA", description: "Serafort blue" },
        secondary: { value: "#06CBFD", description: "Serafort cyan accent" },
        background: { value: "#F6F8FC", description: "Fog 50" },
        surface: { value: "#FFFFFF", description: "White surface" },
        text: { value: "#031433", description: "Brand ink" },
        textMuted: { value: "#454F68", description: "Slate 600" },
        border: { value: "#C7D1E3", description: "Mist 300" },
      },
      typography: {
        fontFamily: {
          sans: '"Inter", "Segoe UI", system-ui, sans-serif',
          display: '"Space Grotesk", "Segoe UI", system-ui, sans-serif',
        },
      },
      borderRadius: { md: "8px" },
    },
    effects: { globalType: "standard" },
    components: { button: { style: "standard" } },
  },
  "serafort-dark": {
    id: "serafort-dark",
    name: "Serafort Dark",
    description:
      "Serafort on the ink ground: navy surfaces with the cyan wing accent",
    preview: {
      primaryColor: "#06A0FC",
      secondaryColor: "#06CBFD",
      backgroundColor: "#031433",
    },
    tokens: {
      colors: {
        primary: { value: "#06A0FC", description: "Serafort sky" },
        secondary: { value: "#06CBFD", description: "Serafort cyan accent" },
        background: { value: "#031433", description: "Brand ink" },
        surface: { value: "#032457", description: "Brand navy" },
        text: { value: "#FFFFFF", description: "White" },
        textMuted: { value: "#C7D1E3", description: "Mist 300" },
        border: { value: "#1B2F5C", description: "Dark border" },
      },
      typography: {
        fontFamily: {
          sans: '"Inter", "Segoe UI", system-ui, sans-serif',
          display: '"Space Grotesk", "Segoe UI", system-ui, sans-serif',
        },
      },
      borderRadius: { md: "8px" },
    },
    effects: { globalType: "standard" },
    components: {},
  },
  default: {
    id: "default",
    name: "Default",
    description: "Clean, minimal design with balanced proportions",
    // The card's swatches have to be the colours the preset actually applies,
    // or it advertises a theme the user does not get. This one shows the
    // defaults, whose secondary is the brand navy, not the cyan accent.
    preview: {
      primaryColor: "#047BFA",
      secondaryColor: "#032457",
      backgroundColor: "#F6F8FC",
    },
    tokens: {},
    effects: { globalType: "standard" },
    components: {},
  },
  "flat-design": {
    id: "flat-design",
    name: "Flat Design 2.0",
    description:
      "Minimalist style with vibrant colors and clear bidimensional elements",
    preview: {
      primaryColor: "#1e40af",
      secondaryColor: "#3b82f6",
      backgroundColor: "#f1f5f9",
    },
    tokens: {
      colors: {
        primary: { value: "#1e40af", description: "Deep navy blue" },
        secondary: { value: "#3b82f6", description: "Bright blue" },
        background: { value: "#f1f5f9", description: "Light gray background" },
        surface: { value: "#ffffff", description: "White surface" },
        text: { value: "#0f172a", description: "Dark text" },
        textMuted: { value: "#64748b", description: "Muted text" },
        border: { value: "#cbd5e1", description: "Light border" },
      },
      borderRadius: { md: "10px" },
    },
    effects: { globalType: "standard" },
    components: { button: { style: "standard" } },
  },
  "material-design": {
    id: "material-design",
    name: "Material Design",
    description:
      "Google-inspired hierarchy with depth, cards, and fluid animations",
    preview: {
      primaryColor: "#6200ee",
      secondaryColor: "#03dac6",
      backgroundColor: "#fafafa",
    },
    tokens: {
      colors: {
        primary: { value: "#6200ee", description: "Material Purple" },
        secondary: { value: "#03dac6", description: "Material Teal" },
        background: { value: "#fafafa" },
        surface: { value: "#ffffff" },
        text: { value: "#1c1b1f", description: "Material on-surface" },
        textMuted: {
          value: "#49454f",
          description: "Material on-surface variant",
        },
        border: { value: "#e7e0ec", description: "Material outline variant" },
      },
      borderRadius: { md: "12px" },
    },
    effects: { globalType: "standard" }, // Standard logic handles typical Material shadows
    components: {},
  },
  neumorphism: {
    id: "neumorphism",
    name: "Neumorphism (Soft UI)",
    description: "Soft shadows creating a molded relief effect in the UI",
    preview: {
      primaryColor: "#6366f1",
      secondaryColor: "#8b5cf6",
      backgroundColor: "#e0e5ec",
    },
    tokens: {
      colors: {
        primary: { value: "#6366f1", description: "Soft purple primary" },
        secondary: { value: "#8b5cf6", description: "Soft indigo secondary" },
        background: { value: "#e0e5ec", description: "Soft gray background" },
        surface: { value: "#e0e5ec", description: "Same as background" },
        text: { value: "#374151", description: "Dark gray text" },
        textMuted: { value: "#6b7280", description: "Muted text" },
        border: { value: "#d1d5db", description: "Subtle border" },
      },
      borderRadius: { md: "16px", lg: "24px" },
    },
    effects: {
      globalType: "neu",
      neumorphism: {
        enabled: true,
        backgroundColor: "#e0e5ec",
        intensity: 0.15,
        distance: 6,
        altitude: 45,
        borderRadius: "16px",
      },
    },
    components: { card: { style: "neu" }, button: { style: "neu" } },
  },
  glassmorphism: {
    id: "glassmorphism",
    name: "Glassmorphism",
    description: "Translucent frosted glass panels with background blur",
    preview: {
      primaryColor: "#8b5cf6",
      secondaryColor: "#6366f1",
      backgroundColor: "#0f172a",
    },
    tokens: {
      colors: {
        primary: { value: "#8b5cf6", description: "Purple primary" },
        secondary: { value: "#6366f1", description: "Indigo secondary" },
        background: { value: "#0f172a", description: "Dark slate background" },
        surface: {
          value: "rgba(30, 41, 59, 0.8)",
          description: "Glass surface",
        },
        text: { value: "#f8fafc", description: "Light text" },
        textMuted: { value: "#94a3b8", description: "Muted text" },
        border: {
          value: "rgba(255, 255, 255, 0.1)",
          description: "Subtle border",
        },
      },
    },
    effects: {
      globalType: "glass",
      glassmorphism: {
        enabled: true,
        blur: "16px",
        background: "rgba(255, 255, 255, 0.05)",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: "1px",
        opacity: 0.8,
      },
    },
    components: { card: { style: "glass" }, button: { style: "glass" } },
  },
  "pure-brutalism": {
    id: "pure-brutalism",
    name: "Pure Brutalism",
    description:
      "Raw, unpolished aesthetic focused on content and functionality",
    preview: {
      primaryColor: "#ff1493",
      secondaryColor: "#00b300",
      backgroundColor: "#ffffff",
    },
    tokens: {
      colors: {
        primary: { value: "#ff1493", description: "Raw magenta" },
        secondary: { value: "#00b300", description: "Raw green" },
        background: { value: "#ffffff" },
        surface: {
          value: "#ffffff",
          description: "No separation from the page",
        },
        border: { value: "#000000" },
        text: { value: "#000000" },
        textMuted: { value: "#333333" },
      },
      borderRadius: { md: "0px" },
    },
    effects: {
      globalType: "brutalism",
      brutalism: {
        enabled: true,
        borderWidth: "2px",
        borderColor: "#000000",
        shadowOffset: "0px",
        shadowColor: "#000000",
        backgroundColor: "#ffffff",
      },
    },
    components: {
      card: { style: "brutalism" },
      button: { style: "brutalism" },
    },
  },
  minimalism: {
    id: "minimalism",
    name: "Minimalism",
    description:
      "Extreme clarity with generous negative space and elegant type",
    preview: {
      primaryColor: "#000000",
      secondaryColor: "#666666",
      backgroundColor: "#ffffff",
    },
    tokens: {
      colors: {
        primary: { value: "#000000", description: "Ink" },
        secondary: { value: "#666666", description: "Graphite" },
        background: { value: "#ffffff" },
        surface: {
          value: "#ffffff",
          description: "No separation from the page",
        },
        text: { value: "#111111" },
        textMuted: { value: "#737373" },
        border: { value: "#e5e5e5", description: "Hairline only" },
      },
      spacing: { lg: "3rem" },
      borderRadius: { md: "2px" },
    },
    effects: { globalType: "standard" },
    components: {},
  },
  "dark-ui": {
    id: "dark-ui",
    name: "Dark UI (Sophisticated)",
    description: "High-end dark interface optimized for OLED and visual focus",
    preview: {
      primaryColor: "#22d3ee",
      secondaryColor: "#a855f7",
      backgroundColor: "#09090b",
    },
    tokens: {
      colors: {
        primary: { value: "#22d3ee", description: "Cyan neon accent" },
        secondary: { value: "#a855f7", description: "Purple neon accent" },
        background: { value: "#09090b", description: "Near black background" },
        surface: { value: "#18181b", description: "Elevated surface" },
        text: { value: "#fafafa", description: "Bright white text" },
        textMuted: { value: "#71717a", description: "Muted gray text" },
        border: { value: "#27272a", description: "Subtle border" },
      },
    },
    effects: { globalType: "standard" },
    components: {},
  },
  "cyberpunk-hud": {
    id: "cyberpunk-hud",
    name: "Cyberpunk HUD",
    description:
      "Futuristic sci-fi interface with grids, neon, and techno type",
    preview: {
      primaryColor: "#00ffff",
      secondaryColor: "#ff00ff",
      backgroundColor: "#050510",
    },
    tokens: {
      colors: {
        primary: { value: "#00ffff", description: "Neon cyan" },
        secondary: { value: "#ff00ff", description: "Neon magenta" },
        background: { value: "#050510", description: "Void" },
        surface: { value: "#0b0b20", description: "Panel above the void" },
        text: { value: "#d8faff", description: "Cyan-tinted readout" },
        textMuted: { value: "#7a8bb5" },
        // Full-strength neon on every divider in the app is a wall of glare.
        // The HUD reads as a HUD when the neon is reserved for the accents and
        // the panel edges are a dimmed version of the same hue.
        border: { value: "#123a52", description: "Dimmed cyan edge" },
      },
      borderRadius: { md: "2px" },
    },
    effects: { globalType: "standard" },
    components: {},
  },
  "liquid-organic": {
    id: "liquid-organic",
    name: "Liquid Organic",
    description: "Fluid curves and bio-mimetic forms for a soft immersion",
    preview: {
      primaryColor: "#ec4899",
      secondaryColor: "#8b5cf6",
      backgroundColor: "#fdf4ff",
    },
    tokens: {
      colors: {
        primary: { value: "#ec4899", description: "Pink primary" },
        secondary: { value: "#8b5cf6", description: "Purple secondary" },
        background: { value: "#fdf4ff", description: "Light pink background" },
        surface: { value: "#ffffff", description: "White surface" },
        text: { value: "#581c87", description: "Deep purple text" },
        textMuted: { value: "#a855f7", description: "Light purple muted" },
        border: { value: "#e9d5ff", description: "Light purple border" },
      },
      borderRadius: { md: "40px", xl: "100px" },
    },
    effects: {
      globalType: "organic",
      organic: {
        enabled: true,
        curvature: 90,
        fluidity: 50,
        backgroundColor: "#ffffff",
        borderColor: "transparent",
        borderWidth: "0px",
      },
    },
    components: { card: { style: "standard" } }, // Organic uses custom radius directly
  },
  "retro-y2k": {
    id: "retro-y2k",
    name: "Retro Y2K",
    description:
      "90s-2000s nostalgia with bright gradients and pixelated vibes",
    preview: {
      primaryColor: "#ff00ff",
      secondaryColor: "#00ccff",
      backgroundColor: "#ccffff",
    },
    tokens: {
      colors: {
        primary: { value: "#ff00ff", description: "Y2K magenta" },
        secondary: { value: "#00ccff", description: "Bubble cyan" },
        background: { value: "#ccffff", description: "Aqua wash" },
        surface: { value: "#ffffff" },
        text: { value: "#1a0033", description: "Deep violet ink" },
        textMuted: { value: "#5c4a7a" },
        border: { value: "#8fd8e8" },
      },
      borderRadius: { md: "14px" },
    },
    effects: { globalType: "standard" },
    components: {},
  },
  "immersive-3d": {
    id: "immersive-3d",
    name: "3D & Immersive",
    description:
      "Deep spatial depth with multi-layered projections and rotation",
    preview: {
      primaryColor: "#6366f1",
      secondaryColor: "#4f46e5",
      backgroundColor: "#111827",
    },
    tokens: {
      colors: {
        primary: { value: "#6366f1", description: "Indigo" },
        secondary: { value: "#4f46e5", description: "Deeper indigo" },
        background: { value: "#111827", description: "Deep space" },
        surface: { value: "#1b2437", description: "Layer above the ground" },
        text: { value: "#f3f4f6" },
        textMuted: { value: "#9ca3af" },
        border: { value: "#2b3648" },
      },
      borderRadius: { md: "14px" },
    },
    effects: {
      globalType: "immersive",
      immersive: {
        enabled: true,
        layers: 4,
        depth: 40,
        shadowColor: "rgba(0,0,0,0.5)",
        perspective: "1200px",
        rotationX: "5deg",
        rotationY: "0deg",
      },
    },
    components: { card: { style: "standard" } },
  },
  "neo-brutalism": {
    id: "neo-brutalism",
    name: "Neo-Brutalism",
    description: "Modernized brutalism with pastel palettes and refined edges",
    preview: {
      primaryColor: "#ffde59",
      secondaryColor: "#ff5757",
      backgroundColor: "#fffdf5",
    },
    tokens: {
      colors: {
        primary: { value: "#ffde59", description: "Canary" },
        secondary: { value: "#ff5757", description: "Coral" },
        background: { value: "#fffdf5", description: "Warm paper" },
        surface: { value: "#ffffff" },
        text: { value: "#000000" },
        textMuted: { value: "#4a4a4a" },
        border: { value: "#000000", description: "Always full black" },
      },
      borderRadius: { md: "4px" },
    },
    effects: {
      globalType: "brutalism",
      brutalism: {
        enabled: true,
        borderWidth: "3px",
        borderColor: "#000000",
        shadowOffset: "6px",
        shadowColor: "#000000",
        backgroundColor: "#ffffff",
      },
    },
    components: {
      card: { style: "brutalism" },
      button: { style: "brutalism" },
    },
  },
  "modern-skeuomorphic": {
    id: "modern-skeuomorphic",
    name: "Modern Skeuomorphism",
    description:
      'Tactile, "squishy" volumes with realistic textures and shadows',
    preview: {
      primaryColor: "#4f46e5",
      secondaryColor: "#f59e0b",
      backgroundColor: "#f3f4f6",
    },
    tokens: {
      colors: {
        primary: { value: "#4f46e5", description: "Indigo" },
        secondary: { value: "#f59e0b", description: "Amber" },
        // Page and panel are deliberately the same colour: a neumorphic relief
        // is made entirely of its two shadows, so a panel that contrasts with
        // the ground behind it stops reading as extruded. This preset used to
        // set the page to #f9fafb while its relief was built for #f3f4f6.
        background: { value: "#f3f4f6" },
        surface: { value: "#f3f4f6" },
        text: { value: "#1f2937" },
        textMuted: { value: "#6b7280" },
        border: { value: "#e5e7eb" },
      },
      borderRadius: { md: "20px", lg: "32px" },
    },
    effects: {
      globalType: "neu",
      neumorphism: {
        enabled: true,
        backgroundColor: "#f3f4f6",
        intensity: 0.12,
        distance: 8,
        altitude: 45,
        borderRadius: "32px",
      },
    },
    components: { card: { style: "neu" } },
  },
  "godlio-premium": {
    id: "godlio-premium",
    name: "Godlio Premium Obsidian",
    description:
      "Signature ultra-rich obsidian glass with vibrant neon accents",
    preview: {
      primaryColor: "#635bff",
      secondaryColor: "#00d4ff",
      backgroundColor: "#050505",
    },
    tokens: {
      colors: {
        primary: { value: "#635bff", description: "Electric indigo" },
        secondary: { value: "#00d4ff", description: "Ice blue" },
        background: { value: "#050505", description: "Obsidian" },
        surface: { value: "rgba(15, 15, 15, 0.7)" },
        text: { value: "#f5f5f7" },
        textMuted: { value: "#a1a1aa" },
        border: { value: "rgba(255, 255, 255, 0.12)" },
      },
      borderRadius: { md: "14px" },
    },
    effects: {
      globalType: "glass",
      glassmorphism: {
        enabled: true,
        blur: "32px",
        background: "rgba(10, 10, 10, 0.65)",
        borderColor: "rgba(255, 255, 255, 0.15)",
        borderWidth: "1px",
        opacity: 0.95,
      },
    },
    components: { card: { style: "glass" }, button: { style: "glass" } },
  },
};

export const PRESET_LIST = Object.values(THEME_PRESETS);
