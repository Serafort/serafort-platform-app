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
  templateName: "CapPlatform",
  settingsCookieName: "cap-platform-settings",
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
  colors: {
    primary: {
      main: "#D4AF37",
      light: "#E0C55B",
      dark: "#B8982F",
      contrastText: "#1A1A1A",
    },
    secondary: {
      main: "#8B4513",
      light: "#A0522D",
      dark: "#6B3410",
      contrastText: "#FDFDFD",
    },
    error: {
      main: "#DC3545",
      light: "#E35D6A",
      dark: "#C82333",
      contrastText: "#FFF",
    },
    success: {
      main: "#28A745",
      light: "#48B461",
      dark: "#1E7E34",
      contrastText: "#FFF",
    },
    warning: {
      main: "#FF9F43",
      light: "#FFB269",
      dark: "#E68F3C",
      contrastText: "#1A1A1A",
    },
    info: {
      main: "#2F4F4F",
      light: "#4A6A6A",
      dark: "#1F3333",
      contrastText: "#FFF",
    },
    brandGold: "#D4AF37",
    brandBrown: "#8B4513",
    brandSlate: "#2F4F4F",
    brandCream: "#F5F5DC",
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
