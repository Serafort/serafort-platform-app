import React, { useMemo } from 'react'
import { useAppStore } from '@cap/platform-store'
import type { NavItemConfig } from '@cap/shared-types'
import { useTranslation } from 'react-i18next'

export type IMenu = {
  name: string
  icon?: React.ReactNode
  link?: string
  menu?: Array<IMenu>
}

const mapNavItemToIMenu = (item: NavItemConfig, t: any): IMenu => {
  return {
    name: typeof item.label === 'string' ? t(item.label, item.label) : '',
    icon: item.icon,
    link: item.path,
    menu: item.children?.map((child) => mapNavItemToIMenu(child, t)),
  }
}

export const useUserMenu = (_roleId?: any): IMenu[] => {
  const { t } = useTranslation()
  const navItems = useAppStore((state) => state.navItems)

  return useMemo(() => {
    return navItems.map((item) => mapNavItemToIMenu(item, t))
  }, [navItems, t])
}

export default useUserMenu
