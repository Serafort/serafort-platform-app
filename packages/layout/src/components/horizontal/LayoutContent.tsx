import React from 'react'
import type { ChildrenType } from '@cap/shared-types'
import { useSettings } from '@cap/platform-store'
import { ErrorBoundary } from '@cap/theme'
import { horizontalLayoutClasses } from '../../utils/layoutClasses'
import StyledMain from '../../styles/shared/StyledMain'
import classnames from 'classnames'
import { useLayoutTokens } from '../../hooks/useLayoutTokens'

const LayoutContent: React.FC<ChildrenType> = ({ children }) => {
  const { settings } = useSettings()
  const contentCompact = settings.contentWidth === 'compact'
  const contentWide = settings.contentWidth === 'full'

  const { layoutPadding, compactContentWidth } = useLayoutTokens()

  return (
    <StyledMain
      id="main-content"
      tabIndex={-1}
      role="main"
      isContentCompact={contentCompact}
      layoutPadding={layoutPadding}
      compactContentWidth={compactContentWidth}
      className={classnames(horizontalLayoutClasses.content, 'flex-auto', {
        [`${horizontalLayoutClasses.contentCompact} is-full`]: contentCompact,
        [horizontalLayoutClasses.contentWide]: contentWide,
      })}
      style={{
        outline: 'none',
      }}
    >
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </StyledMain>
  )
}

export default LayoutContent
