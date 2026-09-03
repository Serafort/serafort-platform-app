import React from 'react';

export type IMenu = {
  name: string
  icon?: string
  link?: string
  prefix?: React.ReactNode //| ChipProps
  suffix?: React.ReactNode //| ChipProps
  submenu?: Array<IMenu>
  menusection?: {
    name: string
    menu: IMenu | Array<IMenu>
  }
}
