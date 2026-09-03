import type { PrimitiveTokens } from './designTokens';
import type { EffectConfig } from './effects';
import type { ComponentStyles } from './componentStyles';
import type { ThemePresetId } from './presets';

export * from './designTokens';
export * from './effects';
export * from './componentStyles';
export * from './presets';
export * from './menu';

import type { HeaderTokens } from '../assets/themes/definitions/headerTokens'
import type { MenuTokens } from '../assets/themes/definitions/menuTokens'
import type { FooterTokens } from '../assets/themes/definitions/footerTokens'
import type { MainTokens } from '../assets/themes/definitions/mainTokens'
import type { StepperTokens } from '../assets/themes/definitions/stepperTokens'
import type { GuestNavbarTokens } from '../assets/themes/definitions/guestNavbarTokens'
import type { NavbarTokens } from '../assets/themes/definitions/navbarTokens'
import type { AdminMenuTokens } from '../assets/themes/definitions/adminMenuTokens'
import type { LayoutMenuTokens } from '../assets/themes/definitions/layoutMenuTokens'
import type { SearchTokens } from '../assets/themes/definitions/searchTokens'
import type { DropdownTokens } from '../assets/themes/definitions/dropdownTokens'

// Styled component prop types are re-exported from './styled' module
// Import them from '@cap/theme' or './styled' directly
// The styledProps.ts file is kept for documentation and internal use

export interface TenantThemeConfig {
  id?: string;
  organizationId: string;
  name: string;
  preset?: ThemePresetId;
  tokens: PrimitiveTokens;
  effects: EffectConfig;
  components: ComponentStyles;
  version: string;
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    preset?: string;
    mode?: 'light' | 'dark' | 'system';
  };
}

export interface TenantThemeState {
  theme: TenantThemeConfig | null;
}

export interface TenantThemeStatus {
  isLoading: boolean;
  error: string | null;
}

export interface TenantThemeActions {
  refetch: () => Promise<void>;
  updateTheme: (updates: Partial<TenantThemeConfig>) => Promise<void>;
  saveTheme: (theme: TenantThemeConfig) => Promise<void>;
}

export interface TenantThemeContextValue extends TenantThemeState, TenantThemeStatus, TenantThemeActions {}

export interface TenantThemeProviderProps {
  children: React.ReactNode;
  theme?: TenantThemeConfig | null;
  isLoading?: boolean;
  error?: string | null;
  refetch?: () => Promise<void>;
  updateTheme?: (updates: Partial<TenantThemeConfig>) => Promise<void>;
  saveTheme?: (theme: TenantThemeConfig) => Promise<void>;
}

export interface CSSVariableMap {
  [key: string]: string | number;
}

export interface AppliedThemeVariables {
  colors: CSSVariableMap;
  spacing: CSSVariableMap;
  borderRadius: CSSVariableMap;
  typography: CSSVariableMap;
  effects: CSSVariableMap;
  components: CSSVariableMap;
}

declare module '@mui/material/styles' {
  interface ZIndex {
    base: number
    content: number
    elevated: number
    local: {
      behind: number
      base: number
      above: number
      highlight: number
      overlay: number
    }
    appBar: number
    drawer: number
    dropdown: number
    modal: number
    snackbar: number
    tooltip: number
    loadingBackdrop: number
    search: number
    layout: {
      header: number
      footer: number
      navigation: number
      backdrop: number
      modal: number
    }
  }

