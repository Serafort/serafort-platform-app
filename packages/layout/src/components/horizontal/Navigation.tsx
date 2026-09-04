import styled from '@emotion/styled'
import classnames from 'classnames'
import { useSettings } from '@cap/platform-store'
import { useHorizontalNav } from '../../menu/contexts/horizontalNavContext'
import { useLayoutTokens } from '../../hooks/useLayoutTokens'
import { horizontalLayoutClasses } from '../../utils/layoutClasses'

type StyledDivProps = {
  isContentCompact: boolean
  isBreakpointReached?: boolean
  layoutPadding: string
  compactContentWidth: number
}

const StyledDiv = styled.div<StyledDivProps>`
  ${({ isContentCompact, isBreakpointReached, layoutPadding, compactContentWidth }) =>
    !isBreakpointReached &&
    `
    /* layoutPadding (theme spacing.lg, 24px) is the page-content gutter -
       right for aligning the menu row's left/right edges with the content
       below, but far too tall applied to all four sides of a single-row
       menu bar. Keep it inline-only and use a small block padding instead. */
    padding-inline: ${layoutPadding};
    padding-block: 0.375rem;

    ${
      isContentCompact &&
      `
      margin-inline: auto;
      max-inline-size: ${compactContentWidth}px;
    `
    }
  `}
`

const Navigation = ({ menu }: { menu: React.ReactNode }) => {
  const { isBreakpointReached } = useHorizontalNav()
  const { settings } = useSettings()
  const headerContentCompact = settings.navbarContentWidth === 'compact'
  const { layoutPadding, compactContentWidth } = useLayoutTokens()

  return (
    <div
      {...(!isBreakpointReached && {
        className: classnames(horizontalLayoutClasses.navigation, 'relative flex border-bs'),
      })}
    >
      <StyledDiv
        isContentCompact={headerContentCompact}
        isBreakpointReached={isBreakpointReached}
        layoutPadding={layoutPadding}
        compactContentWidth={compactContentWidth}
        {...(!isBreakpointReached && {
          className: classnames(
            horizontalLayoutClasses.navigationContentWrapper,
            'flex items-center is-full plb-2',
          ),
        })}
      >
        {menu}
      </StyledDiv>
    </div>
  )
}

export default Navigation
