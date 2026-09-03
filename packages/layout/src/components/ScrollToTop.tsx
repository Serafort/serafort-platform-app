import type { ReactNode } from 'react'
import Zoom from '@mui/material/Zoom'
import { styled } from '@mui/material/styles'
import useScrollTrigger from '@mui/material/useScrollTrigger'

export interface ScrollToTopProps {
  className?: string
  children: ReactNode
  insetInlineEnd?: number | string
  insetBlockEnd?: number | string
  threshold?: number
}

interface ScrollToTopStyledProps {
  insetInlineEnd?: number | string
  insetBlockEnd?: number | string
}

const ScrollToTopStyled = styled('div')<ScrollToTopStyledProps>(({ theme, insetInlineEnd, insetBlockEnd }) => ({
  zIndex: theme.zIndex.fab,
  position: 'fixed',
  insetInlineEnd: typeof insetInlineEnd === 'number' ? theme.spacing(insetInlineEnd) : (insetInlineEnd ?? theme.spacing(10)),
  insetBlockEnd: typeof insetBlockEnd === 'number' ? theme.spacing(insetBlockEnd) : (insetBlockEnd ?? theme.spacing(14)),
}))

const ScrollToTop = (props: ScrollToTopProps) => {
  // Props
  const { children, className, insetInlineEnd, insetBlockEnd, threshold = 400 } = props

  // Hooks
  // init trigger
  const trigger = useScrollTrigger({
    threshold,
    disableHysteresis: true,
  })

  const handleClick = () => {
    const anchor = document.querySelector('body')

    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <Zoom in={trigger}>
      <ScrollToTopStyled
        className={className}
        onClick={handleClick}
        role='presentation'
        insetInlineEnd={insetInlineEnd}
        insetBlockEnd={insetBlockEnd}
      >
        {children}
      </ScrollToTopStyled>
    </Zoom>
  )
}

export default ScrollToTop
