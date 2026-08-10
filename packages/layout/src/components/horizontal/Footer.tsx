import { useTheme } from '@mui/material/styles'
import type { ChildrenType } from '@cap/shared-types'
import { useSettings } from '@cap/platform-store'
// themeConfig.footer defaults inlined to avoid circular import: type='static'
const FOOTER_TYPE: string = 'static'
import { horizontalLayoutClasses } from '../../utils/layoutClasses'
import StyledFooter from '../../styles/horizontal/StyledFooter'
import classnames from 'classnames'
import { useLayoutTokens } from '../../hooks/useLayoutTokens'
import FooterContent from './FooterContent'

import type { CSSObject } from '@emotion/styled'
import { useComponentStyle, useComponentEffectConfig } from '@cap/theme'
import { buildLayoutSurfaceEffect } from '../../utils/buildLayoutSurfaceEffect'
type Props = Partial<ChildrenType> & {
  overrideStyles?: CSSObject
}

const Footer = (props: Props) => {
  const theme = useTheme()
  const { children, overrideStyles } = props
  const { settings } = useSettings()
  const { footerContentWidth } = settings
  const footerStatic = FOOTER_TYPE === 'static'
  const footerFixed = FOOTER_TYPE === 'fixed'
  const footerContentCompact = footerContentWidth === 'compact'
  const footerContentWide = footerContentWidth === 'full'

  const { layoutPadding, compactContentWidth } = useLayoutTokens()

  // Phase 4 & 5: tenant-driven per-component styles and effects
  const footerStyle = useComponentStyle('footer')
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
      className={classnames(horizontalLayoutClasses.footer, {
        [horizontalLayoutClasses.footerStatic]: footerStatic,
        [horizontalLayoutClasses.footerFixed]: footerFixed,
        [horizontalLayoutClasses.footerContentCompact]: footerContentCompact,
        [horizontalLayoutClasses.footerContentWide]: footerContentWide,
      })}
    >
      <div className={horizontalLayoutClasses.footerContentWrapper}>
        {children || <FooterContent />}
      </div>
    </StyledFooter>
  )
}

export default Footer
