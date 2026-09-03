import type { PrimitiveTokens } from "./designTokens";
import type { EffectConfig } from "./effects";
import type { ComponentStyles } from "./componentStyles";

export type ThemePresetId =
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
  default: {
    id: "default",
    name: "Default",
    description: "Clean, minimal design with balanced proportions",
    preview: {
      primaryColor: "#6366f1",
      secondaryColor: "#8b5cf6",
      backgroundColor: "#f8fafc",
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
        background: { value: "#fafafa" },
        surface: { value: "#ffffff" },
      },
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
        altitude: 10,
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
      secondaryColor: "#00ff00",
      backgroundColor: "#ffffff",
    },
    tokens: {
      colors: {
        primary: { value: "#ff1493" },
        background: { value: "#ffffff" },
        border: { value: "#000000" },
        text: { value: "#000000" },
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
        primary: { value: "#000000" },
        background: { value: "#ffffff" },
      },
      spacing: { lg: "3rem" },
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
        primary: { value: "#00ffff" },
        secondary: { value: "#ff00ff" },
        background: { value: "#050510" },
        border: { value: "#00ffff" },
      },
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
      secondaryColor: "#00ffff",
      backgroundColor: "#ccffff",
    },
    tokens: {
      colors: {
        primary: { value: "#ff00ff" },
        background: { value: "#ccffff" },
      },
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
        primary: { value: "#6366f1" },
        background: { value: "#111827" },
      },
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
      backgroundColor: "#ffffff",
    },
    tokens: {
      colors: {
        primary: { value: "#ffde59" },
        background: { value: "#ffffff" },
        border: { value: "#000000" },
      },
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
      backgroundColor: "#f9fafb",
    },
    tokens: {
      colors: {
        primary: { value: "#4f46e5" },
        background: { value: "#f9fafb" },
      },
    },
    effects: {
      globalType: "neu",
      neumorphism: {
        enabled: true,
        backgroundColor: "#f3f4f6",
        intensity: 0.12,
        distance: 8,
        altitude: 15,
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
        primary: { value: "#635bff" },
        background: { value: "#050505" },
        surface: { value: "rgba(15, 15, 15, 0.7)" },
      },
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
