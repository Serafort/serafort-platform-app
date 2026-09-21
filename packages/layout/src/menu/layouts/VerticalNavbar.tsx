import React from 'react'
import type { CSSObject } from '@emotion/styled'
import type { ChildrenType } from '@cap/shared-types'
import { useTheme } from '@mui/material/styles'
import {
  themeConfig,
  layoutMenuTokens,
  effectSurfaceVars,
  useComponentStyle,
  useComponentEffectConfig,
} from '@cap/theme'
import { verticalLayoutClasses } from '../../utils/layoutClasses'
import { useSettings } from '@cap/platform-store'
import StyledHeader from '../styles/vertical/StyledHeader'
import classnames from 'classnames'
import { Box } from '@mui/material'
import NavbarContent from './VerticalNavbarContent'

const Navbar: React.FC<
  Partial<ChildrenType> & {
    overrideStyles?: CSSObject
  }
> = (props) => {
  const { children, overrideStyles } = props
  const { settings } = useSettings()
  const { navbarContentWidth } = settings
  const theme = useTheme()

  // The navbar follows the global effect through the :root --effect-*
  // variables that StyledHeader reads. A per-component override is the one
  // case that cannot work that way, so it is published as the same variables
  // scoped to this element - they shadow :root for the navbar and everything
  // inside it, without having to out-specify StyledHeader's own nested rules.
  const navbarStyle = useComponentStyle('navbar')
  const navbarEffect = useComponentEffectConfig('navbar')
  const scopedEffectVars =
    navbarStyle?.style && navbarStyle.style !== 'global'
      ? effectSurfaceVars(navbarEffect, theme)
      : {}

  const mergedOverrideStyles = {
    ...(navbarStyle?.customProperties as CSSObject),
    ...scopedEffectVars,
    ...overrideStyles,
  } as CSSObject

  const headerFixed = themeConfig.navbar.type === 'fixed'
  const headerStatic = themeConfig.navbar.type === 'static'
  const headerFloating = themeConfig.navbar.floating === true
  const headerDetached = themeConfig.navbar.detached === true
  const headerAttached = themeConfig.navbar.detached === false
  const headerBlur = themeConfig.navbar.blur === true
  const headerContentCompact = navbarContentWidth === 'compact'
  const headerContentWide = navbarContentWidth === 'full'

  return (
    <StyledHeader
      overrideStyles={mergedOverrideStyles}
      layoutPadding={themeConfig.layoutPadding as number}
      compactContentWidth={themeConfig.compactContentWidth as number}
      className={classnames(verticalLayoutClasses.header, {
        [verticalLayoutClasses.headerFixed]: headerFixed,
        [verticalLayoutClasses.headerStatic]: headerStatic,
        [verticalLayoutClasses.headerFloating]: headerFloating,
        [verticalLayoutClasses.headerDetached]: !headerFloating && headerDetached,
        [verticalLayoutClasses.headerAttached]: !headerFloating && headerAttached,
        [verticalLayoutClasses.headerBlur]: headerBlur,
        [verticalLayoutClasses.headerContentCompact]: headerContentCompact,
        [verticalLayoutClasses.headerContentWide]: headerContentWide,
      })}
      style={layoutMenuTokens.verticalNavbar.containerStyles}
    >
      <Box
        className={classnames(verticalLayoutClasses.navbar)}
        sx={layoutMenuTokens.verticalNavbar.boxStyles}
      >
        {children || <NavbarContent />}
      </Box>
    </StyledHeader>
  )
}

export default Navbar
