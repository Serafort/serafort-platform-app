import { useTheme, themeConfig } from '@cap/theme'
import type { CSSObject } from '@emotion/styled'
import type { ChildrenType } from '@cap/shared-types'
import { useSettings } from '@cap/platform-store'
import { horizontalLayoutClasses } from '../../utils/layoutClasses'
import StyledHeader from '../../styles/horizontal/StyledHeader'
import classnames from 'classnames'
import { useLayoutTokens } from '../../hooks/useLayoutTokens'
import Navbar from './Navbar'
import { useHorizontalNav } from '../../menu/contexts/horizontalNavContext'
import { useComponentStyle, useComponentEffectConfig } from '@cap/theme'
import { buildLayoutSurfaceEffect } from '../../utils/buildLayoutSurfaceEffect'

type Props = ChildrenType & {
  overrideStyles?: CSSObject
  navbarType?: 'fixed' | 'static'
  blur?: boolean
}

const LayoutHeader = (props: Props) => {
  // Props
  const { children, overrideStyles, navbarType: propNavbarType, blur: propBlur } = props

  // Hooks
  const { settings } = useSettings()
  const theme = useTheme()
  const { layoutPadding, compactContentWidth } = useLayoutTokens()

  // Vars
  const { navbarContentWidth } = settings
  const activeNavbarType = propNavbarType || (settings as any).navbarType || themeConfig.navbar?.type || 'fixed'
  const activeNavbarBlur = propBlur ?? (settings as any).navbarBlur ?? themeConfig.navbar?.blur ?? true

  const headerFixed = activeNavbarType === 'fixed'
  const headerStatic = activeNavbarType === 'static'
  const headerBlur = activeNavbarBlur === true
  const headerContentCompact = navbarContentWidth === 'compact'
  const headerContentWide = navbarContentWidth === 'wide' || navbarContentWidth === 'full'

  // Phase 4 & 5: tenant-driven per-component styles and effects
  const navbarStyle = useComponentStyle('navbar')
  const navbarEffect = useComponentEffectConfig('navbar')
  const effectStyles = buildLayoutSurfaceEffect(navbarEffect, theme)

  const mergedOverrideStyles: CSSObject = {
    ...(navbarStyle?.customProperties as CSSObject),
    ...effectStyles,
    ...overrideStyles,
  }

  return (
    <StyledHeader
      overrideStyles={mergedOverrideStyles}
      layoutPadding={layoutPadding}
      compactContentWidth={compactContentWidth}
      className={classnames(horizontalLayoutClasses.header, {
        [horizontalLayoutClasses.headerFixed]: headerFixed,
        [horizontalLayoutClasses.headerStatic]: headerStatic,
        [horizontalLayoutClasses.headerBlur]: headerBlur,
        [horizontalLayoutClasses.headerContentCompact]: headerContentCompact,
        [horizontalLayoutClasses.headerContentWide]: headerContentWide,
      })}
    >
      {children}
    </StyledHeader>
  )
}


const Header = ({ navigation, navbarContent }: { navigation?: React.ReactNode; navbarContent?: React.ReactNode }) => {
  // Hooks
  const { isBreakpointReached } = useHorizontalNav()

  return (
    <>
      <LayoutHeader>
        <Navbar>
          {navbarContent}
        </Navbar>
        {!isBreakpointReached && navigation}
      </LayoutHeader>
      {isBreakpointReached && navigation}
    </>
  )
}

export default Header
