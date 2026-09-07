import type {
  Mode,
  Skin,
  Layout,
  LayoutComponentPosition,
  LayoutComponentWidth,
  ToastPosition,
} from "@cap/shared-types";

export type NavbarConfig = {
  type: LayoutComponentPosition;
  contentWidth: LayoutComponentWidth;
  floating: boolean;
  detached: boolean;
  blur: boolean;
};

export type FooterConfig = {
  type: LayoutComponentPosition;
  contentWidth: LayoutComponentWidth;
  detached: boolean;
};

export type ColorPalette = {
  main: string;
  light: string;
  dark: string;
  contrastText: string;
};

export type ThemeColors = {
  primary: ColorPalette;
  secondary: ColorPalette;
  error: ColorPalette;
  success: ColorPalette;
  warning: ColorPalette;
  info: ColorPalette;
  /**
   * Legacy slot names kept for the `customColors` palette contract in
   * `@cap/shared-types`. They now carry Serafort brand values:
   * brandGold -> primary, brandBrown -> secondary, brandSlate -> muted text,
   * brandCream -> page background.
   */
  brandGold: string;
  brandBrown: string;
  brandSlate: string;
  brandCream: string;
};

export type ShapeConfig = {
  borderRadius: number;
  customBorderRadius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
};

export type ThemeConfig = {
  templateName: string;
  settingsCookieName: string;
  mode: Mode;
  skin: Skin;
  semiDark: boolean;
  layout: Layout;
  layoutPadding: number;
  navbar: NavbarConfig;
  contentWidth: LayoutComponentWidth;
  compactContentWidth: number;
  footer: FooterConfig;
  disableRipple: boolean;
  toastPosition: ToastPosition;
  colors: ThemeColors;
  shape: ShapeConfig;
};

export const themeConfig: ThemeConfig = {
  templateName: "Serafort",
  settingsCookieName: "serafort-settings",
  mode: "light",
  skin: "default",
  semiDark: false,
  layout: "vertical",
  layoutPadding: 0,
  compactContentWidth: 1440,
  navbar: {
    type: "fixed",
    contentWidth: "compact",
    floating: true,
    detached: true,
    blur: true,
  },
  contentWidth: "compact",
  footer: {
    type: "static",
    contentWidth: "compact",
    detached: true,
  },
  disableRipple: false,
  toastPosition: "top-right",
  // Serafort brand kit (serafort_brand/brand-kit/tokens).
  colors: {
    primary: {
      main: "#047BFA", // brand blue
      light: "#06A0FC", // brand sky
      dark: "#044BC4", // brand royal blue
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#032457", // brand navy
      light: "#0437A2", // brand deep blue
      dark: "#031433", // brand ink
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#DC2626",
      light: "#EF4444",
      dark: "#B91C1C",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#16A34A",
      light: "#22C55E",
      dark: "#15803D",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#D97706",
      light: "#F59E0B",
      dark: "#B45309",
      contrastText: "#031433",
    },
    info: {
      main: "#047BFA",
      light: "#06A0FC",
      dark: "#0437A2",
      contrastText: "#FFFFFF",
    },
    brandGold: "#047BFA", // primary
    brandBrown: "#032457", // secondary
    brandSlate: "#64708A", // muted text
    brandCream: "#F6F8FC", // page background
  },
  shape: {
    borderRadius: 6,
    customBorderRadius: {
      xs: 2,
      sm: 4,
      md: 6,
      lg: 8,
      xl: 10,
    },
  },
};

export default themeConfig;