  interface Theme {
    customShadows: {
      z1?: string;
      z8?: string;
      z16?: string;
      z20?: string;
      z24?: string;
      xs?: string;
      sm?: string;
      md?: string;
      lg?: string;
      xl?: string;
      primary?: string | { sm?: string; md?: string; lg?: string };
      secondary?: string | { sm?: string; md?: string; lg?: string };
      error?: string | { sm?: string; md?: string; lg?: string };
      warning?: string | { sm?: string; md?: string; lg?: string };
      info?: string | { sm?: string; md?: string; lg?: string };
      success?: string | { sm?: string; md?: string; lg?: string };
    };
    colorSchemes: {
      light: { palette: any }
      dark: { palette: any }
    };
    mainColorChannels: {
      light: string
      dark: string
      lightShadow: string
      darkShadow: string
    };
    cap: {
      headerTokens: HeaderTokens;
      menuTokens: MenuTokens;
      footerTokens: FooterTokens;
      mainTokens: MainTokens;
      stepperTokens: StepperTokens;
      guestNavbarTokens: GuestNavbarTokens;
      navbarTokens: NavbarTokens;
      adminMenuTokens: AdminMenuTokens;
      layoutMenuTokens: LayoutMenuTokens;
      searchTokens: SearchTokens;
      dropdownTokens: DropdownTokens;
    };
  }
  interface ThemeOptions {
    customShadows?: {
      z1?: string;
      z8?: string;
      z16?: string;
      z20?: string;
      z24?: string;
      xs?: string;
      sm?: string;
      md?: string;
      lg?: string;
      xl?: string;
      primary?: string | { sm?: string; md?: string; lg?: string };
      secondary?: string | { sm?: string; md?: string; lg?: string };
      error?: string | { sm?: string; md?: string; lg?: string };
      warning?: string | { sm?: string; md?: string; lg?: string };
      info?: string | { sm?: string; md?: string; lg?: string };
      success?: string | { sm?: string; md?: string; lg?: string };
    };
    colorSchemes?: {
      light?: { palette: any }
      dark?: { palette: any }
    };
    mainColorChannels?: {
      light?: string
      dark?: string
      lightShadow?: string
      darkShadow?: string
    };
    cap?: {
      headerTokens?: HeaderTokens;
      menuTokens?: MenuTokens;
      footerTokens?: FooterTokens;
      mainTokens?: MainTokens;
      stepperTokens?: StepperTokens;
      guestNavbarTokens?: GuestNavbarTokens;
      navbarTokens?: NavbarTokens;
      adminMenuTokens?: AdminMenuTokens;
      layoutMenuTokens?: LayoutMenuTokens;
      searchTokens?: SearchTokens;
      dropdownTokens?: DropdownTokens;
    };
  }
}


export const DEFAULT_THEME_CONFIG: TenantThemeConfig = {
  organizationId: 'default',
  name: 'Default Theme',
  tokens: {
    colors: {
      primary: { value: '#D4AF37' },
      secondary: { value: '#8B4513' },
      background: { value: '#F5F5DC' },
      surface: { value: '#ffffff' },
      text: { value: '#0f172a' },
      textMuted: { value: '#64748b' },
      border: { value: '#e2e8f0' },
      success: { value: '#22c55e' },
      warning: { value: '#f59e0b' },
      error: { value: '#ef4444' },
      info: { value: '#3b82f6' },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
    borderRadius: {
      none: '0',
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    },
    typography: {
      fontFamily: {
        sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        mono: "'JetBrains Mono', Consolas, monospace",
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
      },
    },
    shadows: {
      xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    },
    transitions: {
      duration: {
        shortest: '150ms',
        shorter: '200ms',
        short: '250ms',
        standard: '300ms',
        complex: '375ms',
        enteringScreen: '225ms',
        leavingScreen: '195ms',
      },
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
    },
    zIndex: {
      appBar: 1100,
      drawer: 1200,
      modal: 1300,
      snackbar: 1400,
      tooltip: 1500,
    },
  },
  effects: {
    globalType: 'standard',
    glassmorphism: {
      enabled: false,
      blur: '16px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: '1px',
      opacity: 0.8,
    },
    neumorphism: {
      enabled: false,
      backgroundColor: '#e0e5ec',
      intensity: 0.15,
      distance: 5,
      altitude: 10,
      borderRadius: '12px',
    },
  },
  components: {
    button: { style: 'global' },
    card: { style: 'global' },
    input: { style: 'global' },
    navbar: { style: 'global' },
    footer: { style: 'global' },
    modal: { style: 'global' },
    drawer: { style: 'global' },
    stepper: { style: 'global' },
    table: { style: 'global' },
    tabs: { style: 'global' },
    nav: { style: 'global' },
  },
  version: '1.0.0',
};

// Backward-compatible alias for existing consumers that still import the old name.
export const DEFAULT_TENANT_THEME = DEFAULT_THEME_CONFIG;
