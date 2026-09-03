import React from 'react'
import type { CSSObject } from '@emotion/styled'
import type { ChildrenType } from '@cap/shared-types'
import { themeConfig, verticalLayoutClasses, layoutMenuTokens } from '@cap/theme'
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
      overrideStyles={overrideStyles}
      layoutPadding={themeConfig.layoutPadding as number}
      compactContentWidth={themeConfig.compactContentWidth as number}
      className={classnames(
        verticalLayoutClasses.header,
        {
          [verticalLayoutClasses.headerFixed]: headerFixed,
          [verticalLayoutClasses.headerStatic]: headerStatic,
          [verticalLayoutClasses.headerFloating]: headerFloating,
          [verticalLayoutClasses.headerDetached]: !headerFloating && headerDetached,
          [verticalLayoutClasses.headerAttached]: !headerFloating && headerAttached,
          [verticalLayoutClasses.headerBlur]: headerBlur,
          [verticalLayoutClasses.headerContentCompact]: headerContentCompact,
          [verticalLayoutClasses.headerContentWide]: headerContentWide,
        },
      )}
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
