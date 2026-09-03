import React from 'react'
import classnames from 'classnames'
import type { ChildrenType } from '@cap/shared-types'
import { HorizontalNavContext } from '../menu/contexts/horizontalNavContextCore'
import LayoutContent from '../components/horizontal/LayoutContent'
import { horizontalLayoutClasses } from '../utils/layoutClasses'

const HorizontalLayout: React.FC<
  ChildrenType & {
    header?: React.ReactNode
    footer?: React.ReactNode
  }
> = ({ header, footer, children }) => {
  return (
    <div className={classnames(horizontalLayoutClasses.root, 'flex flex-auto')}>
      <HorizontalNavContext.Provider
        value={{ isBreakpointReached: false, updateIsBreakpointReached: () => {} }}
      >
        <div
          className={classnames(horizontalLayoutClasses.contentWrapper, 'flex flex-col is-full')}
        >
          {header || null}
          <LayoutContent>{children}</LayoutContent>
          {footer || null}
        </div>
      </HorizontalNavContext.Provider>
    </div>
  )
}

export default HorizontalLayout
