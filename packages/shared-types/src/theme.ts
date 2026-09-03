import type { ToastPosition } from 'react-toastify'
import type { Mode, Skin, Layout, LayoutComponentPosition, LayoutComponentWidth } from './layout'

export type NavbarConfig = {
  type: LayoutComponentPosition
  contentWidth: LayoutComponentWidth
  floating: boolean
  detached: boolean
  blur: boolean
}

export type FooterConfig = {
  type: LayoutComponentPosition
  contentWidth: LayoutComponentWidth
  detached: boolean
}

export type ColorPalette = {
  main: string
  light: string
  dark: string
  contrastText: string
}

export type ThemeColors = {
  primary: ColorPalette
  secondary: ColorPalette
  error: ColorPalette
  success: ColorPalette
  warning: ColorPalette
  info: ColorPalette
  brandGold: string
  brandBrown: string
  brandSlate: string
  brandCream: string
}

export type ShapeConfig = {
  borderRadius: number
  customBorderRadius: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
}

export type Config = {
  templateName: string
  settingsCookieName: string
  mode: Mode
  skin: Skin
  semiDark: boolean
  layout: Layout
  layoutPadding: number
  navbar: NavbarConfig
  contentWidth: LayoutComponentWidth
  compactContentWidth: number
  footer: FooterConfig
  disableRipple: boolean
  toastPosition: ToastPosition
  colors: ThemeColors
  shape: ShapeConfig
}
