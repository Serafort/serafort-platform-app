import { Roles, normalizeRole, hasAdminRole, ADMIN_ROLES } from '@cap/shared-types/auth'
export { useAppStore } from '@cap/platform-store'
export type { LayoutOverride, LayoutOverride as LayoutOverrideType } from '@cap/platform-store'

export { Roles, normalizeRole, hasAdminRole, ADMIN_ROLES }

export { isObjectEmpty } from '../utils/helper'

export const RoleWeights: Roles[] = [
  Roles.USER,
  Roles.PARTICIPANT,
  Roles.JUDGE,
  Roles.PROVIDEREMPLOYEE,
  Roles.PROVIDERADMIN,
  Roles.MODERATOR,
  Roles.ADMIN,
  Roles.SUPERADMINEMPLOYEE,
  Roles.SUPERADMIN,
]
export interface ITab {
  key: string
  label: string
  icon?: React.JSX.Element
  component: React.JSX.Element
}

export interface ISubMenu {
  name: string
  icon: React.JSX.Element
  link: string
}

export interface IMenu {
  name: string
  icon: React.JSX.Element
  link: string
  menu?: Array<ISubMenu>
}

export interface IStatus {
  open: boolean
  type: string
  state: string
  msg: string
}

export interface ICustomizedLabel {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
  name: string
  index: number
}

export interface Member {
  id?: string
  email: string
}

export interface IUpdateNames {
  lastName?: string
  firstName?: string
}
