export interface ColorToken {
  value: string;
  light?: string;
  dark?: string;
  hsl?: { h: number; s: number; l: number };
  description?: string;
}

export interface PrimitiveTokens {
  colors: {
    primary: ColorToken;
    secondary: ColorToken;
    background: ColorToken;
    surface: ColorToken;
    text: ColorToken;
    textMuted: ColorToken;
    border: ColorToken;
    success: ColorToken;
    warning: ColorToken;
    error: ColorToken;
    info: ColorToken;
  };
  spacing: Record<string, string>;
  /** Viewport-responsive spacing (clamp() strings) - page gutters, section gaps. */
  fluidSpacing?: Record<string, string>;
  borderRadius: Record<string, string>;
  borderWidth?: Record<string, string>;
  /** Border line styles - solid, dashed, dotted, etc. keyed by name. */
  borderStyle?: Record<string, string>;
  typography: {
    fontFamily: Record<string, string>;
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
    lineHeight: Record<string, string>;
  };
  shadows?: Record<string, string>;
  transitions?: {
    duration: Record<string, string>;
    easing: Record<string, string>;
  };
  zIndex?: Record<string, number>;
}

export interface SemanticTokens {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export const DEFAULT_PRIMITIVE_TOKENS: PrimitiveTokens = {
  colors: {
    primary: { value: "#047BFA", description: "Serafort blue" },
    secondary: { value: "#032457", description: "Serafort navy" },
    background: { value: "#F6F8FC", description: "Page background (fog 50)" },
    surface: { value: "#FFFFFF", description: "Card/surface background" },
    text: { value: "#031433", description: "Primary text (brand ink)" },
    textMuted: { value: "#64708A", description: "Muted text (slate 500)" },
    border: { value: "#C7D1E3", description: "Border color (mist 300)" },
    success: { value: "#16A34A", description: "Success state color" },
    warning: { value: "#D97706", description: "Warning state color" },
    error: { value: "#DC2626", description: "Error state color" },
    info: { value: "#047BFA", description: "Info state color" },
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
  },
  fluidSpacing: {
    gutterInline: "clamp(1rem, 0.6rem + 2vw, 2.5rem)",
    gutterBlock: "clamp(1.5rem, 1rem + 2.5vw, 3.5rem)",
    sectionGap: "clamp(2.5rem, 1.5rem + 5vw, 6rem)",
    stackGap: "clamp(0.75rem, 0.6rem + 0.8vw, 1.25rem)",
    cardPadding: "clamp(1rem, 0.8rem + 1vw, 1.75rem)",
    clusterGap: "clamp(0.5rem, 0.4rem + 0.4vw, 0.875rem)",
  },
  borderRadius: {
    none: "0",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  },
  borderWidth: {
    none: "0px",
    thin: "1px",
    medium: "2px",
    thick: "4px",
  },
  borderStyle: {
    solid: "solid",
    dashed: "dashed",
    dotted: "dotted",
  },
  typography: {
    fontFamily: {
      // Brand kit: Inter for body, Space Grotesk for display/headings.
      sans: '"Inter", "Segoe UI", system-ui, sans-serif',
      display: '"Space Grotesk", "Segoe UI", system-ui, sans-serif',
      mono: '"JetBrains Mono", Consolas, monospace',
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: "1.25",
      normal: "1.5",
      relaxed: "1.75",
    },
  },
  shadows: {
    xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },
  transitions: {
    duration: {
      shortest: "150ms",
      shorter: "200ms",
      short: "250ms",
      standard: "300ms",
      complex: "375ms",
      enteringScreen: "225ms",
      leavingScreen: "195ms",
    },
    easing: {
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
    },
  },
  zIndex: {
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
};

export * from "../tokens";
