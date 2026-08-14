import React from 'react'
import { useTheme } from '@mui/material/styles'
import type { ChildrenType } from '@cap/shared-types'
import { useSettings } from '@cap/platform-store'
import { verticalLayoutClasses } from '../../utils/layoutClasses'
import StyledFooter from '../../styles/vertical/StyledFooter'
import classnames from 'classnames'
import { useLayoutTokens } from '../../hooks/useLayoutTokens'
import type { CSSObject } from '@emotion/styled'
import Box from '@mui/material/Box'
import FooterContent from './FooterContent'
import { useComponentStyle, useComponentEffectConfig } from '@cap/theme'
import { buildLayoutSurfaceEffect } from '../../utils/buildLayoutSurfaceEffect'

// themeConfig.footer defaults inlined to avoid circular import
// footer.detached = true, footer.type = 'static'
const FOOTER_DETACHED = true as boolean
const FOOTER_TYPE: string = 'static'

const Footer: React.FC<
  Partial<ChildrenType> & {
    overrideStyles?: CSSObject
  }
> = ({ children, overrideStyles }) => {
  const theme = useTheme()
  const { settings } = useSettings()
  const { footerContentWidth } = settings

  const footerDetached = FOOTER_DETACHED === true
  const footerAttached = FOOTER_DETACHED === false
  const footerStatic = FOOTER_TYPE === 'static'
  const footerFixed = FOOTER_TYPE === 'fixed'
  const footerContentCompact = footerContentWidth === 'compact'
  const footerContentWide = footerContentWidth === 'full'

  const { layoutPadding, compactContentWidth } = useLayoutTokens()

  // Phase 4: per-component custom properties from the tenant theme
  const footerStyle = useComponentStyle('footer')
  // Phase 5: glassmorphism / neumorphism effect override
  const footerEffect = useComponentEffectConfig('footer')
  const effectStyles = buildLayoutSurfaceEffect(footerEffect, theme)

  const mergedOverrideStyles: CSSObject = {
    ...(footerStyle?.customProperties as CSSObject),
    ...effectStyles,
    ...overrideStyles,
  }

  return (
    <StyledFooter
      overrideStyles={mergedOverrideStyles}
      layoutPadding={layoutPadding}
      compactContentWidth={compactContentWidth}
      className={classnames(
        verticalLayoutClasses.footer,
        // 'is-full',
        {
          [verticalLayoutClasses.footerDetached]: footerDetached,
          [verticalLayoutClasses.footerAttached]: footerAttached,
          [verticalLayoutClasses.footerStatic]: footerStatic,
          [verticalLayoutClasses.footerFixed]: footerFixed,
          [verticalLayoutClasses.footerContentCompact]: footerContentCompact,
          [verticalLayoutClasses.footerContentWide]: footerContentWide,
        },
      )}
      style={{
        inlineSize: '100%',
      }}
    >
      <Box className={verticalLayoutClasses.footerContentWrapper}>
        {children || <FooterContent />}
      </Box>
    </StyledFooter>
  )
}

export default Footer
