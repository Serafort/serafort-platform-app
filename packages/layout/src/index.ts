// ── Layout Shells ──────────────────────────────────────────────
export { default as VerticalLayout } from './layouts/VerticalLayout'
export { default as HorizontalLayout } from './layouts/HorizontalLayout'
export { default as PublicLayout } from './layouts/PublicLayout'
export { default as BlankLayout } from './layouts/BlankLayout'
export { default as LayoutWrapper } from './layouts/LayoutWrapper'
export { default as Footer } from './layouts/Footer'
export { default as LayoutRouteWrapper } from './components/wrappers/LayoutRouteWrapper'
export {
  AppReactToastify,
  AppReactDropzone,
  AppRecharts,
  SkipToContent,
  GuestBanner,
} from '@cap/theme'

// ── Components ─────────────────────────────────────────────────
export { default as VerticalNavigation } from './components/vertical/Navigation'
export { default as HorizontalNavigation } from './components/horizontal/Navigation'
export { default as Navigation } from './components/vertical/Navigation'
export { default as VerticalNavbar } from './menu/layouts/VerticalNavbar'
export { default as VerticalNavToggle } from './components/vertical/NavToggle'
export { default as HorizontalNavToggle } from './components/horizontal/NavToggle'
export { default as VerticalFooter } from './components/vertical/Footer'
export { default as Header } from './components/horizontal/Header'
export { default as HorizontalFooter } from './components/horizontal/Footer'
export { default as PublicNavbar } from './menu/layouts/Navbars/Navbar'
export { default as GuestNavbar } from './menu/layouts/Navbars/GuestNavbar'
export { default as HorizontalNavbarContent } from './menu/layouts/HorizontalNavbarContent'
export { default as RoleIndicator } from './components/RoleIndicator'
export { ImpersonationBanner } from './components/impersonation/ImpersonationBanner'

// ── Context Types ──────────────────────────────────────────────
export type {
  VerticalMenuContextProps,
  OpenSubmenu,
  MenuSectionStyles,
} from './menu/components/vertical-menu/Menu'

// ── Re-export Utils & Hooks ────────────────────────────────────
export * from './hooks/useVerticalNav'
export * from './hooks/useHorizontalNav'
export * from './utils/layoutClasses'

// ── Types ──────────────────────────────────────────────────────
export * from './types'

// ── Menu Components ────────────────────────────────────────────
export { default as VerticalNav } from './menu/vertical-menu'
export { default as HorizontalNav } from './menu/horizontal-menu'
export {
  Menu,
  MenuItem,
  SubMenu,
  MenuSection,
  NavHeader,
  NavCollapseIcons,
} from './menu/vertical-menu'

export {
  Menu as HorizontalMenuBase,
  MenuItem as HorizontalMenuItem,
  SubMenu as HorizontalSubMenu,
} from './menu/horizontal-menu'

// ── Layout-specific Menu Components ───────────────────────────
export { default as VerticalMenu } from './menu/layouts/VerticalMenu'
export { default as AdminMenu } from './menu/layouts/AdminMenu'
export { default as HorizontalMenu } from './menu/layouts/HorizontalMenu'
export { default as ModuleMenuRenderer } from './menu/layouts/ModuleMenuRenderer'

// ── Hooks ──────────────────────────────────────────────────────
export { useVerticalNav, useVerticalMenu } from './menu/contexts/verticalNavContext'
export { useHorizontalNav, useHorizontalMenu } from './menu/contexts/horizontalNavContext'
export { useLayoutTokens } from './hooks/useLayoutTokens'

// ── Utils ──────────────────────────────────────────────────────
export { buildLayoutSurfaceEffect, SurfaceEffectFactory } from './utils/buildLayoutSurfaceEffect'

// ── Styles & Providers ─────────────────────────────────────────
export { default as ThemeBridge, generateTheme } from './providers/ThemeBridge'
export { default as verticalMenuItemStyles } from './styles/core/vertical/menuItemStyles'
export { default as verticalMenuSectionStyles } from './styles/core/vertical/menuSectionStyles'
export { default as verticalNavigationCustomStyles } from './styles/core/vertical/navigationCustomStyles'
export { default as horizontalMenuItemStyles } from './styles/core/horizontal/menuItemStyles'
export { default as horizontalMenuRootStyles } from './styles/core/horizontal/menuRootStyles'

// ── Styled Components ──────────────────────────────────────────
export { default as StyledVerticalNavExpandIcon } from './menu/styles/vertical/StyledVerticalNavExpandIcon'
export { default as StyledHorizontalNavExpandIcon } from './menu/styles/horizontal/StyledHorizontalNavExpandIcon'
export { default as StyledHeader } from './styles/vertical/StyledHeader'

// ── Internal Shared Shell Components ───────────────────────────
export { default as UserMenu } from './components/UserMenu'
export { default as NavSearch } from './menu/search'
export { default as Logo } from './assets/svg/Logo'
export { default as Grid } from './components/Grid'
export { default as ScrollToTop } from './components/ScrollToTop'

// ── Toolbar Dropdowns & Controls ───────────────────────────────
export {
  LanguageDropdown,
  ModeDropdown,
  NotificationsDropdown,
  ShortcutsDropdown,
  UserDropdown,
  NavToggle as SharedNavToggle,
} from './menu/shared'

// ── Configurations ─────────────────────────────────────────────
export { default as adminMenu } from './menu/adminMenu'

// ── Auth & Status Components ───────────────────────────────────
export * from './components/auth'
