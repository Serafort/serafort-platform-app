/**
 * Tenant Type Definitions
 *
 * Minimal type definitions for multi-tenant configuration.
 * These types are shared across packages without requiring runtime dependencies.
 *
 * For complete theme configuration with design tokens and effects,
 * use TenantThemeConfig from @cap/theme.
 */

// ============================================
// Tenant Theme Types
// ============================================

/**
 * Base tenant theme configuration (minimal contract).
 *
 * For complete theme configuration with design tokens and effects,
 * use TenantThemeConfig from @cap/theme.
 */
export interface TenantThemeBase {
  mode: "light" | "dark" | "system";
  skin: "default" | "bordered";
  semiDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}

/**
 * @deprecated Use TenantThemeBase for minimal config, or TenantThemeConfig from @cap/theme for full config.
 * This type is kept for backward compatibility.
 */
export type TenantTheme = TenantThemeBase;

// ============================================
// Tenant Layout Types
// ============================================

export type LayoutType = "vertical" | "horizontal" | "collapsed";
export type ContentWidth = "compact" | "wide";
export type NavbarType = "fixed" | "static";
export type ToastPosition =
  | "top-right"
  | "top-center"
  | "top-left"
  | "bottom-right"
  | "bottom-center"
  | "bottom-left";

export interface TenantNavbarConfig {
  type: NavbarType;
  contentWidth: ContentWidth;
  floating: boolean;
  detached: boolean;
  blur: boolean;
}

export interface TenantFooterConfig {
  type: NavbarType;
  contentWidth: ContentWidth;
  detached: boolean;
}

export interface TenantLayout {
  layout: LayoutType;
  layoutPadding: number;
  compactContentWidth: number;
  navbar: TenantNavbarConfig;
  footer: TenantFooterConfig;
  contentWidth: ContentWidth;
  disableRipple: boolean;
  toastPosition: ToastPosition;
}

// ============================================
// Tenant Branding Types
// ============================================

export interface TenantBranding {
  logo?: string | null;
  favicon?: string | null;
  appName: string;
  companyName: string;
  welcomeText?: string;
}

// ============================================
// Tenant Feature Flags
// ============================================

export interface TenantFeatures {
  darkMode: boolean;
  rtl: boolean;
  notifications: boolean;
  chat: boolean;
  enabledAuthPlugins?: string[];
}

// ============================================
// Tenant Module Access Control
// ============================================

export type TenantModuleStatus = "enabled" | "disabled";

export interface TenantModule {
  /** Must match the CAPModule id used in assembleApp() */
  id: string;
  status: TenantModuleStatus;
  /** Optional override label shown in admin UI */
  label?: string;
}

// ============================================
// Tenant Config Types
// ============================================

export const CURRENT_TENANT_CONFIG_VERSION = 1;

export interface TenantConfigV1 {
  readonly _version: 1;
  id: string;
  slug: string;
  domain: string;
  name: string;
  theme: TenantThemeBase;
  layout: TenantLayout;
  branding: TenantBranding;
  features: TenantFeatures;
  /** Per-tenant module access control. Absent = all modules allowed. */
  modules?: TenantModule[];
  version: number;
}

export type TenantConfig = TenantConfigV1;

// ============================================
// Tenant Context Types
// ============================================

export interface UserPreferences {
  theme?: "light" | "dark" | "system";
  language?: string;
  sidebarCollapsed?: boolean;
  dashboardLayout?: string;
  notifications?: boolean;
}

export interface TenantContextValue {
  tenant: TenantConfig | null;
  theme: TenantThemeBase | null;
  isLoading: boolean;
  error: string | null;
  isLoadingTheme: boolean;
  errorTheme: string | null;
  userPreferences: UserPreferences;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void;
  refetchTenant: () => Promise<void>;
  refetchTheme: () => Promise<void>;
  updateTheme: (updates: Partial<TenantThemeBase>) => Promise<void>;
  saveTheme: (theme: TenantThemeBase) => Promise<void>;
  /** Replace the full module list and persist to the backend. */
  saveModules: (modules: TenantModule[]) => Promise<void>;
  /** Returns true when a module is enabled for this tenant (default: true if no list). */
  isModuleEnabled: (moduleId: string) => boolean;
}

// ============================================
// Tenant Type Guards
// ============================================

export function isTenantConfig(value: unknown): value is TenantConfig {
  if (!value || typeof value !== "object") return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    typeof c.slug === "string" &&
    typeof c.domain === "string" &&
    typeof c.name === "string" &&
    c.theme !== null &&
    typeof c.theme === "object" &&
    c.layout !== null &&
    typeof c.layout === "object" &&
    c.branding !== null &&
    typeof c.branding === "object" &&
    c.features !== null &&
    typeof c.features === "object"
  );
}

export function isTenantTheme(value: unknown): value is TenantThemeBase {
  if (!value || typeof value !== "object") return false;
  const t = value as Record<string, unknown>;
  return (
    (t.mode === "light" || t.mode === "dark" || t.mode === "system") &&
    typeof t.primaryColor === "string" &&
    typeof t.secondaryColor === "string"
  );
}

export function isTenantLayout(value: unknown): value is TenantLayout {
  if (!value || typeof value !== "object") return false;
  const l = value as Record<string, unknown>;
  return (
    (l.layout === "vertical" ||
      l.layout === "horizontal" ||
      l.layout === "collapsed") &&
    l.navbar !== null &&
    typeof l.navbar === "object" &&
    l.footer !== null &&
    typeof l.footer === "object"
  );
}
