import React from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import type { VerticalMenuContextProps } from '../../contexts/verticalMenuContext'
import type { ChildrenType, RootStylesType } from '../../types'
import StyledSubMenuContent from '../../styles/StyledSubMenuContent'

export type SubMenuContentProps = React.HTMLAttributes<HTMLDivElement> &
  RootStylesType &
  Partial<ChildrenType> & {
    open?: boolean
    openWhenCollapsed?: boolean
    openWhenHovered?: boolean
    transitionDuration?: VerticalMenuContextProps['transitionDuration']
    isPopoutWhenCollapsed?: boolean
    level?: number
    isCollapsed?: boolean
    isHovered?: boolean
    browserScroll?: boolean
  }

const SubMenuContent: React.ForwardRefRenderFunction<HTMLDivElement, SubMenuContentProps> = (
  props,
  ref,
) => {
  const {
    children,
    open,
    level,
    isCollapsed,
    isHovered,
    transitionDuration,
    isPopoutWhenCollapsed,
    openWhenCollapsed,
    browserScroll,
    ...rest
  } = props
  const [mounted, setMounted] = React.useState<boolean>(false)
  const SubMenuContentRef = ref as React.MutableRefObject<HTMLDivElement>

  React.useEffect(() => {
    if (mounted) {
      if (open || (open && isHovered)) {
        const target = SubMenuContentRef?.current

        if (target) {
          target.style.display = 'block'
          target.style.overflow = 'hidden'
          target.style.blockSize = 'auto'
          const height = target.offsetHeight

          target.style.blockSize = '0px'
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          target.offsetHeight

          target.style.blockSize = `${height}px`

          setTimeout(() => {
            target.style.overflow = 'auto'
            target.style.blockSize = 'auto'
          }, transitionDuration)
        }
      } else {
        const target = SubMenuContentRef?.current

        if (target) {
          target.style.overflow = 'hidden'
          target.style.blockSize = `${target.offsetHeight}px`
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          target.offsetHeight
          target.style.blockSize = '0px'

          setTimeout(() => {
            target.style.overflow = 'auto'
            target.style.display = 'none'
          }, transitionDuration)
        }
      }
    }
  }, [open, mounted, SubMenuContentRef, isHovered, transitionDuration])

  React.useEffect(() => {
    setMounted(true)
  }, [isHovered])

  return (
    <StyledSubMenuContent
      ref={ref}
      level={level}
      isCollapsed={isCollapsed}
      isHovered={isHovered}
      open={open}
      openWhenCollapsed={openWhenCollapsed}
      isPopoutWhenCollapsed={isPopoutWhenCollapsed}
      transitionDuration={transitionDuration}
      browserScroll={browserScroll}
      {...rest}
    >
      {/* If browserScroll is false render PerfectScrollbar */}
      {!browserScroll && level === 0 && isPopoutWhenCollapsed && isCollapsed ? (
        <PerfectScrollbar
          options={{ wheelPropagation: false, suppressScrollX: true }}
          style={{ maxBlockSize: '100dvh' }}
        >
          <ul className='menu-ul'>{children}</ul>
        </PerfectScrollbar>
      ) : (
        <ul className='menu-ul'>{children}</ul>
      )}
    </StyledSubMenuContent>
  )
}

export default React.forwardRef(SubMenuContent)
