import type { CAPPlugin } from './contracts/plugin.contracts'

export enum RouteLayoutEnum {
  PUBLIC = 'public',
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
  NO_LAYOUT = 'noLayout',
  ADMIN = 'admin',
  NONE = 'none',
}

export type NavVariant = 'vertical' | 'admin' | 'horizontal' | 'all' | 'public'

export type ModuleRouteLayout = RouteLayoutEnum | `${RouteLayoutEnum}`
export type RouteLayout = ModuleRouteLayout

export interface PolicyRef {
  /** ID of a named Policy in the active PolicySet */
  policyId?: string
  /** Action to evaluate (defaults to 'access' if omitted) */
  action?: string
  /** Static resource descriptor for this route/nav item */
  resource?: { type: string; id?: string | number; attributes?: Record<string, unknown> }
}

export interface ModuleRouteConfig {
  path: string
  element: any
  layout?: ModuleRouteLayout
  label?: string
  // Navigation properties (if route also serves as a nav item)
  id?: string                       // optional unique key for React (fallback to path)
  icon?: string | React.ReactNode   // icon class string or React icon component e.g. MUI icon
  section?: string                  // if set, wraps the item in a <MenuSection>
  roles?: string[]                  // RoleGuard roles
  permissions?: string[]            // PermissionGuard permissions
  policy?: PolicyRef                // ABAC/RBAC policy engine reference
  guestOnly?: boolean               // if true, hides the item when user is authenticated
  variant?: NavVariant[]            // which menus this item appears in (default: all)
  order?: number                    // sort order within its section/group
}

export interface NavItemConfig {
  id: string                        // unique key for React
  label: string                     // i18n key or fallback string
  path?: string                     // route path (undefined = section header only)
  icon?: string | React.ReactNode   // icon class string or React icon component e.g. MUI icon
  section?: string                  // if set, wraps the item in a <MenuSection>
  roles?: string[]                  // RoleGuard roles
  permissions?: string[]            // PermissionGuard permissions
  policy?: PolicyRef                // ABAC/RBAC policy engine reference
  guestOnly?: boolean               // if true, hides the item when user is authenticated
  children?: NavItemConfig[]        // nested SubMenu
  variant?: NavVariant[]            // which menus this item appears in (default: all)
  order?: number                    // sort order within its section/group
}

export interface SearchItemConfig {
  id: string
  name: string
  url: string
  icon?: string | React.ReactNode
  section?: string
  shortcut?: string[]
  subtitle?: string
}

export interface CAPModule {
  id: string
  version: string
  name?: string
  description?: string
  routes?: ModuleRouteConfig[]
  /** Optional fallback for legacy route configs */
  authRouteConfig?: ModuleRouteConfig[]
  storeReducers?: Record<string, any>
  i18n?: Record<string, any>
  plugins?: CAPPlugin[]
  /** @deprecated use navItems */
  navigation?: any
  navItems?: NavItemConfig[]
  searchItems?: SearchItemConfig[]
}

