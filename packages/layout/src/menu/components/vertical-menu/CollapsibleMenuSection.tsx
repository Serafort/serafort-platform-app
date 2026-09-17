import React from 'react'
import { useLocation } from 'react-router-dom'
import classnames from 'classnames'
import type { CSSObject } from '@emotion/styled'
import type { MenuSectionStyles } from './Menu'
import type { ChildrenType, RootStylesType } from '../../types'
import { useVerticalNav, useVerticalMenu } from '../../contexts/verticalNavContext'
import { menuClasses } from '../../utils/menuClasses'
import { confirmUrlInChildren } from '../../utils/menuUtils'
import StyledMenuIcon from '../../styles/StyledMenuIcon'
import StyledMenuSectionLabel from '../../styles/StyledMenuSectionLabel'
import StyledVerticalMenuSection from '../../styles/vertical/StyledVerticalMenuSection'
import StyledVerticalNavExpandIcon, {
  StyledVerticalNavExpandIconWrapper,
} from '../../styles/vertical/StyledVerticalNavExpandIcon'
import ChevronRight from '../../svg/ChevronRight'
import SubMenuContent from './SubMenuContent'

export type CollapsibleMenuSectionProps = Partial<ChildrenType> &
  RootStylesType & {
    id?: string
    label: React.ReactNode
    icon?: React.ReactElement
    className?: string
  }

const headerStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  inlineSize: '100%',
  position: 'relative',
  paddingBlock: '0.75rem',
  paddingInline: '1.25rem',
  userSelect: 'none',
}

/**
 * A top-level menu section that can be expanded or collapsed, so a sidebar
 * with many admin areas reads as a scannable, organized list instead of one
 * long list of every item from every section at once.
 *
 * Starts fully expanded - every section open, all at once - so the sidebar's
 * content is visible without an extra click; the header/chevron are still
 * live, so a section can be collapsed by hand for anyone who wants a shorter
 * list. Manual toggles are local to this component instance - the sidebar
 * doesn't remount across route changes, so that state naturally survives
 * navigation for the rest of the session, and resets to "everything open" on
 * the next full page load.
 */
const CollapsibleMenuSection: React.FC<CollapsibleMenuSectionProps> = ({
  label,
  icon,
  children,
  rootStyles,
  className,
}) => {
  const location = useLocation()
  const { isCollapsed, isHovered } = useVerticalNav()
  const { menuSectionStyles, transitionDuration, collapsedMenuSectionLabel, textTruncate } =
    useVerticalMenu()

  const hasActiveChild = React.useMemo(
    () => confirmUrlInChildren(children, location.pathname),
    [children, location.pathname],
  )

  const [open, setOpen] = React.useState<boolean>(true)

  React.useEffect(() => {
    if (hasActiveChild) setOpen(true)
  }, [hasActiveChild])

  const contentRef = React.useRef<HTMLDivElement>(null)

  // Collapsed-and-not-hovered is the icon-only rail state: there's no room
  // for a label or a chevron, so the toggle interaction doesn't apply there -
  // fall back to always showing every item, same as the old static section.
  const showHeader = !(isCollapsed && !isHovered)

  const getStyles = (element: keyof MenuSectionStyles): CSSObject | undefined =>
    menuSectionStyles ? (menuSectionStyles[element] as CSSObject | undefined) : undefined

  // Section labels come from nav config as either a translated string or a
  // raw, un-translated i18n key (e.g. "governance", "systemPlatform") when a
  // translation is still missing - capitalize renders either case as a
  // proper-looking heading instead of an all-lowercase key.
  const labelStyles: CSSObject = { textTransform: 'capitalize', ...getStyles('label') }

  const handleToggle = () => {
    if (showHeader) setOpen((prev) => !prev)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!showHeader) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleToggle()
    }
  }

  return (
    <StyledVerticalMenuSection
      // StyledVerticalMenuSection is `display: flex` with no explicit
      // direction, i.e. row. The original static MenuSection got away with
      // that because it only ever had one direct child (a wrapping <ul>);
      // this component has two (the header, then the collapsible content),
      // which a row layout lays out side by side - squeezing the nav items
      // into a sliver next to the header instead of stacking under it.
      rootStyles={{ flexDirection: 'column', ...rootStyles }}
      menuSectionStyles={getStyles('root')}
      className={classnames(menuClasses.menuSectionRoot, { [menuClasses.open]: open }, className)}
    >
      <div
        className={menuClasses.menuSectionContent}
        style={headerStyles}
        role={showHeader ? 'button' : undefined}
        tabIndex={showHeader ? 0 : undefined}
        aria-expanded={showHeader ? open : undefined}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
      >
        {icon && (
          <StyledMenuIcon className={menuClasses.icon} $rootStyles={getStyles('icon')}>
            {icon}
          </StyledMenuIcon>
        )}
        {collapsedMenuSectionLabel && isCollapsed && !isHovered ? (
          <StyledMenuSectionLabel
            $isCollapsed={isCollapsed}
            $isHovered={isHovered}
            className={menuClasses.menuSectionLabel}
            $rootStyles={labelStyles}
            $textTruncate={textTruncate}
          >
            {collapsedMenuSectionLabel}
          </StyledMenuSectionLabel>
        ) : (
          label && (
            <StyledMenuSectionLabel
              $isCollapsed={isCollapsed}
              $isHovered={isHovered}
              className={menuClasses.menuSectionLabel}
              $rootStyles={labelStyles}
              $textTruncate={textTruncate}
            >
              {label}
            </StyledMenuSectionLabel>
          )
        )}
        {showHeader && (
          <StyledVerticalNavExpandIconWrapper
            className={menuClasses.subMenuExpandIcon}
            rootStyles={{ marginInlineStart: 'auto' }}
          >
            <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
              <ChevronRight fontSize='1rem' />
            </StyledVerticalNavExpandIcon>
          </StyledVerticalNavExpandIconWrapper>
        )}
      </div>
      <SubMenuContent
        ref={contentRef}
        open={showHeader ? open : true}
        level={0}
        isCollapsed={false}
        transitionDuration={transitionDuration}
        className={menuClasses.subMenuContent}
      >
        {children}
      </SubMenuContent>
    </StyledVerticalMenuSection>
  )
}

export default CollapsibleMenuSection
