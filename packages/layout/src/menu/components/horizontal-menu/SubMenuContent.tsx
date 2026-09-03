import React from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { getSubmenuMaxBlockSize } from '@cap/theme'
import type { ChildrenType, RootStylesType } from '../../types'
import StyledHorizontalSubMenuContent from '../../styles/horizontal/StyledHorizontalSubMenuContent'

export type SubMenuContentProps = React.HTMLAttributes<HTMLDivElement> &
  Partial<ChildrenType> & {
    $rootStyles?: RootStylesType['rootStyles']
    open?: boolean
    browserScroll?: boolean
    firstLevel?: boolean
    top?: number
  }

const SubMenuContent: React.ForwardRefRenderFunction<HTMLDivElement, SubMenuContentProps> = (
  props,
  ref,
) => {
  const { children, open, firstLevel, top, browserScroll, ...rest } = props

  return (
    <StyledHorizontalSubMenuContent
      ref={ref}
      firstLevel={firstLevel}
      open={open}
      top={top}
      browserScroll={browserScroll}
      {...rest}
    >
      {/* If browserScroll is false render PerfectScrollbar */}
      {!browserScroll ? (
        <PerfectScrollbar
          options={{ wheelPropagation: false, suppressScrollX: true }}
          style={{ maxBlockSize: getSubmenuMaxBlockSize(top) }}
        >
          <ul className='menu-ul'>{children}</ul>
        </PerfectScrollbar>
      ) : (
        <ul className='menu-ul'>{children}</ul>
      )}
    </StyledHorizontalSubMenuContent>
  )
}

export default React.forwardRef(SubMenuContent)
