import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MenuItem, SubMenu, MenuSection } from '../vertical-menu'
import type { NavVariant, Dictionary } from '@cap/shared-types'
import { useNavigationMenu } from '@cap/platform-core'
import { MenuTreeAdapter, ProcessedNavItem } from '../adapters/MenuTreeAdapter'

interface Props {
  variant: NavVariant
  dictionary: Dictionary
}

/**
 * ModuleMenuRenderer
 *
 * The 'connector' that snaps module-declared navigation into the menu.
 * Delegates tree transformation to MenuTreeAdapter and renders pure UI components.
 */

const ModuleMenuRenderer: React.FC<Props> = ({ variant, dictionary }) => {
  const { t } = useTranslation()
  const sortedItems = useNavigationMenu(variant)

  const renderedSections = React.useMemo(() => {
    const sections = MenuTreeAdapter.buildMenuTree(sortedItems, dictionary, t)

    const renderProcessedItem = (item: ProcessedNavItem): React.ReactNode => {
      const icon = item.icon ? (
        React.isValidElement(item.icon) ? (
          item.icon
        ) : typeof item.icon === 'string' ? (
          item.icon.startsWith('tabler-') ? (
            <i className={item.icon} />
          ) : (
            <i className={`tabler-${item.icon}`} />
          )
        ) : undefined
      ) : undefined

      if (item.children && item.children.length > 0) {
        return (
          <SubMenu key={item.id} label={item.label} icon={icon}>
            {item.children.map((child) => renderProcessedItem(child))}
          </SubMenu>
        )
      }

      return (
        <MenuItem key={item.id} component={item.path ? <Link to={item.path} /> : 'div'} icon={icon}>
          {item.label}
        </MenuItem>
      )
    }

    return sections.map((section, idx) => {
      if (section.label) {
        return (
          <MenuSection key={section.id || `section_${idx}`} label={section.label}>
            {section.items.map(renderProcessedItem)}
          </MenuSection>
        )
      }
      return section.items.map(renderProcessedItem)
    })
  }, [sortedItems, dictionary, t])

  return <>{renderedSections}</>
}

export default React.memo(ModuleMenuRenderer)
